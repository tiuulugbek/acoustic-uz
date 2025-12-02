import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding homepage content...');

  // Seed Homepage Sections
  console.log('📝 Seeding Homepage Sections...');
  const sections = [
    {
      id: 'section-services',
      key: 'services',
      title_uz: 'Bizning xizmatlar',
      title_ru: 'Наши услуги',
      subtitle_uz: null,
      subtitle_ru: null,
      description_uz: null,
      description_ru: null,
      showTitle: true,
      showSubtitle: false,
      showDescription: false,
      order: 1,
      status: 'published',
    },
    {
      id: 'section-hearing-aids',
      key: 'hearing-aids',
      title_uz: 'Turmush tarziga mos eshitish yechimlari',
      title_ru: 'Решения для вашего образа жизни',
      subtitle_uz: 'Eshitish apparatlari',
      subtitle_ru: 'Слуховые аппараты',
      description_uz: 'Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz.',
      description_ru: 'Мы подберём модель, которая подходит вашему образу жизни, активности и бюджету.',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      order: 2,
      status: 'published',
    },
    {
      id: 'section-interacoustics',
      key: 'interacoustics',
      title_uz: 'Eng so\'nggi diagnostika uskunalari',
      title_ru: 'Диагностическое оборудование',
      subtitle_uz: 'Interacoustics',
      subtitle_ru: 'Interacoustics',
      description_uz: 'Audiologiya mutaxassislari uchun innovatsion yechimlar va qurilmalar tanlovi.',
      description_ru: 'Выбор инновационных решений и устройств для специалистов по аудиологии.',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      order: 3,
      status: 'published',
    },
    {
      id: 'section-journey',
      key: 'journey',
      title_uz: 'Biz qanday yordam beramiz',
      title_ru: 'Как мы помогаем',
      subtitle_uz: 'Yaxshi eshitishga yo\'l',
      subtitle_ru: 'Путь к лучшему слуху',
      description_uz: null,
      description_ru: null,
      showTitle: true,
      showSubtitle: true,
      showDescription: false,
      order: 4,
      status: 'published',
    },
    {
      id: 'section-news',
      key: 'news',
      title_uz: 'Yangiliklar',
      title_ru: 'Новости',
      subtitle_uz: null,
      subtitle_ru: null,
      description_uz: null,
      description_ru: null,
      showTitle: true,
      showSubtitle: false,
      showDescription: false,
      order: 5,
      status: 'published',
    },
  ];

  for (const section of sections) {
    await prisma.homepageSection.upsert({
      where: { key: section.key },
      update: section,
      create: section,
    });
  }
  console.log(`✅ Seeded ${sections.length} sections`);

  // Seed Homepage Links
  console.log('🔗 Seeding Homepage Links...');
  const links = [
    {
      id: 'link-services-bottom',
      sectionKey: 'services',
      text_uz: 'Batafsil',
      text_ru: 'Подробнее',
      href: '/services/{slug}',
      icon: 'arrow-right',
      position: 'bottom',
      order: 1,
      status: 'published',
    },
    {
      id: 'link-hearing-aids-bottom',
      sectionKey: 'hearing-aids',
      text_uz: 'Batafsil',
      text_ru: 'Подробнее',
      href: '/catalog/{slug}',
      icon: 'arrow-right',
      position: 'bottom',
      order: 1,
      status: 'published',
    },
    {
      id: 'link-interacoustics-header',
      sectionKey: 'interacoustics',
      text_uz: 'To\'liq katalog',
      text_ru: 'Полный каталог',
      href: '/catalog?productType=interacoustics',
      icon: 'arrow-right',
      position: 'header',
      order: 1,
      status: 'published',
    },
    {
      id: 'link-interacoustics-bottom',
      sectionKey: 'interacoustics',
      text_uz: 'To\'liq katalog',
      text_ru: 'Полный каталог',
      href: '/catalog?productType=interacoustics',
      icon: 'arrow-right',
      position: 'bottom',
      order: 2,
      status: 'published',
    },
  ];

  for (const link of links) {
    await prisma.homepageLink.upsert({
      where: { id: link.id },
      update: link,
      create: link,
    });
  }
  console.log(`✅ Seeded ${links.length} links`);

  // Seed Homepage Placeholders
  console.log('🖼️ Seeding Homepage Placeholders...');
  const placeholders = [
    {
      id: 'placeholder-services',
      sectionKey: 'services',
      imageId: null,
      text_uz: 'Acoustic',
      text_ru: 'Acoustic',
      backgroundColor: '#F07E22',
      textColor: '#FFFFFF',
      fontSize: 'text-lg',
      fontWeight: 'font-bold',
    },
    {
      id: 'placeholder-hearing-aids',
      sectionKey: 'hearing-aids',
      imageId: null,
      text_uz: 'Acoustic',
      text_ru: 'Acoustic',
      backgroundColor: '#F07E22',
      textColor: '#FFFFFF',
      fontSize: 'text-xs',
      fontWeight: 'font-bold',
    },
    {
      id: 'placeholder-interacoustics',
      sectionKey: 'interacoustics',
      imageId: null,
      text_uz: 'Acoustic',
      text_ru: 'Acoustic',
      backgroundColor: '#F07E22',
      textColor: '#FFFFFF',
      fontSize: 'text-[10px] md:text-sm',
      fontWeight: 'font-bold',
    },
  ];

  for (const placeholder of placeholders) {
    await prisma.homepagePlaceholder.upsert({
      where: { sectionKey: placeholder.sectionKey },
      update: placeholder,
      create: placeholder,
    });
  }
  console.log(`✅ Seeded ${placeholders.length} placeholders`);

  // Seed Homepage Empty States
  console.log('📭 Seeding Homepage Empty States...');
  const emptyStates = [
    {
      id: 'empty-services',
      sectionKey: 'services',
      message_uz: 'Xizmatlar tez orada qo\'shiladi.',
      message_ru: 'Услуги будут добавлены в ближайшее время.',
      icon: 'info',
    },
    {
      id: 'empty-hearing-aids',
      sectionKey: 'hearing-aids',
      message_uz: 'Mahsulotlar katalogi bo\'sh.',
      message_ru: 'Каталог продуктов пуст.',
      icon: 'info',
    },
    {
      id: 'empty-interacoustics',
      sectionKey: 'interacoustics',
      message_uz: 'Mahsulotlar topilmadi.',
      message_ru: 'Продукты не найдены.',
      icon: 'info',
    },
    {
      id: 'empty-news',
      sectionKey: 'news',
      message_uz: 'Hozircha yangiliklar yo\'q.',
      message_ru: 'Новостей пока нет.',
      icon: 'info',
    },
  ];

  for (const emptyState of emptyStates) {
    await prisma.homepageEmptyState.upsert({
      where: { sectionKey: emptyState.sectionKey },
      update: emptyState,
      create: emptyState,
    });
  }
  console.log(`✅ Seeded ${emptyStates.length} empty states`);

  // Seed Common Texts
  console.log('📝 Seeding Common Texts...');
  const commonTexts = [
    {
      id: 'text-readMore',
      key: 'readMore',
      text_uz: 'Batafsil',
      text_ru: 'Подробнее',
      category: 'button',
    },
    {
      id: 'text-fullCatalog',
      key: 'fullCatalog',
      text_uz: 'To\'liq katalog',
      text_ru: 'Полный каталог',
      category: 'button',
    },
    {
      id: 'text-backToCatalog',
      key: 'backToCatalog',
      text_uz: '← Katalogga qaytish',
      text_ru: '← Вернуться в каталог',
      category: 'button',
    },
  ];

  for (const text of commonTexts) {
    await prisma.commonText.upsert({
      where: { key: text.key },
      update: text,
      create: text,
    });
  }
  console.log(`✅ Seeded ${commonTexts.length} common texts`);

  // Seed Availability Statuses
  console.log('📊 Seeding Availability Statuses...');
  const availabilityStatuses = [
    {
      id: 'status-in-stock',
      key: 'in-stock',
      label_uz: 'Sotuvda',
      label_ru: 'В наличии',
      schema: 'https://schema.org/InStock',
      colorClass: 'text-green-600 bg-green-50',
      order: 1,
    },
    {
      id: 'status-preorder',
      key: 'preorder',
      label_uz: 'Buyurtmaga',
      label_ru: 'Под заказ',
      schema: 'https://schema.org/PreOrder',
      colorClass: 'text-amber-600 bg-amber-50',
      order: 2,
    },
    {
      id: 'status-out-of-stock',
      key: 'out-of-stock',
      label_uz: 'Tugagan',
      label_ru: 'Нет в наличии',
      schema: 'https://schema.org/OutOfStock',
      colorClass: 'text-rose-600 bg-rose-50',
      order: 3,
    },
  ];

  for (const status of availabilityStatuses) {
    await prisma.availabilityStatus.upsert({
      where: { key: status.key },
      update: status,
      create: status,
    });
  }
  console.log(`✅ Seeded ${availabilityStatuses.length} availability statuses`);

  // Seed Catalog Page Config
  console.log('⚙️ Seeding Catalog Page Config...');
  await prisma.catalogPageConfig.upsert({
    where: { id: 'singleton' },
    update: {
      hearingAidsTitle_uz: 'Eshitish moslamalari katalogi va narxlari',
      hearingAidsTitle_ru: 'Каталог и цены на слуховые аппараты',
      interacousticsTitle_uz: 'Interacoustics',
      interacousticsTitle_ru: 'Interacoustics',
      accessoriesTitle_uz: 'Aksessuarlar',
      accessoriesTitle_ru: 'Аксессуары',
      brandTabIds: [],
      brandTabOrder: ['oticon', 'resound', 'signia'],
    },
    create: {
      id: 'singleton',
      hearingAidsTitle_uz: 'Eshitish moslamalari katalogi va narxlari',
      hearingAidsTitle_ru: 'Каталог и цены на слуховые аппараты',
      interacousticsTitle_uz: 'Interacoustics',
      interacousticsTitle_ru: 'Interacoustics',
      accessoriesTitle_uz: 'Aksessuarlar',
      accessoriesTitle_ru: 'Аксессуары',
      brandTabIds: [],
      brandTabOrder: ['oticon', 'resound', 'signia'],
    },
  });
  console.log('✅ Seeded catalog page config');

  console.log('🎉 All homepage content seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding homepage content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });






