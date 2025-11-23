/**
 * Mahsulotlarni import qilish scripti
 * Rasmlar hajmi katta bo'lsa, faqat mahsulot ma'lumotlarini kiritadi
 * Rasmlarni keyinroq qo'shish mumkin
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

interface ExtractedProduct {
  id: string;
  title_ru: string;
  slug: string;
  content_ru: string;
  excerpt_ru: string;
  price: string;
  sale_price: string;
  stock: string;
  sku: string;
  weight: string;
  status: string;
  image_gallery: string;
  thumbnail_id: string;
  meta: Record<string, string>;
}

interface ExtractedImage {
  title: string;
  guid: string;
  file: string;
  mime_type: string;
}

async function importProducts() {
  try {
    console.log('Mahsulotlarni import qilish boshlandi...');

    // JSON fayllarni o'qish
    const productsData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'products_extracted.json'),
        'utf-8'
      )
    );

    const imagesData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'images_analysis.json'),
        'utf-8'
      )
    );

    const products: ExtractedProduct[] = productsData.products || [];
    const images: Record<string, ExtractedImage> = imagesData.attachments || {};

    console.log(`Topilgan mahsulotlar: ${products.length} ta`);
    console.log(`Topilgan rasmlar: ${Object.keys(images).length} ta`);

    // Brendlar va kategoriyalarni yaratish/yuklash
    // Hozircha oddiy brendlar yaratamiz
    const brands = await createOrGetBrands(products);
    const categories = await createOrGetCategories(products);

    // Mahsulotlarni import qilish
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Slug ni tekshirish
        if (!product.slug || product.slug.trim() === '') {
          console.log(`Mahsulot ${product.id}: slug yo'q, o'tkazib yuborildi`);
          skipped++;
          continue;
        }

        // Slug mavjudligini tekshirish
        const existing = await prisma.product.findUnique({
          where: { slug: product.slug },
        });

        if (existing) {
          console.log(`Mahsulot ${product.id} (${product.slug}): allaqachon mavjud`);
          skipped++;
          continue;
        }

        // Brendni topish
        const brand = findBrand(product, brands);

        // Kategoriyani topish
        const category = findCategory(product, categories);

        // Rasm URL ni yaratish (agar thumbnail_id bor bo'lsa)
        // Rasmlar hajmi katta bo'lsa, faqat URL ni saqlaymiz, keyinroq Media jadvaliga qo'shiladi
        let imageUrl = null;
        if (product.thumbnail_id && images[product.thumbnail_id]) {
          const imageFile = images[product.thumbnail_id].file;
          if (imageFile) {
            // Eski sayt URL formatida - keyinroq Media jadvaliga qo'shiladi
            imageUrl = `https://old.acoustic.uz/wp-content/uploads/${imageFile}`;
          }
        }

        // Mahsulotni yaratish
        const newProduct = await prisma.product.create({
          data: {
            name_uz: product.title_ru || 'N/A', // O'zbekcha tarjima keyinroq qo'shiladi
            name_ru: product.title_ru || 'N/A',
            slug: product.slug,
            description_uz: product.content_ru || null,
            description_ru: product.content_ru || null,
            price: product.price ? parseFloat(product.price) : null,
            stock: product.stock ? parseInt(product.stock) : 0,
            brandId: brand?.id || null,
            categoryId: category?.id || null,
            status: product.status === 'publish' ? 'published' : 'draft',
            // Boshqa maydonlar keyinroq to'ldiriladi
            galleryUrls: imageUrl ? [imageUrl] : [], // Rasm URL - keyinroq Media jadvaliga qo'shiladi
            // Meta ma'lumotlarni saqlash
            specsText: JSON.stringify(product.meta),
            // O'zbekcha tarjimalar
            name_uz: product.title_uz || product.title_ru || 'N/A', // O'zbekcha tarjima yoki ruscha nom
          },
        });

        console.log(`Mahsulot yaratildi: ${newProduct.id} - ${newProduct.name_ru}`);
        imported++;

        // Rasm haqida eslatma
        if (imageUrl) {
          console.log(`  Rasm URL: ${imageUrl} (keyinroq Media jadvaliga qo'shiladi)`);
        }
      } catch (error: any) {
        console.error(`Mahsulot ${product.id} import qilishda xatolik:`, error.message);
        errors++;
      }
    }

    console.log('\n=== Import natijalari ===');
    console.log(`Yaratilgan: ${imported} ta`);
    console.log(`O'tkazib yuborilgan: ${skipped} ta`);
    console.log(`Xatolar: ${errors} ta`);
  } catch (error) {
    console.error('Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createOrGetBrands(
  products: ExtractedProduct[]
): Promise<Array<{ id: string; name: string }>> {
  // Brend nomlarini topish
  const brandNames = new Set<string>();
  
  for (const product of products) {
    const title = product.title_ru || '';
    // Oticon, ReSound, Signia, GN ReSound kabi brendlarni topish
    if (title.includes('Oticon')) {
      brandNames.add('Oticon');
    } else if (title.includes('ReSound') || title.includes('GN ReSound')) {
      brandNames.add('ReSound');
    } else if (title.includes('Signia')) {
      brandNames.add('Signia');
    } else if (title.includes('Phonak')) {
      brandNames.add('Phonak');
    } else if (title.includes('Widex')) {
      brandNames.add('Widex');
    }
  }

  const brands = [];
  for (const brandName of brandNames) {
    // Brendni topish yoki yaratish
    let brand = await prisma.brand.findFirst({
      where: {
        name: { contains: brandName, mode: 'insensitive' },
      },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: brandName,
          slug: brandName.toLowerCase().replace(/\s+/g, '-'),
        },
      });
      console.log(`Brend yaratildi: ${brandName}`);
    }

    brands.push({
      id: brand.id,
      name: brand.name,
    });
  }

  return brands;
}

async function createOrGetCategories(
  products: ExtractedProduct[]
): Promise<Array<{ id: string; name_uz: string; name_ru: string }>> {
  // Kategoriyalarni topish - hozircha oddiy kategoriyalar
  const categories = [];

  // Asosiy kategoriya yaratish/yuklash
  let mainCategory = await prisma.productCategory.findFirst({
    where: { slug: 'hearing-aids' },
  });

  if (!mainCategory) {
    mainCategory = await prisma.productCategory.create({
      data: {
        name_uz: 'Eshitish apparatlari',
        name_ru: 'Слуховые аппараты',
        slug: 'hearing-aids',
      },
    });
    console.log('Asosiy kategoriya yaratildi: Eshitish apparatlari');
  }

  categories.push({
    id: mainCategory.id,
    name_uz: mainCategory.name_uz,
    name_ru: mainCategory.name_ru,
  });

  return categories;
}

function findBrand(
  product: ExtractedProduct,
  brands: Array<{ id: string; name: string }>
): { id: string; name: string } | null {
  const title = product.title_ru || '';
  
  for (const brand of brands) {
    if (title.includes(brand.name)) {
      return brand;
    }
  }

  return null;
}

function findCategory(
  product: ExtractedProduct,
  categories: Array<{ id: string; name_uz: string; name_ru: string }>
): { id: string; name_uz: string; name_ru: string } | null {
  // Hozircha barcha mahsulotlar asosiy kategoriyaga
  return categories[0] || null;
}

// Scriptni ishga tushirish
importProducts()
  .then(() => {
    console.log('Import yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Xatolik:', error);
    process.exit(1);
  });

