import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

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

interface ProductData {
  slug: string;
  brandName?: string;
}

// Brand'ni topish yoki yaratish
async function findOrCreateBrand(brandName: string): Promise<string | null> {
  if (!brandName) return null;

  try {
    // Brand'ni topish - turli variantlarni tekshirish
    let brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { name_uz: { equals: brandName, mode: 'insensitive' } },
          { name_ru: { equals: brandName, mode: 'insensitive' } },
          { slug: { equals: brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), mode: 'insensitive' } },
        ],
      },
    });

    if (!brand) {
      // Brand yaratish
      const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      brand = await prisma.brand.create({
        data: {
          name_uz: brandName,
          name_ru: brandName,
          slug: slug,
        },
      });
      console.log(`  ✓ Yangi brand yaratildi: ${brandName} (ID: ${brand.id})`);
    } else {
      console.log(`  ✓ Brand topildi: ${brandName} (ID: ${brand.id})`);
    }

    return brand.id;
  } catch (error) {
    console.error(`  ✗ Brand yaratishda xatolik (${brandName}):`, error);
    return null;
  }
}

// Mahsulotni brand'ga ajratish
async function assignProductToBrand(slug: string, brandName: string, brandId: string): Promise<boolean> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      console.log(`    ⚠ Mahsulot topilmadi: ${slug}`);
      return false;
    }

    // Agar brand allaqachon to'g'ri bo'lsa, o'tkazib yuborish
    if (product.brandId === brandId) {
      console.log(`    ℹ️  Brand allaqachon to'g'ri: ${slug}`);
      return true;
    }

    // Brand'ni yangilash
    await prisma.product.update({
      where: { id: product.id },
      data: {
        brand: { connect: { id: brandId } },
      },
    });

    console.log(`    ✅ Brand ajratildi: ${product.name_uz} → ${brandName}`);
    return true;
  } catch (error) {
    console.error(`    ❌ Brand ajratishda xatolik (${slug}):`, error);
    return false;
  }
}

// Asosiy funksiya
async function assignProductsToBrands() {
  try {
    console.log('=== Mahsulotlarni brand\'larga ajratish ===\n');

    // JSON faylni o'qish
    const possiblePaths = [
      path.join(process.cwd(), 'products-to-import.json'),
      path.join(process.cwd(), '..', 'products-to-import.json'),
      path.join(process.cwd(), '..', '..', 'products-to-import.json'),
      '/root/acoustic.uz/products-to-import.json',
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
      console.error('❌ products-to-import.json fayli topilmadi.');
      process.exit(1);
    }

    console.log(`JSON fayl o'qilmoqda: ${jsonFilePath}`);
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const products: ProductData[] = JSON.parse(fileContent);

    console.log(`✅ ${products.length} ta mahsulot topildi\n`);

    // Brand'lar bo'yicha guruhlash
    const productsByBrand = new Map<string, ProductData[]>();
    
    for (const product of products) {
      if (product.brandName && product.slug) {
        const brandName = product.brandName.trim();
        if (!productsByBrand.has(brandName)) {
          productsByBrand.set(brandName, []);
        }
        productsByBrand.get(brandName)!.push(product);
      }
    }

    console.log(`📊 ${productsByBrand.size} ta brand topildi:\n`);
    for (const [brandName, brandProducts] of productsByBrand.entries()) {
      console.log(`  - ${brandName}: ${brandProducts.length} ta mahsulot`);
    }
    console.log('');

    // Har bir brand uchun mahsulotlarni ajratish
    let totalSuccess = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const [brandName, brandProducts] of productsByBrand.entries()) {
      console.log(`\n🔹 Brand: ${brandName} (${brandProducts.length} ta mahsulot)`);
      console.log('─'.repeat(50));

      // Brand'ni topish yoki yaratish
      const brandId = await findOrCreateBrand(brandName);
      
      if (!brandId) {
        console.log(`  ❌ Brand yaratilmadi, mahsulotlar o'tkazib yuborildi`);
        totalSkipped += brandProducts.length;
        continue;
      }

      // Har bir mahsulotni brand'ga ajratish
      let brandSuccess = 0;
      let brandErrors = 0;

      for (let i = 0; i < brandProducts.length; i++) {
        const product = brandProducts[i];
        const success = await assignProductToBrand(product.slug, brandName, brandId);
        
        if (success) {
          brandSuccess++;
          totalSuccess++;
        } else {
          brandErrors++;
          totalErrors++;
        }
      }

      console.log(`  📊 Natija: ✅ ${brandSuccess} ta, ❌ ${brandErrors} ta`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('=== Umumiy Natijalar ===');
    console.log(`✅ Muvaffaqiyatli: ${totalSuccess} ta`);
    console.log(`⚠️  O'tkazib yuborilgan: ${totalSkipped} ta`);
    console.log(`❌ Xatoliklar: ${totalErrors} ta`);
    console.log(`📊 Jami mahsulotlar: ${products.length} ta`);
    console.log(`📊 Jami brand'lar: ${productsByBrand.size} ta\n`);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
assignProductsToBrands()
  .then(() => {
    console.log('✅ Ajratish yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });
