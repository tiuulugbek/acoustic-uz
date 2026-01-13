import type { Metadata } from 'next';
import { getPageBySlug, getSettings } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import ServiceContent from '@/components/service-content';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  return {
    title: locale === 'ru' ? 'Контакты — Acoustic.uz' : 'Bog\'lanish — Acoustic.uz',
    description: locale === 'ru' 
      ? 'Контактная информация центра слуха Acoustic'
      : 'Acoustic eshitish markazi kontakt ma\'lumotlari',
  };
}

export default async function ContactsPage() {
  const locale = detectLocale();
  const [page, settings] = await Promise.all([
    getPageBySlug('contacts', locale),
    getSettings(locale),
  ]);

  const title = page && page.status === 'published'
    ? getBilingualText(page.title_uz, page.title_ru, locale)
    : (locale === 'ru' ? 'Контакты' : 'Bog\'lanish');
  
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
      />

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {body ? (
              <section className="bg-white rounded-lg p-6">
                <ServiceContent content={body} locale={locale} />
              </section>
            ) : (
              <section className="bg-white rounded-lg p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground" suppressHydrationWarning>
                    {locale === 'ru' 
                      ? 'Контактная информация будет добавлена в ближайшее время.'
                      : 'Kontakt ma\'lumotlari tez orada qo\'shiladi.'}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Contact Information */}
            {settings && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="mb-4 text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                  {locale === 'ru' ? 'Контактная информация' : 'Kontakt ma\'lumotlari'}
                </h3>
                <div className="space-y-4">
                  {settings.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
                          {locale === 'ru' ? 'Телефон' : 'Telefon'}
                        </p>
                        <a href={`tel:${settings.phone}`} className="text-sm text-brand-primary hover:underline">
                          {settings.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {settings.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
                          {locale === 'ru' ? 'Email' : 'Email'}
                        </p>
                        <a href={`mailto:${settings.email}`} className="text-sm text-brand-primary hover:underline break-all">
                          {settings.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {settings.address_uz || settings.address_ru ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
                          {locale === 'ru' ? 'Адрес' : 'Manzil'}
                        </p>
                        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                          {getBilingualText(settings.address_uz, settings.address_ru, locale)}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {settings.workingHours_uz || settings.workingHours_ru ? (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground" suppressHydrationWarning>
                          {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line" suppressHydrationWarning>
                          {getBilingualText(settings.workingHours_uz, settings.workingHours_ru, locale)}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

