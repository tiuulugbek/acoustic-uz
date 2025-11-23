/**
 * products_full.json dan barcha mahsulotlarni import qilish
 * Brandlarni to'g'ri aniqlash va Interacoustics mahsulotlarini kategoriyalashtirish
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

interface ProductFull {
  id: number;
  brand: string;
  title_ru: string;
  title_uz: string;
  description_ru: string;
  description_uz: string;
  image_url?: string;
  lines?: Array<{
    original_id: number;
    ru: string;
    uz: string;
  }>;
}

async function importProductsFull() {
  try {
    console.log('=== products_full.json dan import qilish ===\n');

    // 1. JSON faylni o'qish
    console.log('1. JSON faylni o\'qish...');
    const productsData = JSON.parse(
      fs.readFileSync(
        path.join('/Users/tiuulugbek/Downloads/products_full.json'),
        'utf-8'
      )
    ) as ProductFull[];

    console.log(`   ✅ ${productsData.length} ta mahsulot topildi\n`);

    // 2. Brand larni yaratish/yangilash
    console.log('2. Brand larni tayyorlash...');
    const brands = new Set<string>();
    productsData.forEach((product) => {
      if (product.brand && product.brand.trim()) {
        brands.add(product.brand.trim());
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

    // 3. Mahsulotlarni import qilish
    console.log('3. Mahsulotlarni import qilish...');
    let imported = 0;
    let errors = 0;

    for (const productData of productsData) {
      try {
        // Brand ni topish
        let brandName = productData.brand?.trim() || 'Unknown';
        const titleLower = productData.title_ru.toLowerCase();
        
        // Charger mahsulotlarini ReSound brandiga bog'lash
        if (brandName === 'Unknown' && (
          titleLower.includes('charger') ||
          titleLower.includes('premium charger') ||
          titleLower.includes('desktop charger')
        )) {
          // ReSound charger mahsulotlarini aniqlash
          if (titleLower.includes('omnia') || titleLower.includes('key') || titleLower.includes('linx')) {
            brandName = 'ReSound';
          }
        }
        
        const brandId = brandMap.get(brandName);

        // Slug yaratish
        const slug = productData.title_ru
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Tavsiflarni tozalash
        const descriptionRu = productData.description_ru
          ? productData.description_ru
              .trim()
              .replace(/\\r\\n/g, '\n')
              .replace(/\\n/g, '\n')
          : null;

        const descriptionUz = productData.description_uz
          ? productData.description_uz
              .trim()
              .replace(/\\r\\n/g, '\n')
              .replace(/\\n/g, '\n')
          : null;
        
        // Rasmlarni description_ru dan ajratish
        const imageUrls: string[] = [];
        
        // Avval image_url dan olish
        if (productData.image_url) {
          imageUrls.push(productData.image_url);
        }
        
        // Keyin description_ru dan rasmlarni ajratish
        const imgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/gi;
        let match;
        while ((match = imgRegex.exec(descriptionRu || '')) !== null) {
          const url = match[1];
          if (!imageUrls.includes(url)) {
            imageUrls.push(url);
          }
        }

        const galleryIds: string[] = [];
        let thumbnailId: string | undefined = undefined;

        for (const url of imageUrls) {
          let media = await prisma.media.findFirst({
            where: { url: url },
          });

          if (!media) {
            media = await prisma.media.create({
              data: {
                url: url,
                alt_ru: productData.title_ru,
                alt_uz: productData.title_uz || productData.title_ru,
              },
            });
          }
          galleryIds.push(media.id);
          if (!thumbnailId) {
            thumbnailId = media.id;
          }
        }

        // ProductType ni aniqlash va Interacoustics mahsulotlarini aniqlash
        // titleLower allaqachon yuqorida e'lon qilingan
        const isInteracoustics = brandName.toLowerCase().includes('interacoustics') ||
          titleLower.includes('visualeyes') ||
          titleLower.includes('eyeseecam') ||
          titleLower.includes('titan') ||
          titleLower.includes('eclipse') ||
          titleLower.includes('at 235') ||
          titleLower.includes('affinity') ||
          titleLower.includes('ad629') ||
          titleLower.includes('ad226') ||
          titleLower.includes('ac40') ||
          titleLower.includes('aa222');
        
        const productType = isInteracoustics ? 'interacoustics' : 'hearing-aids';
        
        // Agar Interacoustics mahsulot bo'lsa, brand ni "Interacoustics" ga o'zgartirish
        let finalBrandName = brandName;
        let finalBrandId = brandId;
        if (isInteracoustics && brandName !== 'Interacoustics') {
          finalBrandName = 'Interacoustics';
          finalBrandId = brandMap.get('Interacoustics');
          // Agar Interacoustics brand mavjud bo'lmasa, yaratish
          if (!finalBrandId) {
            const interacousticsBrand = await prisma.brand.upsert({
              where: { name: 'Interacoustics' },
              update: {},
              create: { 
                name: 'Interacoustics',
                slug: 'interacoustics',
              },
            });
            finalBrandId = interacousticsBrand.id;
            brandMap.set('Interacoustics', finalBrandId);
          }
        }

        // Mahsulotni yaratish
        await prisma.product.create({
          data: {
            name_ru: productData.title_ru.trim(),
            name_uz: productData.title_uz?.trim() || productData.title_ru.trim(),
            slug: slug,
            description_ru: descriptionRu,
            description_uz: descriptionUz,
            productType: productType,
            brand: finalBrandId ? { connect: { id: finalBrandId } } : undefined,
            status: 'published',
            galleryIds: galleryIds,
            thumbnailId: thumbnailId,
          },
        });

        console.log(`   ✅ ${productData.title_ru} (${imageUrls.length} rasm, ${productType})`);
        imported++;
      } catch (error: any) {
        console.error(`   ❌ Xatolik (${productData.title_ru}):`, error.message);
        errors++;
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`Import qilingan: ${imported} ta`);
    console.log(`Xatolar: ${errors} ta`);
  } catch (error) {
    console.error('Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
importProductsFull()
  .then(() => {
    console.log('\n✅ Import yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });

