"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MENUS = exports.STATUS_VALUES = exports.DEFAULT_FEATURE_FLAGS = exports.ROLE_PERMISSIONS = exports.BRAND_COLORS = void 0;
exports.BRAND_COLORS = {
    primary: '#F07E22',
    accent: '#3F3091',
};
exports.ROLE_PERMISSIONS = {
    superadmin: ['*'],
    admin: [
        'users.read',
        'users.write',
        'content.*',
        'settings.read',
        'settings.write',
        'media.*',
        'leads.read',
        'audit.read',
    ],
    editor: [
        'content.*',
        'media.*',
        'leads.read',
    ],
    viewer: [
        'content.read',
        'media.read',
        'leads.read',
    ],
};
exports.DEFAULT_FEATURE_FLAGS = {
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
};
exports.STATUS_VALUES = ['published', 'draft', 'archived'];
exports.DEFAULT_MENUS = {
    header: [
        {
            id: 'menu-services',
            title_uz: 'Xizmatlar',
            title_ru: 'Услуги',
            href: '/services',
            order: 10,
        },
        {
            id: 'menu-catalog',
            title_uz: 'Katalog',
            title_ru: 'Каталог',
            href: '/catalog',
            order: 20,
            children: [
                {
                    id: 'menu-catalog-bte',
                    title_uz: 'BTE (Quloq orqasida)',
                    title_ru: 'BTE (За ухом)',
                    href: '/catalog#category-bte',
                    order: 10,
                },
                {
                    id: 'menu-catalog-ite',
                    title_uz: 'ITE (Quloq ichida)',
                    title_ru: 'ITE (В ухе)',
                    href: '/catalog#category-ite',
                    order: 20,
                },
                {
                    id: 'menu-catalog-ric',
                    title_uz: 'RIC (Kanal ichida)',
                    title_ru: 'RIC (В канале)',
                    href: '/catalog#category-ric',
                    order: 30,
                },
                {
                    id: 'menu-catalog-children',
                    title_uz: 'Bolalar uchun apparatlar',
                    title_ru: 'Аппараты для детей',
                    href: '/catalog#category-children',
                    order: 40,
                },
                {
                    id: 'menu-catalog-accessories',
                    title_uz: 'Aksessuarlar va parvarish',
                    title_ru: 'Аксессуары и уход',
                    href: '/catalog#category-accessories',
                    order: 50,
                },
                {
                    id: 'menu-catalog-power',
                    title_uz: 'Kuchli BTE yechimlari',
                    title_ru: 'Мощные BTE решения',
                    href: '/catalog#category-power',
                    order: 60,
                },
            ],
        },
        {
            id: 'menu-doctors',
            title_uz: 'Shifokorlar',
            title_ru: 'Врачи',
            href: '/doctors',
            order: 30,
        },
        {
            id: 'menu-patients',
            title_uz: 'Bemorlar',
            title_ru: 'Пациентам',
            href: '/patients',
            order: 40,
        },
        {
            id: 'menu-children',
            title_uz: 'Bolalar',
            title_ru: 'Дети и слух',
            href: '/children-hearing',
            order: 50,
        },
        {
            id: 'menu-about',
            title_uz: 'Biz haqimizda',
            title_ru: 'О нас',
            href: '/about',
            order: 60,
        },
        {
            id: 'menu-branches',
            title_uz: 'Manzillar',
            title_ru: 'Наши адреса',
            href: '/branches',
            order: 70,
        },
    ],
    footer: [
        {
            id: 'footer-about',
            title_uz: 'Biz haqimizda',
            title_ru: 'О нас',
            href: '/about',
            order: 10,
        },
        {
            id: 'footer-branches',
            title_uz: 'Filial manzillari',
            title_ru: 'Адреса филиалов',
            href: '/branches',
            order: 20,
        },
        {
            id: 'footer-services',
            title_uz: 'Xizmatlar',
            title_ru: 'Услуги',
            href: '/services',
            order: 30,
        },
        {
            id: 'footer-contacts',
            title_uz: 'Bog‘lanish',
            title_ru: 'Контакты',
            href: '/contacts',
            order: 40,
        },
        {
            id: 'footer-faq',
            title_uz: 'Savollar',
            title_ru: 'Вопросы',
            href: '/faq',
            order: 50,
        },
        {
            id: 'footer-feedback',
            title_uz: 'Fikr bildirish',
            title_ru: 'Обратная связь',
            href: '/feedback',
            order: 60,
        },
    ],
};
//# sourceMappingURL=index.js.map