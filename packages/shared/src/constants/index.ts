export const BRAND_COLORS = {
  primary: '#F07E22',
  accent: '#3F3091',
} as const;

export const ROLE_PERMISSIONS = {
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
} as const;

export const DEFAULT_FEATURE_FLAGS = {
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
} as const;

export const STATUS_VALUES = ['published', 'draft', 'archived'] as const;

export type Status = (typeof STATUS_VALUES)[number];

export const DEFAULT_MENUS = {
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
          id: 'menu-catalog-hearing-aids',
          title_uz: 'Eshitish moslamalari',
          title_ru: 'Слуховые аппараты',
          href: '/catalog?productType=hearing-aids',
          order: 10,
        },
        {
          id: 'menu-catalog-children',
          title_uz: 'Bolalar uchun',
          title_ru: 'Детские',
          href: '/catalog?productType=hearing-aids&filter=children',
          order: 20,
        },
        {
          id: 'menu-catalog-wireless',
          title_uz: 'Simsiz aksessuarlar',
          title_ru: 'Беспроводные аксессуары',
          href: '/catalog?productType=accessories&filter=wireless',
          order: 30,
        },
        {
          id: 'menu-catalog-interacoustics',
          title_uz: 'Interacoustics',
          title_ru: 'Interacoustics',
          href: '/catalog?productType=interacoustics',
          order: 40,
        },
        {
          id: 'menu-catalog-accessories',
          title_uz: 'Aksessuarlar',
          title_ru: 'Аксессуары',
          href: '/catalog?productType=accessories',
          order: 50,
        },
        {
          id: 'menu-catalog-earmolds',
          title_uz: 'Quloq qo\'shimchalari',
          title_ru: 'Ушные вкладыши',
          href: '/catalog/earmolds',
          order: 60,
        },
        {
          id: 'menu-catalog-batteries',
          title_uz: 'Batareyalar',
          title_ru: 'Батарейки',
          href: '/catalog/batteries',
          order: 70,
        },
        {
          id: 'menu-catalog-care',
          title_uz: 'Parvarish vositalari',
          title_ru: 'Средства ухода',
          href: '/catalog/care',
          order: 80,
        },
      ],
    },
    {
      id: 'menu-doctors',
      title_uz: 'Mutaxassislar',
      title_ru: 'Специалисты',
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
} as const;

