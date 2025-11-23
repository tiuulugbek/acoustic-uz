/**
 * Barcha mahsulotlarni o'chirib, yangi products_ru_uz.json dan qaytadan import qilish
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

async function cleanAndReimportProducts() {
  try {
    console.log('=== Baza tozalash va qaytadan import qilish ===\n');

    // 1. Barcha mahsulotlarni o'chirish
    console.log('1. Barcha mahsulotlarni o\'chirish...');
    const deletedCount = await prisma.product.deleteMany({});
    console.log(`   ✅ ${deletedCount.count} ta mahsulot o'chirildi\n`);

    // 2. JSON faylni o'qish
    console.log('2. JSON faylni o\'qish...');
    const translationsData = JSON.parse(
      fs.readFileSync(
        path.join('/Users/tiuulugbek/Downloads/products_ru_uz.json'),
        'utf-8'
      )
    ) as ProductTranslation[];

    console.log(`   ✅ ${translationsData.length} ta mahsulot topildi\n`);

    // 3. Brand va Category larni olish/yaratish
    console.log('3. Brand va Category larni tayyorlash...');
    
    // Brand larni yaratish/yangilash
    const brands = new Set<string>();
    translationsData.forEach((product) => {
      // Brand nomini title_ru dan ajratish (masalan, "Oticon Siya 2 CIC" -> "Oticon")
      const brandMatch = product.title_ru.match(/^([A-Za-z]+)/);
      if (brandMatch) {
        brands.add(brandMatch[1]);
      }
    });

    const brandMap = new Map<string, string>();
    for (const brandName of brands) {
      const brandSlug = brandName.toLowerCase().replace(/\s+/g, '-');
      const brand = await prisma.brand.upsert({
        where: { name: brandName },
        update: {},
        create: { 
          name: brandName,
          slug: brandSlug,
        },
      });
      brandMap.set(brandName, brand.id);
      console.log(`   ✅ Brand: ${brandName}`);
    }
    console.log('');

    // 4. Mahsulotlarni import qilish
    console.log('4. Mahsulotlarni import qilish...');
    let imported = 0;
    let errors = 0;

    for (const translation of translationsData) {
      try {
        // Brand ni topish
        const brandMatch = translation.title_ru.match(/^([A-Za-z]+)/);
        const brandName = brandMatch ? brandMatch[1] : 'Unknown';
        const brandId = brandMap.get(brandName);

        // Slug yaratish
        const slug = translation.title_ru
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Tavsiflarni tozalash
        const descriptionRu = translation.description_ru
          ? translation.description_ru
              .trim()
              .replace(/\\r\\n/g, '\n')
              .replace(/\\n/g, '\n')
          : null;

        const descriptionUz = translation.description_uz
          ? translation.description_uz
              .trim()
              .replace(/\\r\\n/g, '\n')
              .replace(/\\n/g, '\n')
          : null;

        // Rasmlarni description dan ajratib olish
        const imageUrls: string[] = [];
        if (descriptionRu) {
          // <img> taglardan src ni ajratib olish
          const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
          let match;
          while ((match = imgRegex.exec(descriptionRu)) !== null) {
            const imageUrl = match[1];
            // Faqat to'liq URL larni qo'shish (http:// yoki https:// bilan boshlangan)
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
              if (!imageUrls.includes(imageUrl)) {
                imageUrls.push(imageUrl);
              }
            }
          }
        }

        // Media yaratish/yangilash rasmlar uchun
        const galleryIds: string[] = [];
        for (const imageUrl of imageUrls) {
          try {
            // Media ni topish yoki yaratish
            let media = await prisma.media.findFirst({
              where: { url: imageUrl },
            });
            
            if (!media) {
              // Agar topilmasa, yangi yaratish
              media = await prisma.media.create({
                data: {
                  url: imageUrl,
                  alt_ru: translation.title_ru,
                  alt_uz: translation.title_uz || translation.title_ru,
                },
              });
            }
            
            galleryIds.push(media.id);
          } catch (error: any) {
            // Agar xatolik bo'lsa, davom etish
            console.error(`   ⚠️  Rasm yaratishda xatolik (${imageUrl.substring(0, 50)}...):`, error.message);
          }
        }

        // Mahsulotni yaratish
        await prisma.product.create({
          data: {
            name_ru: translation.title_ru.trim(),
            name_uz: translation.title_uz?.trim() || translation.title_ru.trim(),
            slug: slug,
            description_ru: descriptionRu,
            description_uz: descriptionUz,
            productType: 'hearing-aids', // Default type
            brand: brandId ? { connect: { id: brandId } } : undefined,
            status: 'published',
            galleryIds: galleryIds,
          },
        });

        console.log(`   ✅ ${translation.title_ru}${galleryIds.length > 0 ? ` (${galleryIds.length} rasm)` : ''}`);
        imported++;
      } catch (error: any) {
        console.error(`   ❌ Xatolik (${translation.title_ru}):`, error.message);
        if (error.message.includes('Unique constraint')) {
          console.error(`      Slug: ${slug}`);
        }
        errors++;
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`O'chirilgan: ${deletedCount.count} ta`);
    console.log(`Import qilingan: ${imported} ta`);
    console.log(`Xatolar: ${errors} ta`);
  } catch (error) {
    console.error('Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
cleanAndReimportProducts()
  .then(() => {
    console.log('\n✅ Import yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });

