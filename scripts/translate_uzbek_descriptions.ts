/**
 * O'zbekcha tavsiflarni avtomatik tarjima qilish
 * Agar description_uz bo'sh bo'lsa, description_ru dan tarjima qiladi
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

// Oddiy tarjimalar (asosiy so'zlar va iboralar)
const translations: Record<string, string> = {
  'Частотный диапазон': 'Chastota diapazoni',
  'Каналы обработки': 'Kanallarni qayta ishlash',
  'Полосы настроек': 'Sozlamalar chiziqlari',
  'Формулы настроек': 'Formulalarni o\'rnatish',
  'опционально': 'ixtiyoriy',
  '✓': '✓',
  '—': '—',
  '♦': '♦',
  'Обработка сигнала': 'Signalni qayta ishlash',
  'Gain & MPO': 'Gain & MPO',
  'Программы для слуха': 'Eshitish dasturlari',
  'Расширенный динамический диапазон': 'Kengaytirilgan dinamik diapazon',
  'Управление речью и шумом': 'Nutq va shovqinni boshqarish',
  'HD-музыка': 'HD-musiqa',
  'Качество речи': 'Nutq sifati',
  'Бинауральная направленность': 'Binaural yo\'nalish',
  'Взаимодействие с пользователем': 'Foydalanuvchi bilan o\'zaro ta\'sir',
  'Прямая потоковая передача': 'To\'g\'ridan-to\'g\'ri oqim uzatish',
  'Сделано для iPhone': 'iPhone uchun yaratilgan',
  'Tinnitus': 'Tinnitus',
  'Сигнал шумовой терапии тиннитуса': 'Tinnitus shovqin terapiyasi signali',
};

/**
 * Tooltip formatini o'zbekchaga tarjima qilish
 */
function translateTooltipContent(content: string): string {
  let translated = content;
  
  // Asosiy tarjimalarni qo'llash
  Object.entries(translations).forEach(([ru, uz]) => {
    const regex = new RegExp(ru.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, uz);
  });
  
  return translated;
}

/**
 * HTML contentdagi tooltiplarni tarjima qilish
 */
function translateTooltipsInContent(content: string): string {
  // [tooltips keyword="..." content="..."] formatini topish va tarjima qilish
  const tooltipRegex = /\[tooltips\s+keyword=["']([^"']+)["']\s+content=["']([^"']+)["']\]/gi;
  
  return content.replace(tooltipRegex, (match, keyword, tooltipContent) => {
    const translatedContent = translateTooltipContent(tooltipContent);
    return `[tooltips keyword="${keyword}" content="${translatedContent}"]`;
  });
}

/**
 * HTML contentdagi asosiy matnlarni tarjima qilish
 */
function translateHtmlContent(content: string): string {
  let translated = content;
  
  // Tooltiplarni avval tarjima qilish
  translated = translateTooltipsInContent(translated);
  
  // Oddiy matnlarni tarjima qilish
  Object.entries(translations).forEach(([ru, uz]) => {
    // Faqat HTML taglar orasidagi matnlarni tarjima qilish
    const regex = new RegExp(`>([^<]*?)${ru.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^<]*?)<`, 'gi');
    translated = translated.replace(regex, (match, before, after) => {
      return `>${before}${uz}${after}<`;
    });
  });
  
  return translated;
}

async function translateUzbekDescriptions() {
  try {
    console.log('O\'zbekcha tavsiflarni tarjima qilish boshlandi...');

    // Barcha mahsulotlarni olish
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name_ru: true,
        name_uz: true,
        description_ru: true,
        description_uz: true,
      },
    });

    console.log(`Topilgan mahsulotlar: ${products.length} ta`);

    let translated = 0;
    let alreadyHasUz = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Agar description_uz mavjud va bo'sh emas bo'lsa, o'tkazib yuborish
        if (product.description_uz && product.description_uz.trim().length > 0) {
          alreadyHasUz++;
          continue;
        }

        // Agar description_ru bo'sh bo'lsa, o'tkazib yuborish
        if (!product.description_ru || !product.description_ru.trim()) {
          continue;
        }

        // description_ru dan tarjima qilish
        const translatedDescription = translateHtmlContent(product.description_ru);

        // Mahsulotni yangilash
        await prisma.product.update({
          where: { id: product.id },
          data: {
            description_uz: translatedDescription,
          },
        });

        console.log(`  ✅ Tarjima qilindi: ${product.name_ru}`);
        translated++;
      } catch (error: any) {
        console.error(`  ❌ Xatolik (${product.name_ru}):`, error.message);
        errors++;
      }
    }

    console.log('\n=== Natijalar ===');
    console.log(`Tarjima qilingan: ${translated} ta`);
    console.log(`Allaqachon o'zbekcha mavjud: ${alreadyHasUz} ta`);
    console.log(`Xatolar: ${errors} ta`);
  } catch (error) {
    console.error('Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushirish
translateUzbekDescriptions()
  .then(() => {
    console.log('Tarjima yakunlandi');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Xatolik:', error);
    process.exit(1);
  });









