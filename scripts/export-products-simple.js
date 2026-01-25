#!/usr/bin/env node

/**
 * Simple product export script using direct database connection
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'acousticwebdb',
  user: 'acoustic_user',
  password: process.env.PGPASSWORD || 'acoustic_web_db_password',
});

async function exportProducts() {
  try {
    await client.connect();
    console.log('📦 Database\'ga ulandi...');

    // Barcha mahsulotlarni olish
    const query = `
      SELECT 
        p.id,
        p."numericId"::text as "numericId",
        p."name_uz",
        p."name_ru",
        p.slug,
        p."description_uz",
        p."description_ru",
        p.price,
        p.stock,
        p."productType",
        p.status,
        p.audience,
        p."formFactors",
        p."smartphoneCompatibility",
        p."signalProcessing",
        p."powerLevel",
        p."hearingLossLevels",
        p."paymentOptions",
        p."availabilityStatus",
        p."tinnitusSupport",
        p."specsText",
        p."tech_uz",
        p."tech_ru",
        p."fittingRange_uz",
        p."fittingRange_ru",
        p."galleryIds",
        p."createdAt",
        p."updatedAt",
        json_build_object(
          'id', b.id,
          'name', b.name,
          'slug', b.slug
        ) as brand,
        CASE 
          WHEN pc.id IS NOT NULL THEN json_build_object(
            'id', pc.id,
            'name_uz', pc."name_uz",
            'name_ru', pc."name_ru",
            'slug', pc.slug
          )
          ELSE NULL
        END as category,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', c.id,
                'name_uz', c."name_uz",
                'name_ru', c."name_ru",
                'slug', c.slug
              )
            )
            FROM "_ProductToCatalog" ptc
            JOIN "Catalog" c ON ptc."A" = c.id
            WHERE ptc."B" = p.id
          ),
          '[]'::json
        ) as catalogs
      FROM "Product" p
      LEFT JOIN "Brand" b ON p."brandId" = b.id
      LEFT JOIN "ProductCategory" pc ON p."categoryId" = pc.id
      ORDER BY p."createdAt" DESC
    `;

    const result = await client.query(query);
    const products = result.rows;

    console.log(`✅ ${products.length} ta mahsulot topildi`);

    // JSON faylga yozish
    const outputPath = path.join(__dirname, 'products-export.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(products, null, 2),
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
      `  - Kataloglarga biriktirilgan: ${products.filter((p) => p.catalogs && p.catalogs.length > 0).length}`
    );

    return products;
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    throw error;
  } finally {
    await client.end();
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
