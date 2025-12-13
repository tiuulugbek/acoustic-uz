import type { Metadata } from 'next';
import Script from 'next/script';
import { getPublicFaq } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import { HelpCircle } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const faqUrl = `${baseUrl}/faq`;
  
  return {
    title: locale === 'ru' ? 'Часто задаваемые вопросы — Acoustic.uz' : 'Savollar — Acoustic.uz',
    description: locale === 'ru' 
      ? 'Ответы на часто задаваемые вопросы о слухе и слуховых аппаратах'
      : 'Eshitish va eshitish apparatlari haqida tez-tez beriladigan savollarga javoblar',
    alternates: {
      canonical: faqUrl,
      languages: {
        uz: faqUrl,
        ru: faqUrl, // Same URL since we use cookie-based locale detection
        'x-default': faqUrl,
      },
    },
  };
}

export default async function FAQPage() {
  const locale = detectLocale();
  const faqs = await getPublicFaq(locale);

  const title = locale === 'ru' ? 'Часто задаваемые вопросы' : 'Tez-tez beriladigan savollar';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';

  // Build FAQPage Structured Data
  const faqPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: getBilingualText(faq.question_uz, faq.question_ru, locale),
      acceptedAnswer: {
        '@type': 'Answer',
        text: getBilingualText(faq.answer_uz, faq.answer_ru, locale),
      },
    })),
  };

  return (
    <main className="min-h-screen bg-background">
      {/* FAQPage Structured Data */}
      <Script
        id="faqpage-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: title },
        ]}
        title={title}
        icon={<HelpCircle className="h-8 w-8 text-white" />}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        {faqs.length > 0 ? (
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const question = getBilingualText(faq.question_uz, faq.question_ru, locale);
              const answer = getBilingualText(faq.answer_uz, faq.answer_ru, locale);
              
              return (
                <div
                  key={faq.id}
                  id={`faq-${index}`}
                  className="bg-white rounded-lg p-6 shadow-sm border border-border"
                >
                  <h3 className="mb-3 text-lg font-semibold text-foreground" suppressHydrationWarning>
                    {question}
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line" suppressHydrationWarning>
                      {answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center">
            <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground" suppressHydrationWarning>
              {locale === 'ru' 
                ? 'Вопросы пока не добавлены.'
                : 'Savollar hali qo\'shilmagan.'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

