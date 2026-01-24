const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Database config
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'acoustic_user',
  password: 'Acoustic##4114',
  database: 'acousticwebdb'
};

// SQL query ni bajarish - fayl orqali
function executeSQL(query) {
  try {
    const tempFile = `/tmp/psql_query_${Date.now()}.sql`;
    fs.writeFileSync(tempFile, query);
    
    const cmd = `PGPASSWORD='${DB_CONFIG.password.replace(/'/g, "'\"'\"'")}' psql -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -t -A -f ${tempFile}`;
    const result = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024, shell: '/bin/bash' });
    
    // Temp faylni o'chirish
    try { fs.unlinkSync(tempFile); } catch (e) {}
    
    return result.trim();
  } catch (error) {
    throw new Error(`SQL xatolik: ${error.message}`);
  }
}

// Brand'ni topish yoki yaratish
function findOrCreateBrand(brandName) {
  const findQuery = `SELECT id FROM "Brand" WHERE name ILIKE ${JSON.stringify(brandName)} LIMIT 1;`;
  let brandId = executeSQL(findQuery);
  
  if (!brandId) {
    const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const insertQuery = `INSERT INTO "Brand" (id, name, slug, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, ${JSON.stringify(brandName)}, ${JSON.stringify(slug)}, NOW(), NOW()) RETURNING id;`;
    brandId = executeSQL(insertQuery);
    console.log(`  ✓ Yangi brand yaratildi: ${brandName}`);
  } else {
    console.log(`  ✓ Brand topildi: ${brandName}`);
  }
  
  return brandId;
}

// Slug'ni unique qilish
function makeUniqueSlug(slug) {
  let uniqueSlug = slug;
  let counter = 1;
  
  while (true) {
    const checkQuery = `SELECT id FROM "Product" WHERE slug = ${JSON.stringify(uniqueSlug)} LIMIT 1;`;
    const existing = executeSQL(checkQuery);
    
    if (!existing) {
      return uniqueSlug;
    }
    
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
}

// Mahsulotni import qilish
function importProduct(productData, index, total) {
  console.log(`\n[${index + 1}/${total}] Mahsulot: ${productData.name_uz}`);

  try {
    // 1. Brand'ni topish yoki yaratish
    let brandId = null;
    if (productData.brandName) {
      brandId = findOrCreateBrand(productData.brandName);
    }

    // 2. Slug'ni unique qilish
    const uniqueSlug = makeUniqueSlug(productData.slug);

    // 3. Mahsulotni yaratish - SQL escape qilish
    function escapeSQL(str) {
      if (!str) return 'NULL';
      return `'${String(str).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
    }
    
    function escapeJSON(value) {
      if (!value) return "'[]'::jsonb";
      return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
    }
    
    const insertQuery = `
      INSERT INTO "Product" (
        id, "name_uz", "name_ru", slug,
        "description_uz", "description_ru", price, "productType", "brandId",
        "specsText", "galleryIds", "thumbnailId",
        audience, "formFactors", "signalProcessing", "powerLevel",
        "hearingLossLevels", "smartphoneCompatibility", "tinnitusSupport",
        "paymentOptions", "availabilityStatus",
        "intro_uz", "intro_ru", "features_uz", "features_ru",
        "benefits_uz", "benefits_ru", "tech_uz", "tech_ru",
        "fittingRange_uz", "fittingRange_ru", status,
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${escapeSQL(productData.name_uz)},
        ${escapeSQL(productData.name_ru)},
        ${escapeSQL(uniqueSlug)},
        ${escapeSQL(productData.description_uz)},
        ${escapeSQL(productData.description_ru)},
        ${productData.price || 'NULL'},
        ${escapeSQL(productData.productType)},
        ${brandId ? escapeSQL(brandId) : 'NULL'},
        ${escapeSQL(productData.specsText)},
        ${escapeJSON(productData.galleryUrls || [])},
        ${escapeSQL(productData.thumbnailUrl)},
        ${escapeJSON(productData.audience || [])},
        ${escapeJSON(productData.formFactors || [])},
        ${escapeSQL(productData.signalProcessing)},
        ${escapeSQL(productData.powerLevel)},
        ${escapeJSON(productData.hearingLossLevels || [])},
        ${escapeJSON(productData.smartphoneCompatibility || [])},
        ${productData.tinnitusSupport ? 'true' : 'false'},
        ${escapeJSON(productData.paymentOptions || [])},
        ${escapeSQL(productData.availabilityStatus)},
        ${escapeSQL(productData.intro_uz)},
        ${escapeSQL(productData.intro_ru)},
        ${escapeJSON(productData.features_uz || [])},
        ${escapeJSON(productData.features_ru || [])},
        ${escapeJSON(productData.benefits_uz || [])},
        ${escapeJSON(productData.benefits_ru || [])},
        ${escapeSQL(productData.tech_uz)},
        ${escapeSQL(productData.tech_ru)},
        ${escapeSQL(productData.fittingRange_uz)},
        ${escapeSQL(productData.fittingRange_ru)},
        'published',
        NOW(),
        NOW()
      ) RETURNING id, "name_uz";
    `.replace(/\s+/g, ' ').trim();

    const result = executeSQL(insertQuery);
    const lines = result.split('\n').filter(l => l.trim());
    const productId = lines[0] ? lines[0].split('|')[0] : 'unknown';
    
    console.log(`  ✅ Mahsulot muvaffaqiyatli yaratildi: ${productData.name_uz} (ID: ${productId})`);
    return true;
  } catch (error) {
    console.error(`  ❌ Mahsulot yaratishda xatolik:`, error.message);
    return false;
  }
}

// Asosiy funksiya
function main() {
  try {
    console.log('=== ReSound mahsulotlarini import qilish ===\n');

    // JSON faylni o'qish
    const jsonFilePath = path.join(__dirname, '..', 'product-to-import-resound.json');
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`Fayl topilmadi: ${jsonFilePath}`);
    }

    console.log(`JSON fayl o'qilmoqda: ${jsonFilePath}`);
    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const products = JSON.parse(fileContent);

    console.log(`✅ ${products.length} ta mahsulot topildi\n`);

    // Har bir mahsulotni import qilish
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < products.length; i++) {
      const success = importProduct(products[i], i, products.length);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`✅ Muvaffaqiyatli: ${successCount} ta`);
    console.log(`❌ Xatoliklar: ${errorCount} ta`);
    console.log(`📊 Jami: ${products.length} ta\n`);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  }
}

main();
