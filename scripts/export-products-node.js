#!/usr/bin/env node

/**
 * Export all products to JSON using Prisma Client
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// BigInt serialization
BigInt.prototype.toJSON = function() {
  return this.toString();
};

async function exportProducts() {
  try {
    console.log('📦 Mahsulotlarni export qilmoqda...');

    const products = await prisma.product.findMany({
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        catalogs: {
          select: {
            id: true,
            name_uz: true,
            name_ru: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ ${products.length} ta mahsulot topildi`);

    // Format products
    const productsJson = products.map((product) => ({
      id: product.id,
      numericId: product.numericId ? product.numericId.toString() : null,
      name_uz: product.name_uz,
      name_ru: product.name_ru,
      slug: product.slug,
      description_uz: product.description_uz || '',
      description_ru: product.description_ru || '',
      price: product.price ? Number(product.price) : null,
      stock: product.stock ? Number(product.stock) : null,
      productType: product.productType,
      status: product.status,
      brand: product.brand ? {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
      } : null,
      catalogs: product.catalogs.map((catalog) => ({
        id: catalog.id,
        name_uz: catalog.name_uz,
        name_ru: catalog.name_ru,
        slug: catalog.slug,
      })),
      audience: product.audience || [],
      formFactors: product.formFactors || [],
      smartphoneCompatibility: product.smartphoneCompatibility || [],
      signalProcessing: product.signalProcessing,
      powerLevel: product.powerLevel,
      hearingLossLevels: product.hearingLossLevels || [],
      paymentOptions: product.paymentOptions || [],
      availabilityStatus: product.availabilityStatus,
      tinnitusSupport: product.tinnitusSupport || false,
      specsText: product.specsText || '',
      tech_uz: product.tech_uz || '',
      tech_ru: product.tech_ru || '',
      fittingRange_uz: product.fittingRange_uz || '',
      fittingRange_ru: product.fittingRange_ru || '',
      galleryIds: product.galleryIds || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    // JSON faylga yozish
    const outputPath = path.join(__dirname, 'products-export.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(productsJson, null, 2),
      'utf8'
    );

    console.log(`✅ ${products.length} ta mahsulot export qilindi!`);
    console.log(`📁 Fayl: ${outputPath}`);

    // Statistika
    console.log('\n📊 Statistika:');
    console.log(`  - Jami mahsulotlar: ${products.length}`);
    console.log(`  - Tavsif (uz) bor: ${products.filter((p) => p.description_uz).length}`);
    console.log(`  - Tavsif (ru) bor: ${products.filter((p) => p.description_ru).length}`);
    console.log(`  - Brend belgilangan: ${products.filter((p) => p.brand).length}`);
    console.log(`  - Kataloglarga biriktirilgan: ${products.filter((p) => p.catalogs.length > 0).length}`);

    return productsJson;
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportProducts()
  .then(() => {
    console.log('\n✅ Export muvaffaqiyatli yakunlandi!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Export xatolik bilan yakunlandi:', error);
    process.exit(1);
  });
