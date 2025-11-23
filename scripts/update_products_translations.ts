/**
 * Mahsulotlarni o'zbekcha va ruscha ma'lumotlar bilan yangilash
 * products_ru_uz.json faylidan ma'lumotlarni olib, mavjud mahsulotlarni yangilaydi
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

interface ProductTranslation {
  id: number;
  title_ru: string;
  title_uz: string;
  description_ru: string;
  description_uz: string;
  lines?: Array<{
    original_id: number;
    ru: string;
    uz: string;
  }>;
}

async function updateProductsTranslations() {
  try {
    console.log('Mahsulotlarni yangilash boshlandi...');

    // JSON faylni o'qish
    const translationsData = JSON.parse(
      fs.readFileSync(
        path.join('/Users/tiuulugbek/Downloads/products_ru_uz.json'),
        'utf-8'
      )
    ) as ProductTranslation[];

    console.log(`Topilgan mahsulotlar: ${translationsData.length} ta`);

    // Mavjud mahsulotlarni olish
    const existingProducts = await prisma.product.findMany({
      select: {
        id: true,
        slug: true,
        name_uz: true,
        name_ru: true,
      },
    });

    console.log(`Mavjud mahsulotlar: ${existingProducts.length} ta`);

    let updated = 0;
    let notFound = 0;
    let errors = 0;

    // Har bir tarjima uchun
    for (const translation of translationsData) {
      try {
        // Slug yoki nom bo'yicha mahsulotni topish
        // Avval title_ru dan slug yaratib topamiz
        const normalizeSlug = (text: string) => {
          return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        };

        const slugFromTitle = normalizeSlug(translation.title_ru);
        const titleLower = translation.title_ru.toLowerCase().trim();

        // Mahsulotni topish - bir nechta usul bilan
        let product = existingProducts.find(
          (p) =>
            p.slug === slugFromTitle ||
            p.slug === normalizeSlug(p.name_ru) && normalizeSlug(p.name_ru) === slugFromTitle ||
            p.name_ru.toLowerCase().trim() === titleLower ||
            (p.name_uz && p.name_uz.toLowerCase().trim() === titleLower)
        );

        // Agar topilmasa, qisman moslik bo'yicha qidirish
        if (!product) {
          const titleWords = titleLower.split(/\s+/).filter(w => w.length > 2);
          product = existingProducts.find((p) => {
            const nameRuLower = p.name_ru.toLowerCase();
            const nameUzLower = p.name_uz?.toLowerCase() || '';
            // Barcha so'zlar nomda bo'lishi kerak
            return titleWords.every(word => 
              nameRuLower.includes(word) || nameUzLower.includes(word)
            );
          });
        }

        // Agar hali ham topilmasa, slug bo'yicha qidirish (qisman)
        if (!product) {
          const slugParts = slugFromTitle.split('-').filter(p => p.length > 2);
          product = existingProducts.find((p) => {
            const productSlug = p.slug.toLowerCase();
            return slugParts.some(part => productSlug.includes(part)) &&
                   slugParts.length >= Math.min(2, slugParts.length);
          });
        }

        if (!product) {
          console.log(`  ❌ Topilmadi: ${translation.title_ru} (ID: ${translation.id})`);
          notFound++;
          continue;
        }

        // Yangilash ma'lumotlarini tayyorlash
        const updateData: any = {};

        // O'zbekcha nom
        if (translation.title_uz && translation.title_uz.trim()) {
          updateData.name_uz = translation.title_uz.trim();
        }

        // Ruscha nom (agar o'zgarmagan bo'lsa)
        if (translation.title_ru && translation.title_ru.trim()) {
          updateData.name_ru = translation.title_ru.trim();
        }

        // Ruscha tavsif
        if (translation.description_ru && translation.description_ru.trim()) {
          // HTML ni tozalash va saqlash
          const cleanDescriptionRu = translation.description_ru
            .trim()
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n');
          updateData.description_ru = cleanDescriptionRu;
        }

        // O'zbekcha tavsif
        if (translation.description_uz && translation.description_uz.trim()) {
          const cleanDescriptionUz = translation.description_uz
            .trim()
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n');
          updateData.description_uz = cleanDescriptionUz;
        }

        // Mahsulotni yangilash
        await prisma.product.update({
          where: { id: product.id },
          data: updateData,
        });

        console.log(`  ✅ Yangilandi: ${product.name_ru} -> ${translation.title_uz || translation.title_ru}`);
        updated++;
      } catch (error: any) {
        console.error(`  ❌ Xatolik (${translation.title_ru}):`, error.message);
        errors++;
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`Yangilangan: ${updated} ta`);
    console.log(`Topilmagan: ${notFound} ta`);
    console.log(`Xatolar: ${errors} ta`);
  } catch (error) {
    console.error('Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
updateProductsTranslations()
  .then(() => {
    console.log('Yangilash yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Xatolik:', error);
    process.exit(1);
  });

