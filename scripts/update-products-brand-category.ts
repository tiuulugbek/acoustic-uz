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

interface ProductUpdateData {
  slug: string;
  brandName?: string;
  categoryName?: string;
  categorySlug?: string;
  catalogIds?: string[];
  catalogSlugs?: string[];
}

// Brand'ni topish yoki yaratish
async function findOrCreateBrand(brandName: string): Promise<string | null> {
  if (!brandName) return null;

  try {
    let brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { name_uz: { equals: brandName, mode: 'insensitive' } },
          { name_ru: { equals: brandName, mode: 'insensitive' } },
          { slug: { equals: brandName.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } },
        ],
      },
    });

    if (!brand) {
      const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      brand = await prisma.brand.create({
        data: {
          name_uz: brandName,
          name_ru: brandName,
          slug: slug,
        },
      });
      console.log(`  ✓ Yangi brand yaratildi: ${brandName}`);
    } else {
      console.log(`  ✓ Brand topildi: ${brandName} (ID: ${brand.id})`);
    }

    return brand.id;
  } catch (error) {
    console.error(`  ✗ Brand yaratishda xatolik (${brandName}):`, error);
    return null;
  }
}

// Kategoriyani topish yoki yaratish
async function findOrCreateCategory(categoryName: string, categorySlug?: string): Promise<string | null> {
  if (!categoryName) return null;

  try {
    const slug = categorySlug || categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    let category = await prisma.productCategory.findFirst({
      where: {
        OR: [
          { name_uz: { equals: categoryName, mode: 'insensitive' } },
          { name_ru: { equals: categoryName, mode: 'insensitive' } },
          { slug: { equals: slug, mode: 'insensitive' } },
        ],
      },
    });

    if (!category) {
      category = await prisma.productCategory.create({
        data: {
          name_uz: categoryName,
          name_ru: categoryName,
          slug: slug,
        },
      });
      console.log(`  ✓ Yangi kategoriya yaratildi: ${categoryName}`);
    } else {
      console.log(`  ✓ Kategoriya topildi: ${categoryName} (ID: ${category.id})`);
    }

    return category.id;
  } catch (error) {
    console.error(`  ✗ Kategoriya yaratishda xatolik (${categoryName}):`, error);
    return null;
  }
}

// Catalog'larni topish
async function findCatalogsBySlugs(catalogSlugs: string[]): Promise<string[]> {
  if (!catalogSlugs || catalogSlugs.length === 0) return [];

  try {
    const catalogs = await prisma.catalog.findMany({
      where: {
        slug: { in: catalogSlugs },
      },
      select: { id: true },
    });

    return catalogs.map(c => c.id);
  } catch (error) {
    console.error(`  ✗ Catalog'larni topishda xatolik:`, error);
    return [];
  }
}

// Mahsulotni yangilash
async function updateProduct(productData: ProductUpdateData, index: number, total: number): Promise<void> {
  console.log(`\n[${index + 1}/${total}] Mahsulot: ${productData.slug}`);

  try {
    // Mahsulotni topish
    const product = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (!product) {
      console.log(`  ⚠ Mahsulot topilmadi: ${productData.slug}`);
      return;
    }

    // Brand'ni topish yoki yaratish
    let brandId: string | null = null;
    if (productData.brandName) {
      brandId = await findOrCreateBrand(productData.brandName);
    }

    // Kategoriyani topish yoki yaratish
    let categoryId: string | null = null;
    if (productData.categoryName) {
      categoryId = await findOrCreateCategory(productData.categoryName, productData.categorySlug);
    }

    // Catalog ID'larni topish
    let catalogIds: string[] = [];
    if (productData.catalogSlugs && productData.catalogSlugs.length > 0) {
      catalogIds = await findCatalogsBySlugs(productData.catalogSlugs);
    } else if (productData.catalogIds && productData.catalogIds.length > 0) {
      catalogIds = productData.catalogIds;
    }

    // Yangilash ma'lumotlarini tayyorlash
    const updateData: any = {};
    
    if (brandId && product.brandId !== brandId) {
      updateData.brand = { connect: { id: brandId } };
      console.log(`  ✓ Brand yangilandi`);
    }

    if (categoryId && product.categoryId !== categoryId) {
      updateData.category = { connect: { id: categoryId } };
      console.log(`  ✓ Kategoriya yangilandi`);
    }

    if (catalogIds.length > 0) {
      // Mavjud catalog'larni olish
      const currentCatalogs = await prisma.product.findUnique({
        where: { id: product.id },
        include: { catalogs: { select: { id: true } } },
      });

      const currentCatalogIds = currentCatalogs?.catalogs.map(c => c.id) || [];
      const newCatalogIds = catalogIds.filter(id => !currentCatalogIds.includes(id));

      if (newCatalogIds.length > 0) {
        updateData.catalogs = {
          connect: newCatalogIds.map(id => ({ id })),
        };
        console.log(`  ✓ ${newCatalogIds.length} ta catalog qo'shildi`);
      }
    }

    // Agar yangilanish kerak bo'lsa
    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updateData,
      });
      console.log(`  ✅ Mahsulot yangilandi: ${product.name_uz}`);
    } else {
      console.log(`  ℹ️  Yangilanish kerak emas`);
    }
  } catch (error) {
    console.error(`  ❌ Mahsulot yangilashda xatolik:`, error);
    throw error;
  }
}

// Asosiy funksiya
async function updateProducts() {
  try {
    console.log('=== Mahsulotlarni brand va kategoriyalar bilan yangilash ===\n');

    // JSON faylni o'qish
    const jsonFilePath = path.join(process.cwd(), 'products-to-import.json');
    
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`Fayl topilmadi: ${jsonFilePath}`);
    }

    console.log(`JSON fayl o'qilmoqda: ${jsonFilePath}`);
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const products: ProductUpdateData[] = JSON.parse(fileContent);

    console.log(`✅ ${products.length} ta mahsulot topildi\n`);

    // Har bir mahsulotni yangilash
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < products.length; i++) {
      try {
        const product = products[i];
        if (!product.slug) {
          console.log(`\n[${i + 1}/${products.length}] ⚠️  Slug yo'q, o'tkazib yuborildi`);
          skippedCount++;
          continue;
        }

        await updateProduct(product, i, products.length);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`\n❌ Mahsulot yangilashda xatolik (${i + 1}/${products.length}):`, error);
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`✅ Muvaffaqiyatli: ${successCount} ta`);
    console.log(`⚠️  O'tkazib yuborilgan: ${skippedCount} ta`);
    console.log(`❌ Xatoliklar: ${errorCount} ta`);
    console.log(`📊 Jami: ${products.length} ta\n`);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
updateProducts()
  .then(() => {
    console.log('✅ Yangilash yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });
