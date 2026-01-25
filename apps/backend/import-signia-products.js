const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// BigInt serialization
BigInt.prototype.toJSON = function() {
  return this.toString();
};

async function importSigniaProducts() {
  try {
    console.log('📦 Signia mahsulotlarini import qilmoqda...');

    // JSON faylni o'qish
    const jsonPath = '/root/signia-product.json';
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Fayl topilmadi: ${jsonPath}`);
    }

    const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ ${productsData.length} ta mahsulot topildi`);

    // Signia brand'ni topish yoki yaratish
    let signiaBrand = await prisma.brand.findFirst({
      where: { name: { contains: 'Signia', mode: 'insensitive' } },
    });

    if (!signiaBrand) {
      signiaBrand = await prisma.brand.create({
        data: {
          name: 'Signia',
          slug: 'signia',
        },
      });
      console.log(`✅ Signia brand yaratildi: ${signiaBrand.id}`);
    } else {
      console.log(`✅ Signia brand topildi: ${signiaBrand.id}`);
    }

    let created = 0;
    let updated = 0;
    let errors = 0;

    // Har bir mahsulotni import qilish
    for (let i = 0; i < productsData.length; i++) {
      const productData = productsData[i];
      
      try {
        // Slug bo'yicha mavjud mahsulotni topish
        const existingProduct = await prisma.product.findFirst({
          where: { slug: productData.slug },
        });

        // Mahsulot ma'lumotlarini tayyorlash
        const productPayload = {
          name_uz: productData.name_uz,
          name_ru: productData.name_ru,
          slug: productData.slug,
          description_uz: productData.description_uz || '',
          description_ru: productData.description_ru || '',
          price: productData.price ? parseFloat(productData.price) : null,
          productType: productData.productType || 'hearing-aids',
          status: 'active',
          brandId: signiaBrand.id,
          audience: productData.audience || [],
          formFactors: productData.formFactors || [],
          smartphoneCompatibility: productData.smartphoneCompatibility || [],
          signalProcessing: productData.signalProcessing || null,
          powerLevel: productData.powerLevel || null,
          hearingLossLevels: productData.hearingLossLevels || [],
          paymentOptions: productData.paymentOptions || [],
          availabilityStatus: productData.availabilityStatus || 'in-stock',
          tinnitusSupport: productData.tinnitusSupport || false,
          specsText: productData.specsText || '',
          tech_uz: productData.tech_uz || '',
          tech_ru: productData.tech_ru || '',
          fittingRange_uz: productData.fittingRange_uz || '',
          fittingRange_ru: productData.fittingRange_ru || '',
        };

        if (existingProduct) {
          // Update qilish
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productPayload,
          });
          updated++;
          console.log(`  ✅ Updated: ${productData.slug}`);
        } else {
          // Yangi qo'shish
          await prisma.product.create({
            data: productPayload,
          });
          created++;
          console.log(`  ✅ Created: ${productData.slug}`);
        }

        // Catalog'larni biriktirish
        if (productData.catalogIds && productData.catalogIds.length > 0) {
          const product = existingProduct || await prisma.product.findFirst({
            where: { slug: productData.slug },
          });

          if (product) {
            // Mavjud catalog biriktirishlarni o'chirish
            await prisma.$executeRaw`
              DELETE FROM "_ProductToCatalog" WHERE "B" = ${product.id}
            `;

            // Yangi catalog'larni biriktirish
            for (const catalogId of productData.catalogIds) {
              try {
                await prisma.$executeRaw`
                  INSERT INTO "_ProductToCatalog" ("A", "B")
                  VALUES (${catalogId}, ${product.id})
                  ON CONFLICT DO NOTHING
                `;
              } catch (err) {
                // Catalog topilmasa, o'tkazib yuborish
                console.log(`    ⚠️  Catalog topilmadi: ${catalogId}`);
              }
            }
          }
        }

      } catch (error) {
        errors++;
        console.error(`  ❌ Xatolik (${productData.slug}): ${error.message}`);
      }
    }

    console.log('\n📊 Import natijalari:');
    console.log(`  ✅ Yangi qo'shilgan: ${created}`);
    console.log(`  🔄 Yangilangan: ${updated}`);
    console.log(`  ❌ Xatolar: ${errors}`);
    console.log(`  📦 Jami: ${productsData.length}`);

    return { created, updated, errors, total: productsData.length };
  } catch (error) {
    console.error('❌ Import xatolik:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importSigniaProducts()
  .then((result) => {
    console.log('\n✅ Import muvaffaqiyatli yakunlandi!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import xatolik bilan yakunlandi:', error);
    process.exit(1);
  });
