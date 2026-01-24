import type { Metadata } from 'next';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import Link from 'next/link';
import Image from 'next/image';
import { getDoctorBySlug } from '@/lib/api-server';
import { normalizeImageUrl } from '@/lib/image-utils';
import PageHeader from '@/components/page-header';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DoctorPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
  const locale = detectLocale();
  const doctor = await getDoctorBySlug(params.slug, locale);
  const name = doctor ? getBilingualText(doctor.name_uz, doctor.name_ru, locale) : '';
  return {
    title: name ? `${name} — Acoustic.uz` : (locale === 'ru' ? 'Специалист — Acoustic.uz' : 'Mutaxassis — Acoustic.uz'),
  };
}

export default async function DoctorSlugPage({ params }: DoctorPageProps) {
  const locale = detectLocale();
  const specialist = await getDoctorBySlug(params.slug, locale);

  if (!specialist) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              {locale === 'ru' ? 'Специалист не найден' : 'Mutaxassis topilmadi'}
            </h1>
            <Link href="/doctors" className="text-brand-primary hover:underline">
              {locale === 'ru' ? '← Вернуться к списку специалистов' : '← Mutaxassislar ro\'yxatiga qaytish'}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const name = getBilingualText(specialist.name_uz, specialist.name_ru, locale);
  const position = getBilingualText(specialist.position_uz, specialist.position_ru, locale);
  const experience = getBilingualText(specialist.experience_uz, specialist.experience_ru, locale);
  const description = getBilingualText(specialist.description_uz, specialist.description_ru, locale);
  
  const imageUrl = specialist.image?.url ? normalizeImageUrl(specialist.image.url) : '';

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: locale === 'ru' ? 'Специалисты' : 'Mutaxassislar', href: '/doctors' },
          { label: name },
        ]}
        title={name}
        description={position}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Sidebar - Photo */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted/40 shadow-lg">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-brand-primary">
                  <span className="text-white text-6xl font-bold">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <article className="min-w-0">
            <div className="mb-6 space-y-4">
              <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl" suppressHydrationWarning>
                {name}
              </h1>
              {position && (
                <p className="text-xl font-medium text-brand-primary" suppressHydrationWarning>
                  {position}
                </p>
              )}
              {experience && (
                <p className="text-lg text-muted-foreground" suppressHydrationWarning>
                  {experience}
                </p>
              )}
            </div>

            {description && (
              <div className="prose prose-lg max-w-none">
                <p className="mb-4 leading-relaxed text-foreground/90 whitespace-pre-line" suppressHydrationWarning>
                  {description}
                </p>
              </div>
            )}
          </article>
        </div>
      </div>
    </main>
  );
}

