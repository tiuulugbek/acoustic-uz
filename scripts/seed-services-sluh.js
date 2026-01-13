"use strict";
/**
 * Seed script to import services from sluh.by reference
 * This creates sample services similar to sluh.by/services/
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const services = [
    {
        title_uz: "Bolalar uchun diagnostika",
        title_ru: 'Диагностика для детей',
        excerpt_uz: "Mutaxassislarimiz tug'ilishdan boshlab bolalar va kattalarda eshitish qobiliyatini to'liq diagnostika qiladi.",
        excerpt_ru: 'Специалисты Центра хорошего слуха оказывают полный комплекс услуг по диагностике и коррекции нарушений слуха у взрослых и детей с рождения.',
        slug: 'diagnostika-dlya-detey',
        order: 1,
        status: 'published',
    },
    {
        title_uz: 'Kattalar uchun eshitish diagnostikasi',
        title_ru: 'Диагностика слуха для взрослых',
        excerpt_uz: 'Kattalar uchun barcha turdagi eshitish diagnostikasi mutaxassislar tomonidan ekspert darajadagi uskunalar yordamida bajariladi.',
        excerpt_ru: 'Все виды диагностики слуха у взрослых выполняют сурдологи с применением оборудования экспертного уровня.',
        slug: 'diagnostika-dlya-vzroslyh',
        order: 2,
        status: 'published',
    },
    {
        title_uz: 'Surdolog shifokori bilan maslahat',
        title_ru: 'Консультация врача-сурдолога',
        excerpt_uz: 'Surdolog shifokorining qabuli 30 daqiqadan 1 soatgacha davom etadi va bir necha bosqichda o\'tadi: ko\'rikdan o\'tkazish, otoskopiya, eshitish diagnostikasi, eshitish apparatlarini tanlash va sozlash.',
        excerpt_ru: 'Прием врача-сурдолога занимает по времени от 30 минут до 1 часа и проходит в несколько этапов: осмотр, отоскопия, диагностика слуха, подбор и настройка слуховых аппаратов.',
        slug: 'konsultatsiya-surdologa',
        order: 3,
        status: 'published',
    },
    {
        title_uz: 'Eshitish apparatlari bilan eshitishni korreksiya qilish',
        title_ru: 'Коррекция слуха слуховыми аппаратами',
        excerpt_uz: 'Kattalar, bolalar va keksalarda eshitish yo\'qotilishini zamonaviy eshitish apparatlari yordamida korreksiya qilish va rehabilitatsiya qilish.',
        excerpt_ru: 'Коррекция и реабилитация слуха при тугоухости у взрослых, детей и пожилых людей при помощи современных слуховых аппаратов.',
        slug: 'korreksiya-sluha',
        order: 4,
        status: 'published',
    },
    {
        title_uz: 'Individual quloq vlojkalari',
        title_ru: 'Индивидуальные ушные вкладыши',
        excerpt_uz: 'Individual quloq vlojkasidan foydalanish eshitish apparatining tovushini qulayroq qiladi va orqa aloqa paydo bo\'lish xavfini kamaytiradi.',
        excerpt_ru: 'Использование индивидуального ушного вкладыша делает звучание слухового аппарата более комфортным и уменьшает риск возникновения свиста обратной связи.',
        slug: 'individualnye-ushnye-vkladyshi',
        order: 5,
        status: 'published',
    },
    {
        title_uz: 'Eshitish apparatlarini tuzatish va diagnostika qilish',
        title_ru: 'Ремонт и диагностика слуховых аппаратов',
        excerpt_uz: 'Eshitish apparatlarini tuzatish faqat malakali mutaxassis tomonidan, original ehtiyot qismlar va komponentlardan foydalangan holda amalga oshiriladi.',
        excerpt_ru: 'Ремонт слуховых аппаратов выполняется только квалифицированным специалистом с применением оригинальных запасных частей и компонентов.',
        slug: 'remont-i-diagnostika-sluhovyh-apparatov',
        order: 6,
        status: 'published',
    },
    {
        title_uz: 'Chet ellik fuqarolarni qabul qilish',
        title_ru: 'Прием иностранных граждан',
        excerpt_uz: 'Acoustic markazi boshqa davlatlardan kelgan bemorlarni O\'zbekiston fuqarolari uchun amal qiladigan narxlar bo\'yicha qabul qiladi.',
        excerpt_ru: 'Центр хорошего слуха ведет прием пациентов из других государств по прейскуранту, действительному для граждан Беларуси.',
        slug: 'priem-inostrannyih-grazhdan',
        order: 7,
        status: 'published',
    },
    {
        title_uz: 'Onlayn eshitish tekshiruvi',
        title_ru: 'Проверка слуха онлайн',
        excerpt_uz: 'Eshitish qobiliyati yomonlashganini sezdizmi? Onlayn tekshiruvdan o\'ting - bu eshitish qanchalik yaxshi ishlayotganini va nutqni qanday tushunayotganingizni bilishga yordam beradi.',
        excerpt_ru: 'Заметили, что стали хуже слышать? Пройдите простой и быстрый онлайн-тест, который поможет узнать насколько хорошо вы слышите и разбираете речь.',
        slug: 'online-hearing-test',
        order: 8,
        status: 'published',
    },
    {
        title_uz: 'Muddatli to\'lovga eshitish apparatlari',
        title_ru: 'Слуховые аппараты в рассрочку',
        excerpt_uz: 'Zamonaviy eshitish apparatlari 0% muddatli to\'lov, banklarning ishtirokisiz va qo\'shimcha to\'lovlarsiz, bitta qabulda.',
        excerpt_ru: 'Cовременные слуховые аппараты в рассрочку 0% без переплат и участия банков всего за 1 прием.',
        slug: 'sluhovye-apparaty-v-rassrochku',
        order: 9,
        status: 'published',
    },
    {
        title_uz: 'Tibbiy xizmatlar narxlari',
        title_ru: 'Цены на медицинские услуги',
        excerpt_uz: 'Surdolog shifokorining xizmatlari va eshitish diagnostikasi uchun to\'liq narxlar ro\'yxati.',
        excerpt_ru: 'Полный прейскурант цен на услуги врача-сурдолога и диагностику слуха в Минске, Бресте, Гродно, Витебске, Гомеле, Могилеве.',
        slug: 'tseny-na-uslugi-vracha',
        order: 10,
        status: 'published',
    },
    {
        title_uz: 'Audiometriya',
        title_ru: 'Аудиометрия',
        excerpt_uz: 'Audiometriya qanday va qanday hollarda bajariladi, audiogramma qanday dekodlanadi va qanday natijalar ko\'rsatadi. Tonal, nutqiy va yuzaki audiogramma - farqi nima?',
        excerpt_ru: 'Как и в каких случаях выполняется аудиометрия, как расшифровывается аудиограмма и какие результаты показывает. Тональная, речевая и надпороговая аудиограмма - в чем отличие.',
        slug: 'audiometriya',
        order: 11,
        status: 'published',
    },
    {
        title_uz: 'Kattalarda eshitish diagnostikasi',
        title_ru: 'Диагностика слуха у взрослых',
        excerpt_uz: 'Kattada eshitishni baholash uchun surdologlar 10 dan ortiq audiologik testlarni o\'tkazadi. Diagnostika Interacoustics (Daniya) firmasining eng yangi uskunalari yordamida amalga oshiriladi.',
        excerpt_ru: 'Для оценки слуха у взрослого сурдологи проводят более 10 аудиологических тестов. Диагностика выполняется на новейшем оборудовании фирмы Interacoustics (Дания).',
        slug: 'diagnostika-sluha',
        order: 12,
        status: 'published',
    },
];
async function seedServices() {
    console.log('🌱 Seeding services from sluh.by reference...\n');
    // Check if services already exist
    const existing = await prisma.service.findMany({
        where: {
            slug: {
                in: services.map((s) => s.slug),
            },
        },
    });
    if (existing.length > 0) {
        console.log(`⚠️  Found ${existing.length} existing services. Updating...`);
        for (const service of services) {
            const existingService = existing.find((s) => s.slug === service.slug);
            if (existingService) {
                await prisma.service.update({
                    where: { id: existingService.id },
                    data: {
                        title_uz: service.title_uz,
                        title_ru: service.title_ru,
                        excerpt_uz: service.excerpt_uz,
                        excerpt_ru: service.excerpt_ru,
                        order: service.order,
                        status: service.status,
                    },
                });
                console.log(`✅ Updated: ${service.title_uz} / ${service.title_ru}`);
            }
            else {
                await prisma.service.create({
                    data: service,
                });
                console.log(`✅ Created: ${service.title_uz} / ${service.title_ru}`);
            }
        }
    }
    else {
        // Create all services
        for (const service of services) {
            await prisma.service.create({
                data: service,
            });
            console.log(`✅ Created: ${service.title_uz} / ${service.title_ru}`);
        }
    }
    console.log(`\n✅ Successfully seeded ${services.length} services!`);
    console.log('\n📝 Services will now appear on:');
    console.log('   - Homepage: Services section');
    console.log('   - /services page: Full listing');
    console.log('\n💡 You can manage these services in the admin panel:');
    console.log('   Admin Panel → Services');
}
seedServices()
    .catch((error) => {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-services-sluh.js.map