export declare const BRAND_COLORS: {
    readonly primary: "#F07E22";
    readonly accent: "#3F3091";
};
export declare const ROLE_PERMISSIONS: {
    readonly superadmin: readonly ["*"];
    readonly admin: readonly ["users.read", "users.write", "content.*", "settings.read", "settings.write", "media.*", "leads.read", "audit.read"];
    readonly editor: readonly ["content.*", "media.*", "leads.read"];
    readonly viewer: readonly ["content.read", "media.read", "leads.read"];
};
export declare const DEFAULT_FEATURE_FLAGS: {
    readonly home: {
        readonly hero: true;
        readonly services: true;
        readonly hearingAidCategories: true;
        readonly interacousticsCarousel: true;
        readonly cochlearGrid: true;
        readonly pathToBetterHearing: true;
        readonly freshPosts: true;
        readonly faq: true;
        readonly branches: true;
        readonly strongCta: true;
    };
    readonly integrations: {
        readonly telegram: true;
        readonly smtpFallback: false;
        readonly analytics: false;
        readonly sentry: false;
    };
};
export declare const STATUS_VALUES: readonly ["published", "draft", "archived"];
export type Status = (typeof STATUS_VALUES)[number];
export declare const DEFAULT_MENUS: {
    readonly header: readonly [{
        readonly id: "menu-services";
        readonly title_uz: "Xizmatlar";
        readonly title_ru: "Услуги";
        readonly href: "/services";
        readonly order: 10;
    }, {
        readonly id: "menu-catalog";
        readonly title_uz: "Katalog";
        readonly title_ru: "Каталог";
        readonly href: "/catalog";
        readonly order: 20;
        readonly children: readonly [{
            readonly id: "menu-catalog-bte";
            readonly title_uz: "BTE (Quloq orqasida)";
            readonly title_ru: "BTE (За ухом)";
            readonly href: "/catalog#category-bte";
            readonly order: 10;
        }, {
            readonly id: "menu-catalog-ite";
            readonly title_uz: "ITE (Quloq ichida)";
            readonly title_ru: "ITE (В ухе)";
            readonly href: "/catalog#category-ite";
            readonly order: 20;
        }, {
            readonly id: "menu-catalog-ric";
            readonly title_uz: "RIC (Kanal ichida)";
            readonly title_ru: "RIC (В канале)";
            readonly href: "/catalog#category-ric";
            readonly order: 30;
        }, {
            readonly id: "menu-catalog-children";
            readonly title_uz: "Bolalar uchun apparatlar";
            readonly title_ru: "Аппараты для детей";
            readonly href: "/catalog#category-children";
            readonly order: 40;
        }, {
            readonly id: "menu-catalog-accessories";
            readonly title_uz: "Aksessuarlar va parvarish";
            readonly title_ru: "Аксессуары и уход";
            readonly href: "/catalog#category-accessories";
            readonly order: 50;
        }, {
            readonly id: "menu-catalog-power";
            readonly title_uz: "Kuchli BTE yechimlari";
            readonly title_ru: "Мощные BTE решения";
            readonly href: "/catalog#category-power";
            readonly order: 60;
        }];
    }, {
        readonly id: "menu-doctors";
        readonly title_uz: "Shifokorlar";
        readonly title_ru: "Врачи";
        readonly href: "/doctors";
        readonly order: 30;
    }, {
        readonly id: "menu-patients";
        readonly title_uz: "Bemorlar";
        readonly title_ru: "Пациентам";
        readonly href: "/patients";
        readonly order: 40;
    }, {
        readonly id: "menu-children";
        readonly title_uz: "Bolalar va eshitish";
        readonly title_ru: "Дети и слух";
        readonly href: "/children-hearing";
        readonly order: 50;
    }, {
        readonly id: "menu-about";
        readonly title_uz: "Biz haqimizda";
        readonly title_ru: "О нас";
        readonly href: "/about";
        readonly order: 60;
    }, {
        readonly id: "menu-branches";
        readonly title_uz: "Manzillar";
        readonly title_ru: "Наши адреса";
        readonly href: "/branches";
        readonly order: 70;
    }];
    readonly footer: readonly [{
        readonly id: "footer-about";
        readonly title_uz: "Biz haqimizda";
        readonly title_ru: "О нас";
        readonly href: "/about";
        readonly order: 10;
    }, {
        readonly id: "footer-branches";
        readonly title_uz: "Filial manzillari";
        readonly title_ru: "Адреса филиалов";
        readonly href: "/branches";
        readonly order: 20;
    }, {
        readonly id: "footer-services";
        readonly title_uz: "Xizmatlar";
        readonly title_ru: "Услуги";
        readonly href: "/services";
        readonly order: 30;
    }, {
        readonly id: "footer-contacts";
        readonly title_uz: "Bog‘lanish";
        readonly title_ru: "Контакты";
        readonly href: "/contacts";
        readonly order: 40;
    }, {
        readonly id: "footer-faq";
        readonly title_uz: "Savollar";
        readonly title_ru: "Вопросы";
        readonly href: "/faq";
        readonly order: 50;
    }, {
        readonly id: "footer-feedback";
        readonly title_uz: "Fikr bildirish";
        readonly title_ru: "Обратная связь";
        readonly href: "/feedback";
        readonly order: 60;
    }];
};
//# sourceMappingURL=index.d.ts.map