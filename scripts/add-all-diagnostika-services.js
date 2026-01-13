"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Add all services from sluh.by/services/diagnostika-dla-detey/
 * Based on the 18 services found on the page
 */
async function addAllDiagnostikaServices() {
    console.log('🌱 Adding all diagnostika services from sluh.by...');
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
    console.log(`✅ Found category: ${diagnostikaCategory.name_uz} (${diagnostikaCategory.id})`);
    // All services from the sluh.by page (adapted for Acoustic Uzbekistan)
    const services = [
        {
            title_uz: 'Bolalar surdologi bilan konsultatsiya',
            title_ru: 'Консультация детского сурдолога',
            excerpt_uz: 'Birinchi konsultatsiyada bolalar surdologi eshitishni kompleks tekshirish o\'tkazadi, xulosa beradi va eshitish patologiyasi bo\'lsa, bolaning individual reabilitatsiya dasturini ishlab chiqadi.',
            excerpt_ru: 'На первичной консультации детский сурдолог проведет комплексное обследование слуха, выдаст заключение, и при наличии патологии слуха разработает индивидуальную программу реабилитации слуха у ребенка.',
            slug: 'konsultatsiya-detskogo-surdologa',
            order: 1,
        },
        {
            title_uz: 'Bolalar uchun videootoskopiya',
            title_ru: 'Видеоотоскопия уха для детей',
            excerpt_uz: 'Katta ekranda siz bolaning tashqi eshitish kanali, quloq pardasi va tashqi quloq tuzilishining xususiyatlarini batafsil ko\'rishingiz mumkin.',
            excerpt_ru: 'На большом экране вы сможете детально увидеть состояние наружного слухового прохода, барабанной перепонки, и в целом особенности строения наружного уха вашего ребенка.',
            slug: 'videootoskopiya-uha-dlya-detej',
            order: 2,
        },
        {
            title_uz: 'Bolalar uchun ton portativ audiometriya',
            title_ru: 'Тональная пороговая аудиометрия для детей',
            excerpt_uz: 'Eshitishni subyektiv diagnostika usuli, 5 yoshdan oshgan bolalarda bajariladi va bolaning eshitish portativlarini to\'liq tushunish imkonini beradi.',
            excerpt_ru: 'Метод субъективной диагностики слуха, выполняется детям старше 5 лет и позволяет получить полное представление о порогах слуха ребенка.',
            slug: 'tonalnaya-porogovaya-audiometriya',
            order: 3,
        },
        {
            title_uz: 'O\'yin audiometriyasi',
            title_ru: 'Игровая аудиометрия',
            excerpt_uz: 'Diagnostika kichik yoshdagi bolalarga tovush izolyatsiya qilingan kabinada bajariladi va bolaning qanchalik past ovozlarni eshitishini aniqlashga yordam beradi.',
            excerpt_ru: 'Диагностика выполняется детям младшего возраста в звукоизолированной кабине с целью понять, насколько тихие звуки может услышать ребенок.',
            slug: 'igrovaya-audiometriya',
            order: 4,
        },
        {
            title_uz: 'Shartli-reflektorli audiometriya (VRA)',
            title_ru: 'Условно-рефлекторная аудиометрия (VRA)',
            excerpt_uz: 'Eshitishni subyektiv diagnostika usuli, 6-8 oylik bolalarda bajariladi va kichik yoshdagi bolalarda past va yuqori chastotalarda eshitish portativlarini aniqlashtirish imkonini beradi.',
            excerpt_ru: 'Метод субъективной диагностики слуха, выполняться детям возраста 6-8 мес. и позволяет уточнить пороги слуха на низких и высоких частотах у детей младшего возраста.',
            slug: 'audiometriya-vra',
            order: 5,
        },
        {
            title_uz: 'Bolalar uchun timpanometriya',
            title_ru: 'Тимпанометрия ребенку',
            excerpt_uz: 'O\'rta quloq va eshitish trubalari holatini diagnostika qilishning tez va og\'riqsiz usuli, chaqaloq va an\'anaviy timpanometriyaga bo\'linadi.',
            excerpt_ru: 'Быстрый и безболезненный метод диагностики состояния среднего уха и слуховых труб у детей, подразделяется на младенческую и традиционную тимпанометрию.',
            slug: 'timpanometriya-rebenku',
            order: 6,
        },
        {
            title_uz: 'Ulitkaning mikrofon potentsialini qayd etish',
            title_ru: 'Регистрация микрофонного потенциала улитки',
            excerpt_uz: 'Auditor nevropatiya spektrining buzilishlarini aniqlash uchun yuqori aniqlikdagi obyektiv usul.',
            excerpt_ru: 'Высокоточный объективный метод для выявления расстройств спектра аудиторных нейропатий.',
            slug: 'registracziya-mikrofonnogo-potencziala-ulitki',
            order: 7,
        },
        {
            title_uz: 'Bolalar uchun keng polosali timpanometriya',
            title_ru: 'Широкополосная тимпанометрия для детей',
            excerpt_uz: 'Yaxshilangan aniqlik va ishonchlilik bilan kichik bolalarda o\'rta quloq holatini baholash imkonini beradigan usul.',
            excerpt_ru: 'Метод с повышенной точностью и достоверностью позволяет оценивать состояние среднего уха у маленьких детей.',
            slug: 'shirokopolosnaya-timpanometriya-dlya-detej',
            order: 8,
        },
        {
            title_uz: 'Bolalar uchun impedansometriya',
            title_ru: 'Импедансометрия для детей',
            excerpt_uz: 'O\'rta quloq holatini, eshitish trubasi ishlashini, ichki quloq faoliyatini baholash usuli, shuningdek, bolaning eshitish portativlarini taxminiy baholash mumkin.',
            excerpt_ru: 'Метод оценки состояния среднего уха, слуховой трубы, работы внутреннего уха, также можно ориентировочно оценить пороги слуха ребенка.',
            slug: 'impedansometriya-dlya-detej',
            order: 9,
        },
        {
            title_uz: 'Eshitish trubalari funksiyasini o\'rganish (ETF-test)',
            title_ru: 'Исследование функции слуховых труб (ETF-тест)',
            excerpt_uz: 'Bolaning evstaxiyev trubalarining funktsional holatini baholaydigan oddiy va samarali klinik test.',
            excerpt_ru: 'Простой и эффективный клинический тест, который оценивает функциональное состояние евстахиевых труб у ребенка.',
            slug: 'issledovanie-funkczii-sluhovyh-trub-etf-test',
            order: 10,
        },
        {
            title_uz: 'Obyektiv kompyuterli audiometriya (ASSR)',
            title_ru: 'Объективная компьютерная аудиометрия (ASSR)',
            excerpt_uz: 'Eshitishni obyektiv diagnostika usuli, avtomatik rejimda to\'rt asosiy nutq chastotasida - 500 Гц, 1, 2 va 4 кГц eshitishni sinash imkonini beradi.',
            excerpt_ru: 'Объективный метод диагностики слуха, позволяющий в авторежиме протестировать слышимость на четырех основных речевых частотах – 500 Гц, 1, 2 и 4 кГц.',
            slug: 'obektivnaya-kompyuternaya-audiometriya-assr',
            order: 11,
        },
        {
            title_uz: 'KSVP skriningi qayd etish (ABRIS usuli)',
            title_ru: 'Регистрация скрининга КСВП (ABRIS-метод)',
            excerpt_uz: 'Bolaning eshitish tizimi funksiyasini baholashga imkon beradigan obyektiv skrining usuli.',
            excerpt_ru: 'Объективный скрининговый метод позволяет оценить функцию слуховой системы ребенка.',
            slug: 'skrining-sluha-metodom-abris-skrining-ksvp',
            order: 12,
        },
        {
            title_uz: 'Otoakustik emissiya usuli bilan eshitish skriningi',
            title_ru: 'Скрининг слуха методом отоакустической эмиссии',
            excerpt_uz: 'Tez va og\'riqsiz eshitish tekshiruvi, bolaning hayotining birinchi kunlaridan eshitish pasayishini shubha qilishga imkon beradi.',
            excerpt_ru: 'Быстрое и безболезненное обследование слуха, позволяет заподозрить снижение слуха с первых дней жизни ребенка.',
            slug: 'skrining-sluha-metodom-oae',
            order: 13,
        },
        {
            title_uz: 'KSVP usuli bilan eshitishni o\'rganish',
            title_ru: 'Исследование слуха методом КСВП',
            excerpt_uz: 'Eshitish qo\'zg\'algan potentsiallarini (KSVP) qayd etish uyqu paytida bajariladi va bolalarda eshitish buzilishini yuqori aniqlik bilan aniqlash imkonini beradi.',
            excerpt_ru: 'Регистрация слуховых вызванных потенциалов (КСВП) выполняется во сне и с высокой точностью позволяет определить нарушение слуха у детей.',
            slug: 'issledovanie-sluha-metodom-ksvp',
            order: 14,
        },
        {
            title_uz: 'Eshitishni kompleks tekshirish dasturlari',
            title_ru: 'Комплексные программы обследования слуха',
            excerpt_uz: 'Bolada eshitish buzilishini diagnostika qilish uchun surdolog keng audimetrik testlar to\'plamidan foydalanadi.',
            excerpt_ru: 'Для диагностики нарушений слуха у ребенка врач-сурдолог использует широкий набор аудиометрических тестов.',
            slug: 'diagnostika-slukha-u-detey',
            order: 15,
        },
        {
            title_uz: 'O\'rta quloq kompleks diagnostikasi',
            title_ru: 'Комплексная диагностика среднего уха',
            excerpt_uz: 'Quloq bo\'shlig\'i va pardaning holati, eshitish suyagi va eshitish trubalari haqida batafsil ma\'lumot olish uchun klinik testlar to\'plami.',
            excerpt_ru: 'Набор клинических тестов для получения подробной информации о состоянии барабанной полости и перепонки, слуховых косточек и слуховых труб.',
            slug: 'kompleksnaya-diagnostika-srednego-uha',
            order: 16,
        },
        {
            title_uz: 'Bolalarda eshitishni kompleks obyektiv audiologik tekshiruv',
            title_ru: 'Комплексное объективное аудиологическое обследование слуха у детей',
            excerpt_uz: 'Eshitish buzilishiga ega bo\'lgan chaqaloqqa aniq va to\'g\'ri tashxis qo\'yish uchun zarur bo\'lgan obyektiv tekshiruv usullari kompleksi.',
            excerpt_ru: 'Комплекс объективных методов обследования, необходимых для постановки точного и правильного диагноза малышу с нарушением слуха.',
            slug: 'kompleksnoe-obektivnoe-audiologicheskoe-obsledovanie-sluha-u-detej',
            order: 17,
        },
    ];
    let created = 0;
    let updated = 0;
    let skipped = 0;
    for (const serviceData of services) {
        try {
            const existing = await prisma.service.findUnique({
                where: { slug: serviceData.slug },
            });
            const data = {
                ...serviceData,
                categoryId: diagnostikaCategory.id,
                status: 'published',
            };
            if (existing) {
                await prisma.service.update({
                    where: { slug: serviceData.slug },
                    data,
                });
                updated++;
                console.log(`  ✅ Updated: ${serviceData.title_uz}`);
            }
            else {
                await prisma.service.create({
                    data,
                });
                created++;
                console.log(`  ✅ Created: ${serviceData.title_uz}`);
            }
        }
        catch (error) {
            skipped++;
            console.error(`  ❌ Error with ${serviceData.title_uz}:`, error);
        }
    }
    console.log(`\n✅ Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${services.length}`);
}
async function main() {
    try {
        await addAllDiagnostikaServices();
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
//# sourceMappingURL=add-all-diagnostika-services.js.map