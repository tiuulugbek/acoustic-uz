import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getHomepageHearingAidItems, getProductCategories } from '@/lib/api-server';
import type { HearingAidItemResponse } from '@/lib/api';
import { detectLocale } from '@/lib/locale-server';

// Force dynamic rendering to ensure locale is always read from cookies
// This prevents Next.js from caching the page with a stale locale
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  
  // Fetch data from backend - same source as homepage Product Catalog section
  const [hearingItemsData, categoriesData] = await Promise.all([
    getHomepageHearingAidItems(locale),
    getProductCategories(locale),
  ]);

  // Transform hearing items from backend - same logic as homepage
  // This ensures the catalog page shows the same items as the homepage Product Catalog section
  const hearingItems = (hearingItemsData && hearingItemsData.length > 0 ? hearingItemsData : []).map((item, index) => {
    const title = locale === 'ru' ? (item.title_ru || '') : (item.title_uz || '');
    const description = locale === 'ru' ? (item.description_ru || '') : (item.description_uz || '');
    
    // Build image URL
    let image = item.image?.url || '';
    if (image && image.startsWith('/') && !image.startsWith('//')) {
      const baseUrl = API_BASE_URL.replace('/api', '');
      image = `${baseUrl}${image}`;
    }
    
    // Try to find matching category, or use link from API
    let link = item.link || '/catalog';
    if (link === '/catalog' || link.startsWith('/catalog?category=')) {
      // Try to find matching category by title
      const matchingCategory = categoriesData.find((cat) => {
        const catNameUz = (cat.name_uz || '').toLowerCase();
        const catNameRu = (cat.name_ru || '').toLowerCase();
        const itemTitleUz = (item.title_uz || '').toLowerCase();
        const itemTitleRu = (item.title_ru || '').toLowerCase();
        return catNameUz.includes(itemTitleUz) || 
               catNameRu.includes(itemTitleRu) || 
               itemTitleUz.includes(catNameUz) || 
               itemTitleRu.includes(catNameRu);
      });
      if (matchingCategory?.slug) {
        link = `/catalog/${matchingCategory.slug}`;
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
      id: item.id ?? `hearing-${index}`,
      title: title || '',
      description: description || '',
      image: image || '',
      link,
    };
  });

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-6">
          <Link href="/" className="hover:text-brand-primary" suppressHydrationWarning>
            {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-brand-primary" suppressHydrationWarning>{locale === 'ru' ? 'Каталог' : 'Katalog'}</span>
        </div>
      </section>

      <section className="bg-brand-accent text-white">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/90" suppressHydrationWarning>
            {locale === 'ru' ? 'Слуховые аппараты' : 'Eshitish apparatlari'}
          </p>
          <h1 className="text-3xl font-bold md:text-4xl" suppressHydrationWarning>
            {locale === 'ru' ? 'Решения для вашего образа жизни' : 'Turmush tarziga mos eshitish yechimlari'}
          </h1>
          <p className="max-w-4xl text-base leading-relaxed text-white/90" suppressHydrationWarning>
            {locale === 'ru'
              ? 'Мы подберём аппарат под ваши привычки, уровень активности и бюджет. Выберите один из разделов, затем просмотрите подходящие товары в каталоге.'
              : "Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz. Bo'limlardan birini tanlang, keyin esa katalog ichida mos mahsulotlarni ko'ring."}
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
          {hearingItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {hearingItems.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="group flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
              >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-primary/10">
                  {item.image ? (
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill 
                      sizes="112px" 
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      suppressHydrationWarning
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-primary">
                      <span className="text-white text-xs font-bold">Acoustic</span>
                    </div>
                  )}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground" suppressHydrationWarning>
                {locale === 'ru' 
                  ? 'Каталог продуктов пуст. Товары будут добавлены в ближайшее время.' 
                  : 'Mahsulotlar katalogi bo\'sh. Mahsulotlar tez orada qo\'shiladi.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}