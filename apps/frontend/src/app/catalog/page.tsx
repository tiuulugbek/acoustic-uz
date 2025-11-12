import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getHomepageHearingAidItems, type HearingAidItemResponse } from '@/lib/api';
import { getProductCategories, type ProductCategoryResponse } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const catalogUrl = `${baseUrl}/catalog`;

  return {
    title: locale === 'ru' ? 'Каталог — Acoustic.uz' : 'Katalog — Acoustic.uz',
    description: locale === 'ru'
      ? 'Каталог слуховых аппаратов и решений от Acoustic. Выберите подходящий аппарат под ваш образ жизни, уровень активности и бюджет.'
      : "Acoustic eshitish markazining katalogi — eshitish apparatlari, implantlar va aksessuarlar haqida ma'lumot.",
    alternates: {
      canonical: catalogUrl,
      languages: {
        uz: catalogUrl,
        ru: catalogUrl,
        'x-default': catalogUrl,
      },
    },
  };
}

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180">
  <rect width="100%" height="100%" fill="#F07E22" rx="12" />
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24">
    Acoustic
  </text>
</svg>`;
const placeholderImage = `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;


async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error('Failed to load catalog data', error);
    return fallback;
  }
}

async function getHearingItems(locale?: string): Promise<HearingAidItemResponse[]> {
  return safeFetch(getHomepageHearingAidItems(locale), [] as HearingAidItemResponse[]);
}

async function getCategories(locale?: string): Promise<ProductCategoryResponse[]> {
  return safeFetch(getProductCategories(locale), [] as ProductCategoryResponse[]);
}

// Redirect old query-based URLs to path-based
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  // Handle redirect from old query-based URLs
  if (searchParams.category) {
    redirect(`/catalog/${searchParams.category}`);
  }

  const locale = detectLocale();
  const hearingItemsData = await getHearingItems(locale);
  const categoriesData = await getCategories(locale);

  const fallbackHearingItems: Array<
    Pick<HearingAidItemResponse, 'title_uz' | 'title_ru' | 'description_uz' | 'description_ru' | 'id'> & {
      image?: { url: string } | null;
      link?: string | null;
    }
  > = [
    {
      id: 'hearing-1',
      title_uz: "Ko'rinmas quloq apparatlari",
      title_ru: 'Незаметные заушные',
      description_uz: "Quloq orqasida qulay joylashadigan, deyarli ko'rinmaydigan modelllar.",
      description_ru: 'Простые в уходе модели, которые легко скрываются за ухом.',
      link: '/catalog/category-invisible',
    },
    {
      id: 'hearing-2',
      title_uz: 'Keksalar uchun',
      title_ru: 'Для пожилых людей',
      description_uz: 'Qulay boshqaruvli, ishonchli va bardoshli eshitish yechimlari.',
      description_ru: 'Надёжные решения для пожилых клиентов.',
      link: '/catalog/category-seniors',
    },
    {
      id: 'hearing-3',
      title_uz: 'Bolalar uchun',
      title_ru: 'Для детей и подростков',
      description_uz: 'Bolalarning nutq rivojlanishini qo‘llab-quvvatlovchi modelllar.',
      description_ru: 'Решения, помогающие ребёнку развивать речь.',
      link: '/catalog/category-children',
    },
    {
      id: 'hearing-4',
      title_uz: 'AI texnologiyalari',
      title_ru: 'С AI-технологиями',
      description_uz: 'Sun’iy intellekt asosidagi aqlli eshitish yechimlari.',
      description_ru: 'Умные технологии на базе искусственного интеллекта.',
      link: '/catalog/category-ai',
    },
    {
      id: 'hearing-5',
      title_uz: "Ikkinchi darajadagi eshitish yo'qotilishi",
      title_ru: 'При тугоухости 2 степени',
      description_uz: "O'rtacha eshitish yo'qotilishi uchun keng tanlov.",
      description_ru: 'Большой выбор моделей для умеренной тугоухости.',
      link: '/catalog/category-moderate-loss',
    },
    {
      id: 'hearing-6',
      title_uz: 'Kuchli va superkuchli',
      title_ru: 'Мощные и супермощные',
      description_uz: '3-4 darajali eshitish yo‘qotilishi uchun kuchli apparatlar.',
      description_ru: 'Решения для 3 и 4 степени снижения слуха.',
      link: '/catalog/category-powerful',
    },
    {
      id: 'hearing-7',
      title_uz: 'Tovushni boshqarish',
      title_ru: 'Управление шумом в ушах',
      description_uz: 'Shovqinni niqoblaydigan tovush terapiyasi.',
      description_ru: 'Эффективная терапия, маскирующая шум в ушах.',
      link: '/catalog/category-tinnitus',
    },
    {
      id: 'hearing-8',
      title_uz: 'Smartfon uchun',
      title_ru: 'Для смартфона',
      description_uz: "Smartfoningizdan to'g'ridan-to'g'ri sifatli ovoz.",
      description_ru: 'Звук высокого качества прямо со смартфона.',
      link: '/catalog/category-smartphone',
    },
    {
      id: 'hearing-9',
      title_uz: "Ko'rinmas",
      title_ru: 'Невидимые',
      description_uz: 'Kichik, sezilmaydigan eshitish apparatlari.',
      description_ru: 'Незаметные решения, скрывающие проблему.',
      link: '/catalog/category-invisible',
    },
  ];

  const hearingItems = (hearingItemsData.length ? hearingItemsData : fallbackHearingItems).map((item, index) => {
    const fallback = fallbackHearingItems[index % fallbackHearingItems.length];
    const title = getBilingualText(item.title_uz ?? fallback.title_uz, item.title_ru ?? fallback.title_ru, locale);
    const description = getBilingualText(item.description_uz ?? fallback.description_uz ?? '', item.description_ru ?? fallback.description_ru ?? '', locale);
    const image = item.image?.url ?? placeholderImage;
    // Try to find category by matching title, or use link from API/fallback
    let link = item.link ?? fallback.link ?? '#';
    if (link === '#' || link.startsWith('/catalog?category=')) {
      // Try to find matching category
      const matchingCategory = categoriesData.find((cat) => {
        const catNameUz = cat.name_uz.toLowerCase();
        const catNameRu = cat.name_ru.toLowerCase();
        const itemTitleUz = (item.title_uz ?? '').toLowerCase();
        const itemTitleRu = (item.title_ru ?? '').toLowerCase();
        return catNameUz.includes(itemTitleUz) || catNameRu.includes(itemTitleRu) || itemTitleUz.includes(catNameUz) || itemTitleRu.includes(catNameRu);
      });
      if (matchingCategory) {
        link = `/catalog/${matchingCategory.slug}`;
      } else if (fallback.link && fallback.link.startsWith('/catalog/')) {
        link = fallback.link;
      }
    }
    // Convert old query-based links to path-based
    if (link.startsWith('/catalog?category=')) {
      const categorySlug = link.split('category=')[1]?.split('&')[0];
      if (categorySlug) {
        link = `/catalog/${categorySlug}`;
      }
    }

    return {
      id: item.id ?? fallback.id,
      title,
      description,
      image,
      link,
    };
  });

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-6">
          <Link href="/" className="hover:text-brand-primary">
            {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-brand-primary">{locale === 'ru' ? 'Каталог' : 'Katalog'}</span>
        </div>
      </section>

      <section className="bg-brand-accent text-white">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/90">
            {locale === 'ru' ? 'Слуховые аппараты' : 'Eshitish apparatlari'}
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">
            {locale === 'ru' ? 'Решения для вашего образа жизни' : 'Turmush tarziga mos eshitish yechimlari'}
          </h1>
          <p className="max-w-4xl text-base leading-relaxed text-white/90">
            {locale === 'ru'
              ? 'Мы подберём аппарат под ваши привычки, уровень активности и бюджет. Выберите один из разделов, затем просмотрите подходящие товары в каталоге.'
              : "Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz. Bo'limlardan birini tanlang, keyin esa katalog ichida mos mahsulotlarni ko'ring."}
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hearingItems.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="group flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
              >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-primary/10">
                  <Image src={item.image} alt={item.title} fill sizes="112px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-brand-accent group-hover:text-brand-primary">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-snug">{item.description}</p>
                  <span className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-brand-primary group-hover:text-brand-accent">
                    {locale === 'ru' ? 'Подробнее' : 'Batafsil'} ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}