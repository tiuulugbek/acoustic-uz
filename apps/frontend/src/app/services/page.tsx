import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { detectLocale } from '@/lib/locale-server';
import { getServiceCategories, getBranches } from '@/lib/api-server';
import BranchesSidebar from '@/components/branches-sidebar';

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

  // Fetch all published service categories (with pagination support)
  const categoriesData = await getServiceCategories(locale);
  
  // Fetch branches for sidebar map
  const branches = await getBranches(locale);

  // Filter top-level categories (no parent) and published only
  const topLevelCategories = (categoriesData || []).filter(
    (cat) => !cat.parentId && cat.status === 'published'
  );

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
      {/* Simple Header - Breadcrumbs and Title only */}
      <section className="bg-[hsl(var(--secondary))]">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2">
            <Link href="/" className="hover:text-white/80 text-white/70" suppressHydrationWarning>
              {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
            </Link>
            <span className="mx-1 sm:mx-2">›</span>
            <span className="text-white" suppressHydrationWarning>
              {locale === 'ru' ? 'Услуги' : 'Xizmatlar'}
            </span>
          </div>
        </div>
      </section>
      <section className="bg-[hsl(var(--secondary))] border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words" suppressHydrationWarning>
            {locale === 'ru' ? 'Услуги' : 'Xizmatlar'}
          </h1>
        </div>
      </section>

      {/* Service Categories Grid Section */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              {/* Hearing Test Card */}
              <Link
                href="/services/hearing-test"
                className="group flex gap-4 rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-2 border-brand-primary/20 p-6 mb-6 transition hover:border-brand-primary/40 hover:shadow-lg"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-primary flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="mb-2 text-lg font-bold text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                    {locale === 'ru' ? 'Онлайн тест слуха' : 'Online eshitish testi'}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-2" suppressHydrationWarning>
                    {locale === 'ru'
                      ? 'Бесплатный онлайн тест слуха. Проверьте свой слух за 3 минуты. Результаты не являются медицинским диагнозом.'
                      : 'Bepul online eshitish testi. Eshitishingizni 3 daqiqada tekshiring. Natijalar tibbiy tashxis emas.'}
                  </p>
                  <span className="text-brand-primary font-semibold text-sm group-hover:underline" suppressHydrationWarning>
                    {locale === 'ru' ? 'Начать тест →' : 'Testni boshlash →'}
                  </span>
                </div>
              </Link>

              {categories.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
              {/* Optimize images with priority for above-the-fold items */}
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={category.slug && category.slug !== '#' ? `/services/${category.slug}` : '#'}
                  className="group flex gap-4 rounded-lg bg-white p-4 transition hover:bg-gray-50"
                >
                  {/* Rasm - chapda */}
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted/20">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading={index < 4 ? 'eager' : 'lazy'}
                        priority={index < 4}
                        suppressHydrationWarning
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-primary">
                        <span className="text-white text-xs font-bold">Acoustic</span>
                      </div>
                    )}
                  </div>
                  {/* Matn - o'ngda */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="mb-2 text-base font-semibold text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3" suppressHydrationWarning>
                        {category.description}
                      </p>
                    )}
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

            {/* Sidebar */}
            <aside className="space-y-6">
              <BranchesSidebar locale={locale} branches={branches || []} />
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
