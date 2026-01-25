#!/usr/bin/env node
/**
 * Signia brendiga tegishli barcha mahsulotlarni o'chirish
 * Usage: node scripts/delete-signia-products.js [--confirm]
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://acoustic_user:Acoustic%23%234114@localhost:5432/acousticwebdb',
    },
  },
});

async function deleteSigniaProducts() {
  try {
    console.log('🔍 Signia brendini qidiryapman...');
    
    // Signia brendini topish
    const brand = await prisma.brand.findFirst({
      where: {
        name: {
          contains: 'Signia',
          mode: 'insensitive',
        },
      },
      include: {
        products: {
          select: {
            id: true,
            name_uz: true,
            slug: true,
          },
        },
      },
    });

    if (!brand) {
      console.log('❌ Signia brend topilmadi!');
      return;
    }

    console.log(`✅ Brand topildi: ${brand.name} (ID: ${brand.id})`);
    console.log(`📦 Mahsulotlar soni: ${brand.products.length}`);
    console.log('');

    if (brand.products.length === 0) {
      console.log('ℹ️  O\'chirish uchun mahsulotlar yo\'q.');
      return;
    }

    // Mahsulotlarni ko'rsatish
    console.log('📋 O\'chiriladigan mahsulotlar:');
    brand.products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name_uz} (${product.slug})`);
    });
    console.log('');

    // Tasdiqlash
    const args = process.argv.slice(2);
    const confirmed = args.includes('--confirm') || args.includes('-y');

    if (!confirmed) {
      console.log('⚠️  EHTIYOT! Bu operatsiya barcha Signia mahsulotlarini o\'chiradi!');
      console.log('📝 Tasdiqlash uchun buyruqni quyidagicha qayta bajarishingiz kerak:');
      console.log(`   node scripts/delete-signia-products.js --confirm`);
      console.log('');
      return;
    }

    console.log('🗑️  Mahsulotlarni o\'chiryapman...');
    console.log('');

    // Mahsulotlarni o'chirish
    const deleteResult = await prisma.product.deleteMany({
      where: {
        brandId: brand.id,
      },
    });

    console.log(`✅ Muvaffaqiyatli o'chirildi: ${deleteResult.count} ta mahsulot`);
    console.log('');

    // Tekshirish
    const remaining = await prisma.product.count({
      where: {
        brandId: brand.id,
      },
    });

    if (remaining === 0) {
      console.log('✅ Barcha Signia mahsulotlari o\'chirildi!');
    } else {
      console.log(`⚠️  Hali ${remaining} ta mahsulot qoldi.`);
    }

  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Script ishga tushirish
deleteSigniaProducts();
