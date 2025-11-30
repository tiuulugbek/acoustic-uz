import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function fixInteracousticsProductType() {
  try {
    console.log('=== Interacoustics brand mahsulotlarining productType ni o\'zgartirish ===\n');

    // Interacoustics brand'ni topish
    const interacousticsBrand = await prisma.brand.findFirst({
      where: {
        name: { contains: 'Interacoustics', mode: 'insensitive' },
      },
    });

    if (!interacousticsBrand) {
      console.log('❌ Interacoustics brand topilmadi');
      return;
    }

    console.log(`✅ Interacoustics brand topildi: ${interacousticsBrand.name}`);

    // Interacoustics brand'idagi mahsulotlarni topish
    const products = await prisma.product.findMany({
      where: {
        brandId: interacousticsBrand.id,
      },
      select: {
        id: true,
        name_uz: true,
        productType: true,
      },
    });

    console.log(`\n📦 ${products.length} ta mahsulot topildi\n`);

    let updated = 0;
    let alreadyCorrect = 0;

    for (const product of products) {
      if (product.productType === 'interacoustics') {
        alreadyCorrect++;
        console.log(`   ✓ ${product.name_uz} - allaqachon interacoustics`);
      } else {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            productType: 'interacoustics',
          },
        });
        updated++;
        console.log(`   ✅ ${product.name_uz} - ${product.productType || 'null'} → interacoustics`);
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`✅ O'zgartirilgan: ${updated} ta`);
    console.log(`✓ Allaqachon to'g'ri: ${alreadyCorrect} ta`);
    console.log(`📊 Jami: ${products.length} ta mahsulot`);
    console.log(`\n✅ Barcha Interacoustics mahsulotlarining productType o'zgartirildi`);
  } catch (error: any) {
    console.error('\n❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixInteracousticsProductType()
  .then(() => {
    console.log('\n✅ Yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  });
