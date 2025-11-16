import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { detectLocale } from '@/lib/locale-server';
import { getServiceCategories } from '@/lib/api-server';

// Force dynamic rendering to ensure locale is always read from cookies
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const servicesUrl = `${baseUrl}/services`;

  return {
    title: locale === 'ru' ? 'Услуги — Acoustic.uz' : 'Xizmatlar — Acoustic.uz',
    description: locale === 'ru'
      ? 'Все услуги сурдолога в одном месте. Профессиональная помощь людям с тугоухостью. Диагностика, лечение и коррекция нарушений слуха у взрослых и детей с самого рождения.'
      : 'Barcha surdolog xizmatlari bir joyda. Eshitish qobiliyati buzilgan odamlarga professional yordam. Kattalar va bolalarda eshitishning diagnostikasi, davolanishi va korreksiyasi.',
    alternates: {
      canonical: servicesUrl,
      languages: {
        uz: servicesUrl,
        ru: servicesUrl,
        'x-default': servicesUrl,
      },
    },
  };
}

export default async function ServicesPage() {
  const locale = detectLocale();

  // Fetch all published service categories
  const categoriesData = await getServiceCategories(locale);

  // Filter top-level categories (no parent)
  const topLevelCategories = (categoriesData || []).filter((cat) => !cat.parentId);

  // Transform categories for display
  const categories = topLevelCategories.map((category) => {
    const name = locale === 'ru' ? (category.name_ru || '') : (category.name_uz || '');
    const description = locale === 'ru' ? (category.description_ru || '') : (category.description_uz || '');
    
    // Build image URL
    let image = category.image?.url || '';
    if (image && image.startsWith('/') && !image.startsWith('//')) {
      const baseUrl = API_BASE_URL.replace('/api', '');
      image = `${baseUrl}${image}`;
    }

    // Count services in this category
    const serviceCount = category.services?.filter((s) => s.status === 'published').length || 0;

    return {
      id: category.id,
      name: name || '',
      description: description || '',
      slug: category.slug || '#',
      image: image || '',
      serviceCount,
    };
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-6">
          <Link href="/" className="hover:text-brand-primary" suppressHydrationWarning>
            {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-brand-primary" suppressHydrationWarning>{locale === 'ru' ? 'Услуги' : 'Xizmatlar'}</span>
        </div>
      </section>

      {/* Header Section */}
      <section className="bg-brand-accent text-white">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:px-6">
          <h1 className="text-3xl font-bold md:text-4xl" suppressHydrationWarning>
            {locale === 'ru' ? 'Услуги' : 'Xizmatlar'}
          </h1>
          <p className="max-w-4xl text-base leading-relaxed text-white/90" suppressHydrationWarning>
            {locale === 'ru'
              ? 'Все услуги сурдолога в одном месте. Профессиональная помощь людям с тугоухостью. Диагностика, лечение и коррекция нарушений слуха у взрослых и детей с самого рождения.'
              : "Barcha surdolog xizmatlari bir joyda. Eshitish qobiliyati buzilgan odamlarga professional yordam. Kattalar va bolalarda eshitishning diagnostikasi, davolanishi va korreksiyasi."}
          </p>
        </div>
      </section>

      {/* Service Categories Grid Section */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          {categories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.slug && category.slug !== '#' ? `/services/${category.slug}` : '#'}
                  className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        suppressHydrationWarning
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-brand-primary">
                        <span className="text-white text-lg font-bold">Acoustic</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2" suppressHydrationWarning>
                        {category.description}
                      </p>
                    )}
                    {category.serviceCount > 0 && (
                      <p className="mb-2 text-xs text-muted-foreground" suppressHydrationWarning>
                        {locale === 'ru' 
                          ? `${category.serviceCount} ${category.serviceCount === 1 ? 'услуга' : category.serviceCount < 5 ? 'услуги' : 'услуг'}`
                          : `${category.serviceCount} ${category.serviceCount === 1 ? 'xizmat' : 'xizmatlar'}`}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2 transition-all" suppressHydrationWarning>
                      {locale === 'ru' ? 'Подробнее' : 'Batafsil'}
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground" suppressHydrationWarning>
                {locale === 'ru'
                  ? 'Категории услуг будут добавлены в ближайшее время.'
                  : 'Xizmat kategoriyalari tez orada qo\'shiladi.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
