import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

console.log('Script boshlandi...');

// .env faylini yuklash
function loadEnvFile() {
  const envPaths = [
    path.join(process.cwd(), 'apps', 'backend', '.env'),
    path.join(process.cwd(), '.env'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const equalIndex = trimmedLine.indexOf('=');
          if (equalIndex > 0) {
            const key = trimmedLine.substring(0, equalIndex).trim();
            const value = trimmedLine.substring(equalIndex + 1).trim();
            const cleanValue = value.replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = cleanValue;
            }
          }
        }
      }
      console.log(`✓ .env fayl yuklandi: ${envPath}`);
      return;
    }
  }
  
  console.warn('⚠ .env fayl topilmadi, environment variable\'lardan foydalanilmoqda');
}

loadEnvFile();

if (!process.env.DATABASE_URL) {
  console.error('❌ Xatolik: DATABASE_URL environment variable topilmadi!');
  process.exit(1);
}

const prisma = new PrismaClient();

// Brand'ni topish yoki yaratish
async function findOrCreateSigniaBrand(): Promise<string> {
  const brandName = 'Signia';
  
  try {
    // Brand'ni topish
    let brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { name: { equals: brandName, mode: 'insensitive' } },
          { slug: { equals: 'signia', mode: 'insensitive' } },
        ],
      },
    });

    if (!brand) {
      // Brand yaratish
      const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      brand = await prisma.brand.create({
        data: {
          name: brandName,
          slug: slug,
        },
      });
      console.log(`✓ Yangi brand yaratildi: ${brandName} (ID: ${brand.id})`);
    } else {
      console.log(`✓ Brand topildi: ${brandName} (ID: ${brand.id})`);
    }

    return brand.id;
  } catch (error) {
    console.error(`✗ Brand yaratishda xatolik (${brandName}):`, error);
    throw error;
  }
}

// Asosiy funksiya
async function setSigniaBrand() {
  try {
    console.log('=== Signia brandni mahsulotlarga belgilash ===\n');

    // JSON faylni o'qish - bir nechta yo'lni tekshirish
    const scriptDir = path.dirname(__filename || process.argv[1] || '.');
    const possiblePaths = [
      path.join(process.cwd(), 'products-to-import.json'), // Hozirgi papkadan
      path.join(process.cwd(), '..', 'products-to-import.json'), // Bir daraja yuqoridan
      path.join(process.cwd(), '..', '..', 'products-to-import.json'), // Ildizdan (apps/backend dan)
      path.join(scriptDir, '..', 'products-to-import.json'), // Script papkasidan
      '/root/acoustic.uz/products-to-import.json', // To'g'ridan-to'g'ri yo'l
    ];
    
    let jsonFilePath: string | null = null;
    for (const possiblePath of possiblePaths) {
      const normalizedPath = path.resolve(possiblePath);
      if (fs.existsSync(normalizedPath)) {
        jsonFilePath = normalizedPath;
        break;
      }
    }
    
    if (!jsonFilePath) {
      console.error('❌ products-to-import.json fayli topilmadi');
      throw new Error(`Fayl topilmadi: products-to-import.json`);
    }

    console.log(`JSON fayl o'qilmoqda: ${jsonFilePath}`);
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const products: Array<{ slug: string; brandName?: string }> = JSON.parse(fileContent);

    // Signia brand'ni topish yoki yaratish
    const signiaBrandId = await findOrCreateSigniaBrand();
    console.log('');

    // Signia brandName'ga ega bo'lgan mahsulotlarni topish
    const signiaProducts = products.filter(p => p.brandName === 'Signia');
    console.log(`✓ JSON faylda ${signiaProducts.length} ta Signia mahsuloti topildi\n`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let alreadyHasBrandCount = 0;

    // Har bir mahsulotni tekshirish va yangilash
    for (const productData of signiaProducts) {
      try {
        // Slug bo'yicha mahsulotni topish
        const product = await prisma.product.findUnique({
          where: { slug: productData.slug },
          select: { id: true, name_uz: true, brandId: true },
        });

        if (!product) {
          console.log(`⚠ Mahsulot topilmadi: ${productData.slug}`);
          notFoundCount++;
          continue;
        }

        // Agar allaqachon brand bor bo'lsa, o'tkazib yuborish
        if (product.brandId) {
          console.log(`⊘ Mahsulotda allaqachon brand bor: ${product.name_uz} (brandId: ${product.brandId})`);
          alreadyHasBrandCount++;
          continue;
        }

        // Brand'ni belgilash
        await prisma.product.update({
          where: { id: product.id },
          data: { brandId: signiaBrandId },
        });

        console.log(`✓ Brand belgilandi: ${product.name_uz} (slug: ${productData.slug})`);
        updatedCount++;
      } catch (error) {
        console.error(`✗ Xatolik (${productData.slug}):`, error);
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`✅ Yangilandi: ${updatedCount} ta`);
    console.log(`⊘ Allaqachon brand bor: ${alreadyHasBrandCount} ta`);
    console.log(`⚠ Topilmadi: ${notFoundCount} ta`);
    console.log(`📊 Jami tekshirildi: ${signiaProducts.length} ta\n`);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
setSigniaBrand()
  .then(() => {
    console.log('✅ Script yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });
