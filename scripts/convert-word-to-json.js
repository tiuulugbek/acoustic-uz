const fs = require('fs');
const path = require('path');

// Word faylni JSON formatiga o'tkazish
// Eslatma: Bu skript mammoth kutubxonasini ishlatadi (Word faylni o'qish uchun)

function convertWordToJSON(wordFilePath, outputJsonPath) {
  try {
    console.log('=== Word faylni JSON formatiga o\'tkazish ===\n');
    console.log(`Word fayl: ${wordFilePath}`);
    console.log(`Chiqish fayli: ${outputJsonPath}\n`);

    // Mammoth kutubxonasini yuklash
    let mammoth;
    try {
      mammoth = require('mammoth');
    } catch (e) {
      console.error('❌ Xatolik: mammoth kutubxonasi o\'rnatilmagan!');
      console.error('O\'rnatish uchun: npm install mammoth');
      console.error('Yoki: pnpm add mammoth');
      process.exit(1);
    }

    // Word faylni o'qish
    if (!fs.existsSync(wordFilePath)) {
      throw new Error(`Word fayl topilmadi: ${wordFilePath}`);
    }

    console.log('Word fayl o\'qilmoqda...');
    const result = mammoth.extractRawText({ path: wordFilePath });
    
    return result.then(function(data) {
      const text = data.value;
      const messages = data.messages;
      
      console.log('✅ Word fayl o\'qildi');
      if (messages.length > 0) {
        console.log('⚠️  Ogohlantirishlar:');
        messages.forEach(msg => console.log(`  - ${msg.message}`));
      }

      // Matnni qatorlarga bo'lish
      const lines = text.split('\n').filter(line => line.trim());
      
      console.log(`\n📊 Topildi: ${lines.length} ta qator\n`);
      
      // Matnni JSON formatiga o'tkazish
      // Bu oddiy versiya - sizning Word fayl strukturasiga qarab o'zgartirishingiz kerak
      const products = [];
      
      // Bu yerda Word fayl strukturasiga qarab parsing qilish kerak
      // Masalan, agar har bir mahsulot alohida qatorda bo'lsa:
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed) {
          // Oddiy struktura - har bir qator bir mahsulot
          // Sizning strukturaga qarab o'zgartirishingiz kerak
          products.push({
            name_uz: trimmed,
            name_ru: trimmed,
            slug: trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            description_uz: '',
            description_ru: '',
            price: null,
            productType: 'hearing-aids',
            brandName: '', // Siz to'ldirishingiz kerak
            // Boshqa maydonlar...
          });
        }
      });

      // JSON faylga yozish
      fs.writeFileSync(outputJsonPath, JSON.stringify(products, null, 2), 'utf-8');
      
      console.log(`✅ JSON fayl yaratildi: ${outputJsonPath}`);
      console.log(`📊 ${products.length} ta mahsulot JSON formatiga o'tkazildi\n`);
      
      return products;
    }).catch(function(error) {
      console.error('❌ Xatolik:', error);
      throw error;
    });
  } catch (error) {
    console.error('❌ Xatolik:', error);
    throw error;
  }
}

// Asosiy funksiya
function main() {
  const wordFilePath = process.argv[2];
  const outputJsonPath = process.argv[3] || path.join(__dirname, '..', 'products-from-word.json');

  if (!wordFilePath) {
    console.error('❌ Xatolik: Word fayl yo\'li ko\'rsatilmagan!');
    console.error('\nFoydalanish:');
    console.error('  node scripts/convert-word-to-json.js <word-file-path> [output-json-path]');
    console.error('\nMisol:');
    console.error('  node scripts/convert-word-to-json.js products.docx products.json');
    process.exit(1);
  }

  convertWordToJSON(wordFilePath, outputJsonPath)
    .then(() => {
      console.log('✅ Konvertatsiya yakunlandi');
      console.log(`\nKeyingi qadam: JSON faylni import qilish`);
      console.log(`  node scripts/import-resound-products.js ${outputJsonPath}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Xatolik:', error);
      process.exit(1);
    });
}

main();
