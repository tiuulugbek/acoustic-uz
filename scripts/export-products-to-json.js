#!/usr/bin/env node

/**
 * Export all products to JSON file
 * Includes all product data with ru and uz descriptions
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportProducts() {
  try {
    console.log('📦 Mahsulotlarni export qilmoqda...');

    // Barcha mahsulotlarni olish (barcha maydonlar bilan)
    const products = await prisma.product.findMany({
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name_uz: true,
            name_ru: true,
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
        cover: {
          select: {
            id: true,
            url: true,
            alt_uz: true,
            alt_ru: true,
          },
        },
        thumbnail: {
          select: {
            id: true,
            url: true,
            alt_uz: true,
            alt_ru: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ ${products.length} ta mahsulot topildi`);

    // BigInt'ni string'ga o'girish
    const productsJson = products.map((product) => {
      const productData = {
        ...product,
        numericId: product.numericId ? product.numericId.toString() : null,
        price: product.price ? Number(product.price) : null,
        stock: product.stock ? Number(product.stock) : null,
        // Brand ma'lumotlari
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name,
              slug: product.brand.slug,
            }
          : null,
        // Category ma'lumotlari
        category: product.category
          ? {
              id: product.category.id,
              name_uz: product.category.name_uz,
              name_ru: product.category.name_ru,
              slug: product.category.slug,
            }
          : null,
        // Catalogs ma'lumotlari
        catalogs: product.catalogs.map((catalog) => ({
          id: catalog.id,
          name_uz: catalog.name_uz,
          name_ru: catalog.name_ru,
          slug: catalog.slug,
        })),
        // Cover ma'lumotlari
        cover: product.cover
          ? {
              id: product.cover.id,
              url: product.cover.url,
              alt_uz: product.cover.alt_uz,
              alt_ru: product.cover.alt_ru,
            }
          : null,
        // Thumbnail ma'lumotlari
        thumbnail: product.thumbnail
          ? {
              id: product.thumbnail.id,
              url: product.thumbnail.url,
              alt_uz: product.thumbnail.alt_uz,
              alt_ru: product.thumbnail.alt_ru,
            }
          : null,
      };

      return productData;
    });

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
    console.log(
      `  - Tavsif (uz) bor: ${products.filter((p) => p.description_uz).length}`
    );
    console.log(
      `  - Tavsif (ru) bor: ${products.filter((p) => p.description_ru).length}`
    );
    console.log(
      `  - Brend belgilangan: ${products.filter((p) => p.brand).length}`
    );
    console.log(
      `  - Kataloglarga biriktirilgan: ${products.filter((p) => p.catalogs.length > 0).length}`
    );

    return productsJson;
  } catch (error) {
    console.error('❌ Xatolik:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script'ni ishga tushirish
if (require.main === module) {
  exportProducts()
    .then(() => {
      console.log('\n✅ Export muvaffaqiyatli yakunlandi!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Export xatolik bilan yakunlandi:', error);
      process.exit(1);
    });
}

module.exports = { exportProducts };
