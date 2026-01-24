import type { Metadata } from 'next';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import Link from 'next/link';
import Image from 'next/image';
import { getDoctors, getBranches, type DoctorResponse } from '@/lib/api-server';
import { normalizeImageUrl } from '@/lib/image-utils';
import BranchesSidebar from '@/components/branches-sidebar';
import PageHeader from '@/components/page-header';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  return {
    title: locale === 'ru' ? 'Специалисты — Acoustic.uz' : 'Mutaxassislar — Acoustic.uz',
    description: locale === 'ru' 
      ? 'Наши специалисты по слуху - профессиональные сурдологи и аудиологи'
      : 'Bizning eshitish mutaxassislarimiz - professional surdologlar va audiologlar',
  };
}

export default async function DoctorsPage() {
  const locale = detectLocale();
  const specialists = await getDoctors(locale);
  const branches = await getBranches(locale);

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: locale === 'ru' ? 'Специалисты' : 'Mutaxassislar' },
        ]}
        title={locale === 'ru' ? 'Наши специалисты' : 'Bizning mutaxassislarimiz'}
        description={locale === 'ru'
          ? 'Профессиональные сурдологи и аудиологи с многолетним опытом работы'
          : 'Ko\'p yillik tajribaga ega professional surdologlar va audiologlar'}
      />

      {/* Main Content with Sidebar */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Specialists Grid */}
            <div>
              {specialists.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {specialists.map((specialist) => {
                    const name = getBilingualText(specialist.name_uz, specialist.name_ru, locale);
                    const position = getBilingualText(specialist.position_uz, specialist.position_ru, locale);
                    const experience = getBilingualText(specialist.experience_uz, specialist.experience_ru, locale);

                    return (
                      <Link
                        key={specialist.id}
                        href={`/doctors/${specialist.slug}`}
                        className="group flex gap-4 overflow-hidden rounded-lg bg-white border border-border p-4 transition hover:shadow-md hover:border-brand-primary"
                      >
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted/20">
                          {specialist.image?.url ? (
                            (() => {
                              const imageUrl = specialist.image?.url ? normalizeImageUrl(specialist.image.url) : '';
                              return (
                                <Image
                                  src={imageUrl}
                                  alt={name}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  sizes="96px"
                                />
                              );
                            })()
                          ) : (
                            <div className="flex h-full items-center justify-center bg-brand-primary">
                              <span className="text-white text-2xl font-bold">
                                {name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col min-w-0">
                          <h3 className="mb-1 text-base font-semibold text-foreground group-hover:text-brand-primary transition-colors line-clamp-1" suppressHydrationWarning>
                            {name}
                          </h3>
                          {position && (
                            <p className="mb-1 text-xs font-medium text-brand-primary line-clamp-1" suppressHydrationWarning>
                              {position}
                            </p>
                          )}
                          {experience && (
                            <p className="mb-2 text-xs text-muted-foreground" suppressHydrationWarning>
                              {experience}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary group-hover:gap-2 transition-all mt-auto" suppressHydrationWarning>
                            {locale === 'ru' ? 'Подробнее' : 'Batafsil'}
                            <svg
                              className="h-3 w-3 transition-transform group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" suppressHydrationWarning>
                    {locale === 'ru'
                      ? 'Специалисты скоро будут добавлены.'
                      : 'Mutaxassislar tez orada qo\'shiladi.'}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <BranchesSidebar locale={locale} branches={branches || []} />

              {/* Reviews Section */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground" suppressHydrationWarning>
                  {locale === 'ru' ? 'Ваши отзывы' : 'Sizning fikrlaringiz'}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground" suppressHydrationWarning>
                  {locale === 'ru'
                    ? 'Реальные отзывы о работе Центров, врачах и слуховых аппаратах'
                    : 'Markazlar, shifokorlar va eshitish apparatlari haqida haqiqiy fikrlar'}
                </p>
                <Link
                  href="/feedback"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-accent hover:gap-3"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {locale === 'ru' ? 'Оставить отзыв' : 'Fikr bildirish'}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

