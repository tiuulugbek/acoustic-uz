import Image from 'next/image';
import Link from 'next/link';
// Removed notFound import - we never crash, always show UI
import type { Metadata } from 'next';
import { getServiceBySlug } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const locale = detectLocale();
  // Always try to get service, but never crash if backend is down
  const service = await getServiceBySlug(params.slug, locale);
  
  // If service not found, return fallback metadata
  if (!service) {
    return {
      title: locale === 'ru' ? 'Услуга — Acoustic.uz' : 'Xizmat — Acoustic.uz',
      description: locale === 'ru' 
        ? 'Услуги по диагностике и подбору слуховых аппаратов'
        : 'Eshitish diagnostikasi va apparatlarni tanlash xizmatlari',
    };
  }

  const title = getBilingualText(service.title_uz, service.title_ru, locale);
  const description = getBilingualText(service.excerpt_uz, service.excerpt_ru, locale) || undefined;

  return {
    title: `${title} — Acoustic.uz`,
    description,
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const locale = detectLocale();
  
  // Handle errors gracefully - getServiceBySlug returns null if backend is down or service not found
  // The api-server wrapper ensures this never throws, so we can safely await it
  const service = await getServiceBySlug(params.slug, locale);

  // If service is null, show fallback UI (backend down or service not found)
  // Never crash - always show UI structure
  if (!service) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
          <Link href="/" className="text-sm font-semibold text-brand-primary" suppressHydrationWarning>
            {locale === 'ru' ? '← Вернуться на главную' : '← Asosiy sahifaga qaytish'}
          </Link>
          <div className="mt-6 rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              {locale === 'ru' ? 'Услуга не найдена' : 'Xizmat topilmadi'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ru' 
                ? 'К сожалению, мы не можем загрузить информацию об услуге в данный момент.'
                : 'Afsuski, xizmat haqida ma\'lumotni hozircha yuklay olmaymiz.'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const title = getBilingualText(service.title_uz, service.title_ru, locale);
  const description = getBilingualText(service.excerpt_uz, service.excerpt_ru, locale);
  const body = getBilingualText(service.body_uz, service.body_ru, locale);
  const coverAlt = getBilingualText(service.cover?.alt_uz, service.cover?.alt_ru, locale) || title;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <Link href="/" className="text-sm font-semibold text-brand-primary" suppressHydrationWarning>
          {locale === 'ru' ? '← Вернуться на главную' : '← Asosiy sahifaga qaytish'}
        </Link>
        <div className="mt-6 space-y-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>

        {service.cover?.url && (
          <div className="relative mt-8 aspect-[3/2] w-full overflow-hidden rounded-3xl bg-muted/40">
            <Image src={service.cover.url} alt={coverAlt} fill className="object-cover" priority />
          </div>
        )}

        <article className="mt-10 space-y-4 text-base leading-relaxed text-foreground/90">
          {body
            ? body.split(/\n{2,}/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            : (
                <p suppressHydrationWarning>
                  {locale === 'ru' 
                    ? 'Подробная информация об этой услуге скоро будет добавлена.'
                    : 'Ushbu xizmat bo\'yicha batafsil ma\'lumot tez orada qo\'shiladi.'}
                </p>
              )}
        </article>
      </div>
    </main>
  );
}
