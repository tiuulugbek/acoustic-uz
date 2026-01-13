"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Update or create "Diagnostika dlya detey" service with rich content
 * Adapted from sluh.by/services/diagnostika-dla-detey/ for Acoustic Uzbekistan
 */
async function updateServiceDiagnostika() {
    console.log('🌱 Updating "Bolalar uchun diagnostika" service...');
    const serviceData = {
        title_uz: 'Bolalar uchun diagnostika',
        title_ru: 'Диагностика для детей',
        excerpt_uz: 'Acoustic eshitish markazida barcha yoshdagi, shu jumladan yangi tug\'ilgan bolalar uchun eshitishni baholashning obyektiv va subyektiv usullari to\'liq mavjud.',
        excerpt_ru: 'В Acoustic - центре хорошего слуха доступен полный набор объективных и субъективных методов оценки слуха у детей любого возраста, в том числе новорожденных.',
        body_uz: `Acoustic - eshitish markazida barcha yoshdagi, shu jumladan yangi tug'ilgan bolalar uchun eshitishni baholashning obyektiv va subyektiv usullari to'liq mavjud.

Mutaxassislarimiz bolalarda eshitishni kompleks diagnostika qilish uchun zamonaviy uskunalardan foydalanadi va batafsil xulosa beradi.

## Asosiy diagnostika usullari:

1. **Bolalar surdologi bilan konsultatsiya** - eshitishni kompleks tekshirish, xulosa va individual reabilitatsiya dasturini ishlab chiqish

2. **Bolalar uchun videootoskopiya** - tashqi eshitish kanali va quloq pardasini katta ekranda batafsil ko'rib chiqish

3. **Ton portativ audiometriya** - 5 yoshdan oshgan bolalar uchun, eshitish portativlarini to'liq tushunish imkonini beradi

4. **O'yin audiometriyasi** - kichik yoshdagi bolalar uchun tovush izolyatsiya qilingan kabinada

5. **Shartli-reflektorli audiometriya (VRA)** - 6-8 oylik bolalar uchun, turli chastotalarda eshitish portativlarini aniqlashtirish

6. **Timpanometriya** - o'rta quloq holatini diagnostika qilishning tez va og'riqsiz usuli

7. **Obyektiv kompyuterli audiometriya (ASSR)** - to'rt asosiy nutq chastotasida obyektiv usul

8. **KSVP usuli bilan eshitishni o'rganish** - uyqu paytida eshitish qo'zg'algan potentsiallarini qayd etish

9. **Otoakustik emissiya usuli bilan eshitish skriningi** - hayotning birinchi kunlaridan tez tekshiruv

Barcha diagnostika usullari tajribali mutaxassislar tomonidan zamonaviy uskunalar yordamida amalga oshiriladi.

**Muhim:** 14 yoshgacha bo'lgan bolalarga tibbiy xizmatlar qonuniy vakil ishtirokida, hujjatlar bilan (ota-onaning passporti va bolaning tug'ilganlik guvohnomasi) ko'rsatiladi.`,
        body_ru: `В Acoustic - центре хорошего слуха доступен полный набор объективных и субъективных методов оценки слуха у детей любого возраста, в том числе новорожденных.

Наши специалисты используют современное оборудование для комплексной диагностики слуха у детей и предоставляют подробные заключения.

## Основные методы диагностики:

1. **Консультация детского сурдолога** - комплексное обследование слуха, заключение и разработка индивидуальной программы реабилитации

2. **Видеоотоскопия уха для детей** - детальный осмотр наружного слухового прохода и барабанной перепонки на большом экране

3. **Тональная пороговая аудиометрия** - для детей старше 5 лет, позволяет получить полное представление о порогах слуха

4. **Игровая аудиометрия** - для детей младшего возраста в звукоизолированной кабине

5. **Условно-рефлекторная аудиометрия (VRA)** - для детей 6-8 месяцев, уточнение порогов слуха на разных частотах

6. **Тимпанометрия** - быстрый и безболезненный метод диагностики состояния среднего уха

7. **Объективная компьютерная аудиометрия (ASSR)** - объективный метод на четырех основных речевых частотах

8. **Исследование слуха методом КСВП** - регистрация слуховых вызванных потенциалов во сне

9. **Скрининг слуха методом отоакустической эмиссии** - быстрое обследование с первых дней жизни

Все методы диагностики проводятся опытными специалистами с использованием современного оборудования.

**Важно:** Медицинские услуги детям до 14 лет оказываются в присутствии законного представителя при наличии документов (паспорт родителя и свидетельство о рождении ребенка).`,
        slug: 'diagnostika-dlya-detey',
        status: 'published',
        order: 1,
    };
    try {
        // Find the "Diagnostika" category
        const diagnostikaCategory = await prisma.serviceCategory.findFirst({
            where: {
                slug: 'diagnostika',
            },
        });
        if (!diagnostikaCategory) {
            console.error('❌ "Diagnostika" category not found. Please create it first.');
            return;
        }
        // Update or create the service
        const service = await prisma.service.upsert({
            where: {
                slug: serviceData.slug,
            },
            update: {
                ...serviceData,
                categoryId: diagnostikaCategory.id,
            },
            create: {
                ...serviceData,
                categoryId: diagnostikaCategory.id,
            },
        });
        console.log(`✅ Service "${serviceData.title_uz}" updated/created successfully!`);
        console.log(`   ID: ${service.id}`);
        console.log(`   Slug: ${service.slug}`);
        console.log(`   Category: ${diagnostikaCategory.name_uz}`);
    }
    catch (error) {
        console.error('❌ Error updating service:', error);
        throw error;
    }
}
async function main() {
    try {
        await updateServiceDiagnostika();
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=update-service-diagnostika-dlya-detey.js.map