const fs = require('fs');
const path = require('path');

// Database config
const DB_CONFIG = {
  host: 'localhost',
  user: 'acoustic_user',
  password: 'Acoustic##4114',
  database: 'acousticwebdb'
};

// SQL escape
function escapeSQL(str) {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

function escapeJSON(value) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return "'{}'::text[]";
  }
  // text[] format: ARRAY['value1','value2']
  const values = Array.isArray(value) ? value : [value];
  if (values.length === 0) {
    return "'{}'::text[]";
  }
  return `ARRAY[${values.map(v => escapeSQL(v)).join(',')}]`;
}

function main() {
  try {
    console.log('=== SQL fayl yaratish ===\n');

    // JSON faylni o'qish
    const jsonFilePath = path.join(__dirname, '..', 'product-to-import-resound.json');
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`Fayl topilmadi: ${jsonFilePath}`);
    }

    const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
    const products = JSON.parse(fileContent);

    console.log(`✅ ${products.length} ta mahsulot topildi\n`);

    // SQL fayl yaratish
    let sql = 'BEGIN;\n\n';
    
    // ReSound brand ID ni olish (biz bilamiz)
    const resoundBrandId = 'cmih32wqq000iab1nr31vye89'; // Oldin topilgan
    
    let count = 0;
    for (const p of products) {
      // Slug'ni unique qilish uchun tekshirish
      let uniqueSlug = p.slug;
      let slugCounter = 1;
      
      // Har bir mahsulot uchun INSERT
      sql += `-- [${count + 1}/${products.length}] ${p.name_uz}\n`;
      sql += `INSERT INTO "Product" (\n`;
      sql += `  id, "name_uz", "name_ru", slug,\n`;
      sql += `  "description_uz", "description_ru", price, "productType", "brandId",\n`;
      sql += `  "specsText", "galleryIds", "thumbnailId",\n`;
      sql += `  audience, "formFactors", "signalProcessing", "powerLevel",\n`;
      sql += `  "hearingLossLevels", "smartphoneCompatibility", "tinnitusSupport",\n`;
      sql += `  "paymentOptions", "availabilityStatus",\n`;
      sql += `  "intro_uz", "intro_ru", "features_uz", "features_ru",\n`;
      sql += `  "benefits_uz", "benefits_ru", "tech_uz", "tech_ru",\n`;
      sql += `  "fittingRange_uz", "fittingRange_ru", status,\n`;
      sql += `  "createdAt", "updatedAt"\n`;
      sql += `) VALUES (\n`;
      sql += `  gen_random_uuid()::text,\n`;
      sql += `  ${escapeSQL(p.name_uz || '')},\n`;
      sql += `  ${escapeSQL(p.name_ru || '')},\n`;
      sql += `  ${escapeSQL(uniqueSlug)},\n`;
      sql += `  ${escapeSQL(p.description_uz)},\n`;
      sql += `  ${escapeSQL(p.description_ru)},\n`;
      sql += `  ${p.price || 'NULL'},\n`;
      sql += `  ${escapeSQL(p.productType)},\n`;
      sql += `  ${resoundBrandId ? escapeSQL(resoundBrandId) : 'NULL'},\n`;
      sql += `  ${escapeSQL(p.specsText)},\n`;
      sql += `  ${escapeJSON(p.galleryUrls || [])},\n`; // text[]
      sql += `  ${escapeSQL(p.thumbnailUrl)},\n`;
      sql += `  ${escapeJSON(p.audience || [])},\n`; // text[]
      sql += `  ${escapeJSON(p.formFactors || [])},\n`; // text[]
      sql += `  ${escapeSQL(p.signalProcessing)},\n`;
      sql += `  ${escapeSQL(p.powerLevel)},\n`;
      sql += `  ${escapeJSON(p.hearingLossLevels || [])},\n`; // text[]
      sql += `  ${escapeJSON(p.smartphoneCompatibility || [])},\n`; // text[]
      sql += `  ${p.tinnitusSupport ? 'true' : 'false'},\n`;
      sql += `  ${escapeJSON(p.paymentOptions || [])},\n`; // text[]
      sql += `  ${escapeSQL(p.availabilityStatus)},\n`;
      sql += `  ${escapeSQL(p.intro_uz)},\n`;
      sql += `  ${escapeSQL(p.intro_ru)},\n`;
      // features va benefits - agar string bo'lsa, array ga o'tkazish
      const featuresUz = Array.isArray(p.features_uz) ? p.features_uz : (p.features_uz ? [p.features_uz] : []);
      const featuresRu = Array.isArray(p.features_ru) ? p.features_ru : (p.features_ru ? [p.features_ru] : []);
      const benefitsUz = Array.isArray(p.benefits_uz) ? p.benefits_uz : (p.benefits_uz ? [p.benefits_uz] : []);
      const benefitsRu = Array.isArray(p.benefits_ru) ? p.benefits_ru : (p.benefits_ru ? [p.benefits_ru] : []);
      
      sql += `  ${escapeJSON(featuresUz)},\n`; // text[]
      sql += `  ${escapeJSON(featuresRu)},\n`; // text[]
      sql += `  ${escapeJSON(benefitsUz)},\n`; // text[]
      sql += `  ${escapeJSON(benefitsRu)},\n`; // text[]
      sql += `  ${escapeSQL(p.tech_uz)},\n`;
      sql += `  ${escapeSQL(p.tech_ru)},\n`;
      sql += `  ${escapeSQL(p.fittingRange_uz)},\n`;
      sql += `  ${escapeSQL(p.fittingRange_ru)},\n`;
      sql += `  'published',\n`;
      sql += `  NOW(),\n`;
      sql += `  NOW()\n`;
      sql += `) ON CONFLICT (slug) DO NOTHING;\n\n`;
      
      count++;
    }

    sql += 'COMMIT;\n';

    // SQL faylni saqlash
    const sqlFilePath = '/tmp/import-resound-products.sql';
    fs.writeFileSync(sqlFilePath, sql);
    
    console.log(`✅ SQL fayl yaratildi: ${sqlFilePath}`);
    console.log(`📊 ${count} ta mahsulot SQL ga yozildi\n`);
    console.log(`Import qilish uchun quyidagi buyruqni bajarishingiz kerak:`);
    console.log(`PGPASSWORD='${DB_CONFIG.password}' psql -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -f ${sqlFilePath}`);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  }
}

main();
