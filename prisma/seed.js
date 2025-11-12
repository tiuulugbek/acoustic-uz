"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function clearDatabase() {
    await prisma.lead.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.page.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.faq.deleteMany();
    await prisma.post.deleteMany();
    await prisma.showcase.deleteMany();
    await prisma.product.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.service.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.setting.deleteMany();
    await prisma.media.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
}
async function seedRoles() {
    const roles = [
        { name: 'superadmin', permissions: ['*'] },
        {
            name: 'admin',
            permissions: [
                'users.read',
                'users.write',
                'content.*',
                'settings.read',
                'settings.write',
                'media.*',
                'leads.read',
                'audit.read',
            ],
        },
        {
            name: 'editor',
            permissions: ['content.*', 'media.*', 'leads.read'],
        },
        {
            name: 'viewer',
            permissions: ['content.read', 'media.read', 'leads.read'],
        },
    ];
    for (const role of roles) {
        await prisma.role.create({ data: role });
    }
}
async function seedUsers() {
    const superadminRole = await prisma.role.findUniqueOrThrow({
        where: { name: 'superadmin' },
    });
    const hashedPassword = await bcrypt.hash('Admin#12345', 10);
    await prisma.user.create({
        data: {
            email: 'admin@acoustic.uz',
            password: hashedPassword,
            fullName: 'Super Admin',
            roleId: superadminRole.id,
            mustChangePassword: true,
        },
    });
}
async function seedSettings() {
    await prisma.setting.create({
        data: {
            id: 'singleton',
            phonePrimary: '1385',
            phoneSecondary: '+998 71 202 14 41',
            email: 'info@acoustic.uz',
            brandPrimary: '#F07E22',
            brandAccent: '#3F3091',
            featureFlags: {
                home: {
                    hero: true,
                    services: true,
                    hearingAidCategories: true,
                    interacousticsCarousel: true,
                    cochlearGrid: true,
                    pathToBetterHearing: true,
                    freshPosts: true,
                    faq: true,
                    branches: true,
                    strongCta: true,
                },
                integrations: {
                    telegram: true,
                    smtpFallback: false,
                    analytics: false,
                    sentry: false,
                },
            },
            socialLinks: {
                facebook: 'https://facebook.com/acousticuz',
                instagram: 'https://instagram.com/acoustic.uz',
                telegram: 'https://t.me/acousticuz',
            },
        },
    });
}
async function seedBanners() {
    const banners = Array.from({ length: 3 }).map((_, index) => ({
        title_uz: `Banner ${index + 1} - O'zbek`,
        title_ru: `Баннер ${index + 1} - Русский`,
        text_uz: `Banner ${index + 1} matni - O'zbek`,
        text_ru: `Текст баннера ${index + 1} - Русский`,
        ctaText_uz: "Qo'ng'iroq qilish",
        ctaText_ru: 'Позвонить',
        ctaLink: 'tel:+998712021441',
        order: index + 1,
        status: 'published',
    }));
    await prisma.banner.createMany({ data: banners });
}
async function seedServices() {
    const services = [
        {
            title_uz: 'Eshitish qobiliyatini tekshirish',
            title_ru: 'Проверка слуха',
            excerpt_uz: 'To’liq diagnostika va konsultatsiya',
            excerpt_ru: 'Полная диагностика и консультация',
            slug: 'eshitish-qobiliyatini-tekshirish',
            order: 1,
            status: 'published',
        },
        {
            title_uz: "Quloq apparatlarini tanlash",
            title_ru: 'Подбор слуховых аппаратов',
            excerpt_uz: "Individuallashtirilgan yechimlar",
            excerpt_ru: 'Индивидуальные решения',
            slug: 'quloq-apparatlarini-tanlash',
            order: 2,
            status: 'published',
        },
        {
            title_uz: "Quloq apparatlari xizmat ko'rsatish",
            title_ru: 'Обслуживание слуховых аппаратов',
            excerpt_uz: 'Tozalash va sozlash',
            excerpt_ru: 'Чистка и настройка',
            slug: 'quloq-apparatlari-xizmat',
            order: 3,
            status: 'published',
        },
        {
            title_uz: 'Koxlear implantlar',
            title_ru: 'Кохлеарные импланты',
            excerpt_uz: 'Murakkab eshitish yechimlari',
            excerpt_ru: 'Комплексные слуховые решения',
            slug: 'koxlear-implantlar',
            order: 4,
            status: 'published',
        },
    ];
    await prisma.service.createMany({ data: services });
}
async function seedBrandsAndCategories() {
    const brands = await prisma.$transaction([
        prisma.brand.create({
            data: {
                name: 'Interacoustics',
                slug: 'interacoustics',
                desc_uz: 'Interacoustics brendi tavsifi',
                desc_ru: 'Описание бренда Interacoustics',
            },
        }),
        prisma.brand.create({
            data: {
                name: 'Cochlear',
                slug: 'cochlear',
                desc_uz: 'Cochlear brendi tavsifi',
                desc_ru: 'Описание бренда Cochlear',
            },
        }),
    ]);
    const categoriesData = [
        { name_uz: 'BTE (Quloq orqasida)', name_ru: 'BTE (За ухом)', slug: 'category-bte' },
        { name_uz: 'ITE (Quloq ichida)', name_ru: 'ITE (В ухе)', slug: 'category-ite' },
        { name_uz: 'RIC (Kanal ichida)', name_ru: 'RIC (В канале)', slug: 'category-ric' },
        { name_uz: 'CIC (Chuqur kanal)', name_ru: 'CIC (Глубокий канал)', slug: 'category-cic' },
        { name_uz: 'Power BTE', name_ru: 'Power BTE', slug: 'category-power-bte' },
        { name_uz: 'Mini BTE', name_ru: 'Mini BTE', slug: 'category-mini-bte' },
        { name_uz: 'RITE', name_ru: 'RITE', slug: 'category-rite' },
        { name_uz: 'IIC (Chuqur)', name_ru: 'IIC (Глубокий)', slug: 'category-iic' },
        { name_uz: 'Boshqa', name_ru: 'Другое', slug: 'category-other' },
    ];
    await prisma.productCategory.createMany({ data: categoriesData });
    return {
        brands,
        categories: await prisma.productCategory.findMany(),
    };
}
async function seedProducts() {
    const brandList = await prisma.brand.findMany();
    const categoryList = await prisma.productCategory.findMany();
    const products = Array.from({ length: 12 }).map((_, index) => {
        const brand = brandList[index % brandList.length];
        const category = categoryList[index % categoryList.length];
        return {
            name_uz: `Quloq apparati ${index + 1}`,
            name_ru: `Слуховой аппарат ${index + 1}`,
            slug: `product-${index + 1}`,
            description_uz: `Quloq apparati ${index + 1} haqida qisqacha ma'lumot`,
            description_ru: `Краткое описание слухового аппарата ${index + 1}`,
            price: new client_1.Prisma.Decimal(1200000 + index * 200000),
            stock: 10 + index,
            brandId: brand.id,
            categoryId: category.id,
            specsJson: {
                color: index % 2 === 0 ? 'Bej' : 'Kumush',
                battery: index % 3 === 0 ? 'Zaryadlanadigan' : 'Batareya',
                connectivity: index % 2 === 0 ? 'Bluetooth' : '2.4 GHz',
            },
            status: 'published',
        };
    });
    await prisma.product.createMany({ data: products });
}
async function seedShowcases() {
    const products = await prisma.product.findMany({ select: { id: true } });
    const interacousticsProducts = products.filter((_, index) => index % 2 === 0).slice(0, 9);
    const cochlearProducts = products.filter((_, index) => index % 2 === 1).slice(0, 9);
    await prisma.showcase.create({
        data: {
            type: 'interacoustics',
            productIds: interacousticsProducts.map((p) => p.id),
        },
    });
    await prisma.showcase.create({
        data: {
            type: 'cochlear',
            productIds: cochlearProducts.map((p) => p.id),
        },
    });
}
async function seedPosts() {
    const posts = Array.from({ length: 3 }).map((_, index) => ({
        title_uz: `Maqola ${index + 1} - O'zbek`,
        title_ru: `Статья ${index + 1} - Русский`,
        body_uz: `Maqola ${index + 1} matni - O'zbek`,
        body_ru: `Текст статьи ${index + 1} - Русский`,
        excerpt_uz: `Maqola ${index + 1} qisqacha matn - O'zbek`,
        excerpt_ru: `Краткое описание статьи ${index + 1} - Русский`,
        slug: `post-${index + 1}`,
        tags: ['eshitish', 'maslahat'],
        status: 'published',
        publishAt: new Date(),
    }));
    await prisma.post.createMany({ data: posts });
}
async function seedFaq() {
    const faqData = [
        {
            question_uz: "Quloq apparatini qanday tanlash kerak?",
            question_ru: 'Как подобрать слуховой аппарат?',
            answer_uz: "Mutaxassislarimiz maxsus testlar asosida tavsiya berishadi.",
            answer_ru: 'Наши специалисты подбирают решение после диагностики.',
            order: 1,
            status: 'published',
        },
        {
            question_uz: 'Garantiya muddati qancha?',
            question_ru: 'Какой срок гарантии?',
            answer_uz: 'Har bir apparat uchun 12 oygacha kafolat beriladi.',
            answer_ru: 'На каждый аппарат предоставляется гарантия до 12 месяцев.',
            order: 2,
            status: 'published',
        },
        {
            question_uz: "Servis xizmatlari mavjudmi?",
            question_ru: 'Есть ли сервисное обслуживание?',
            answer_uz: "Ha, muntazam texnik xizmat ko'rsatish mavjud.",
            answer_ru: 'Да, доступно регулярное сервисное обслуживание.',
            order: 3,
            status: 'published',
        },
    ];
    await prisma.faq.createMany({ data: faqData });
}
async function seedBranches() {
    const branches = Array.from({ length: 4 }).map((_, index) => ({
        name_uz: `Filial ${index + 1}`,
        name_ru: `Филиал ${index + 1}`,
        address_uz: `Toshkent, ${index + 1}-ko'cha, ${index + 1}-uy`,
        address_ru: `Ташкент, улица ${index + 1}, дом ${index + 1}`,
        phone: `+998 71 202 ${1400 + index}`,
        phones: [`+998 90 123 ${5600 + index}`],
        map_iframe: 'https://maps.google.com',
        order: index + 1,
    }));
    await prisma.branch.createMany({ data: branches });
}
async function seedPages() {
    const pages = [
        {
            slug: 'about',
            title_uz: 'Biz haqimizda',
            title_ru: 'О нас',
            body_uz: 'Acoustic.uz — eshitish markazlari tarmog\'i.',
            body_ru: 'Acoustic.uz — сеть центров слуха.',
            status: 'published',
        },
        {
            slug: 'contacts',
            title_uz: 'Kontaktlar',
            title_ru: 'Контакты',
            body_uz: "Biz bilan bog'laning: +998 71 202 14 41",
            body_ru: 'Свяжитесь с нами: +998 71 202 14 41',
            status: 'published',
        },
    ];
    await prisma.page.createMany({ data: pages });
}
async function main() {
    console.log('🌱 Starting database seed...');
    await clearDatabase();
    await seedRoles();
    await seedUsers();
    await seedSettings();
    await seedBanners();
    await seedServices();
    await seedBrandsAndCategories();
    await seedProducts();
    await seedShowcases();
    await seedPosts();
    await seedFaq();
    await seedBranches();
    await seedPages();
    console.log('✅ Database seeded successfully!');
}
main()
    .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map