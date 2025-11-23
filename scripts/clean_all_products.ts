/**
 * Barcha mahsulotlarni, rasmlarni va matnlarni tozalash
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

async function cleanAllProducts() {
  try {
    console.log('=== Barcha mahsulotlarni, rasmlarni va matnlarni tozalash ===\n');

    // 1. Barcha mahsulotlarni o'chirish
    console.log('1. Barcha mahsulotlarni o\'chirish...');
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`   ✅ ${deletedProducts.count} ta mahsulot o'chirildi\n`);

    // 2. Mahsulotlarga bog'liq bo'lmagan media'larni o'chirish
    console.log('2. Mahsulotlarga bog\'liq bo\'lmagan media\'larni o\'chirish...');
    
    // Barcha media'larni olish
    const allMedia = await prisma.media.findMany({
      select: { id: true, url: true },
    });

    // Boshqa jadvallarda ishlatilmayotgan media'larni topish
    const mediaInUse = new Set<string>();
    
    // Posts jadvalidan
    const posts = await prisma.post.findMany({
      select: { coverId: true },
    });
    posts.forEach(post => {
      if (post.coverId) mediaInUse.add(post.coverId);
    });

    // Services jadvalidan
    const services = await prisma.service.findMany({
      select: { coverId: true },
    });
    services.forEach(service => {
      if (service.coverId) mediaInUse.add(service.coverId);
    });

    // Doctors jadvalidan
    const doctors = await prisma.doctor.findMany({
      select: { imageId: true },
    });
    doctors.forEach(doctor => {
      if (doctor.imageId) mediaInUse.add(doctor.imageId);
    });

    // Brands jadvalidan
    const brands = await prisma.brand.findMany({
      select: { logoId: true },
    });
    brands.forEach(brand => {
      if (brand.logoId) mediaInUse.add(brand.logoId);
    });

    // Settings jadvalidan
    const settings = await prisma.setting.findMany({
      select: { catalogHeroImageId: true, logoId: true },
    });
    settings.forEach(setting => {
      if (setting.catalogHeroImageId) mediaInUse.add(setting.catalogHeroImageId);
      if (setting.logoId) mediaInUse.add(setting.logoId);
    });

    // Banners jadvalidan
    const banners = await prisma.banner.findMany({
      select: { imageId: true },
    });
    banners.forEach(banner => {
      if (banner.imageId) mediaInUse.add(banner.imageId);
    });

    // Categories jadvallaridan
    const productCategories = await prisma.productCategory.findMany({
      select: { imageId: true },
    });
    productCategories.forEach(cat => {
      if (cat.imageId) mediaInUse.add(cat.imageId);
    });

    const serviceCategories = await prisma.serviceCategory.findMany({
      select: { imageId: true },
    });
    serviceCategories.forEach(cat => {
      if (cat.imageId) mediaInUse.add(cat.imageId);
    });

    const catalogs = await prisma.catalog.findMany({
      select: { imageId: true },
    });
    catalogs.forEach(cat => {
      if (cat.imageId) mediaInUse.add(cat.imageId);
    });

    // Ishlatilmayotgan media'larni o'chirish
    const unusedMedia = allMedia.filter(media => !mediaInUse.has(media.id));
    
    if (unusedMedia.length > 0) {
      // Rasmlarni fayl tizimidan ham o'chirish
      const uploadsDir = path.join(process.cwd(), 'uploads', 'products');
      
      for (const media of unusedMedia) {
        try {
          // Agar URL lokal papkaga ishora qilsa, faylni o'chirish
          if (media.url.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), media.url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`   🗑️  Fayl o'chirildi: ${media.url}`);
            }
          }
        } catch (error) {
          // Fayl o'chirishda xatolik bo'lsa, davom etish
        }
      }

      // Media jadvalidan o'chirish
      const deletedMedia = await prisma.media.deleteMany({
        where: {
          id: {
            in: unusedMedia.map(m => m.id),
          },
        },
      });
      console.log(`   ✅ ${deletedMedia.count} ta media o'chirildi\n`);
    } else {
      console.log(`   ℹ️  O'chirish uchun media topilmadi\n`);
    }

    // 3. Uploads/products papkasini tozalash
    console.log('3. Uploads/products papkasini tozalash...');
    const uploadsProductsDir = path.join(process.cwd(), 'uploads', 'products');
    if (fs.existsSync(uploadsProductsDir)) {
      const files = fs.readdirSync(uploadsProductsDir);
      let deletedFiles = 0;
      for (const file of files) {
        try {
          const filePath = path.join(uploadsProductsDir, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            deletedFiles++;
          }
        } catch (error) {
          // Fayl o'chirishda xatolik bo'lsa, davom etish
        }
      }
      console.log(`   ✅ ${deletedFiles} ta fayl o'chirildi\n`);
    } else {
      console.log(`   ℹ️  Uploads/products papkasi mavjud emas\n`);
    }

    console.log('=== Natijalar ===');
    console.log(`O'chirilgan mahsulotlar: ${deletedProducts.count} ta`);
    console.log(`O'chirilgan media: ${unusedMedia.length} ta`);
    console.log('\n✅ Baza va fayllar tozalandi. Endi yangi faylni import qilish mumkin.');
  } catch (error) {
    console.error('Xatolik:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
cleanAllProducts()
  .then(() => {
    console.log('\n✅ Tozalash yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });

