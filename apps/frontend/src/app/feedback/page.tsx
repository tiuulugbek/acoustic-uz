import type { Metadata } from 'next';
import { getPageBySlug } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import ServiceContent from '@/components/service-content';
import { MessageSquare } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  return {
    title: locale === 'ru' ? 'Обратная связь — Acoustic.uz' : 'Fikr bildirish — Acoustic.uz',
    description: locale === 'ru' 
      ? 'Оставьте свой отзыв или задайте вопрос'
      : 'O\'z fikringizni qoldiring yoki savol bering',
  };
}

export default async function FeedbackPage() {
  const locale = detectLocale();
  const page = await getPageBySlug('feedback', locale);

  const title = page && page.status === 'published'
    ? getBilingualText(page.title_uz, page.title_ru, locale)
    : (locale === 'ru' ? 'Обратная связь' : 'Fikr bildirish');
  
  const body = page && page.status === 'published'
    ? getBilingualText(page.body_uz, page.body_ru, locale) || ''
    : '';

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: title },
        ]}
        title={title}
        icon={<MessageSquare className="h-8 w-8 text-white" />}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        {body ? (
          <section className="bg-white rounded-lg p-6">
            <ServiceContent content={body} locale={locale} />
          </section>
        ) : (
          <section className="bg-white rounded-lg p-6">
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground" suppressHydrationWarning>
                {locale === 'ru' 
                  ? 'Форма обратной связи будет добавлена в ближайшее время.'
                  : 'Fikr bildirish formasi tez orada qo\'shiladi.'}
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

