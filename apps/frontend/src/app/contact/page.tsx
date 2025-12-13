import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings, getBranches } from '@/lib/api-server';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import PageHeader from '@/components/page-header';
import NearbyBranches from '@/components/nearby-branches';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import ContactForm from '@/components/contact-form';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  return {
    title: locale === 'ru' ? 'Контакты — Acoustic.uz' : 'Bog\'lanish — Acoustic.uz',
    description: locale === 'ru' 
      ? 'Свяжитесь с нами. Контактная информация центра слуха Acoustic'
      : 'Biz bilan bog\'laning. Acoustic eshitish markazi kontakt ma\'lumotlari',
  };
}

export default async function ContactPage() {
  const locale = detectLocale();
  const [settings, branches] = await Promise.all([
    getSettings(locale),
    getBranches(locale),
  ]);

  const title = locale === 'ru' ? 'Свяжитесь с нами' : 'Biz bilan bog\'laning';
  const isRu = locale === 'ru';

  // Get primary contact info from settings
  const phonePrimary = settings?.phonePrimary || settings?.phoneSecondary || '';
  const phoneSecondary = settings?.phoneSecondary && settings?.phoneSecondary !== phonePrimary 
    ? settings.phoneSecondary 
    : null;
  const email = settings?.email || '';

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: title },
        ]}
        title=""
        description=""
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 py-12 md:py-20 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight" suppressHydrationWarning>
              {title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" suppressHydrationWarning>
              {isRu 
                ? 'Мы всегда готовы ответить на ваши вопросы и помочь вам'
                : 'Biz sizning savollaringizga javob berishga va yordam berishga tayyormiz'}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column - Contact Form */}
          <div className="space-y-8">
            {/* Contact Form Card */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-brand-primary/10">
                  <MessageSquare className="h-6 w-6 text-brand-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground" suppressHydrationWarning>
                  {isRu ? 'Отправить сообщение' : 'Xabar yuborish'}
                </h2>
              </div>
              <ContactForm locale={locale} />
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-xl p-6 md:p-8 border border-brand-primary/20">
              <h3 className="text-xl font-semibold text-foreground mb-4" suppressHydrationWarning>
                {isRu ? 'Почему стоит обратиться к нам?' : 'Nega bizga murojaat qilish kerak?'}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground" suppressHydrationWarning>
                      {isRu ? 'Быстрый ответ' : 'Tez javob'}
                    </p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {isRu ? 'Отвечаем в течение 24 часов' : '24 soat ichida javob beramiz'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground" suppressHydrationWarning>
                      {isRu ? 'Профессиональная консультация' : 'Professional maslahat'}
                    </p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {isRu ? 'Опытные специалисты готовы помочь' : 'Tajribali mutaxassislar yordamga tayyor'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground" suppressHydrationWarning>
                      {isRu ? 'Удобное время' : 'Qulay vaqt'}
                    </p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {isRu ? 'Работаем в удобное для вас время' : 'Sizga qulay vaqtda ishlaymiz'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground" suppressHydrationWarning>
                      {isRu ? 'Индивидуальный подход' : 'Individual yondashuv'}
                    </p>
                    <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                      {isRu ? 'Каждому клиенту особое внимание' : 'Har bir mijozga alohida e\'tibor'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <aside className="space-y-6">
            {/* Contact Information Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
              <h3 className="mb-6 text-xl font-semibold text-brand-accent" suppressHydrationWarning>
                {isRu ? 'Контактная информация' : 'Kontakt ma\'lumotlari'}
              </h3>
              <div className="space-y-6">
                {/* Phone */}
                {phonePrimary && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-brand-primary/10 flex-shrink-0">
                      <Phone className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground mb-1" suppressHydrationWarning>
                        {isRu ? 'Телефон' : 'Telefon'}
                      </p>
                      <a 
                        href={`tel:${phonePrimary.replace(/\s/g, '')}`} 
                        className="text-lg font-semibold text-brand-primary hover:text-brand-accent transition-colors block"
                      >
                        {phonePrimary}
                      </a>
                      {phoneSecondary && (
                        <a 
                          href={`tel:${phoneSecondary.replace(/\s/g, '')}`} 
                          className="text-base text-foreground hover:text-brand-primary transition-colors block mt-1"
                        >
                          {phoneSecondary}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Email */}
                {email && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-brand-primary/10 flex-shrink-0">
                      <Mail className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground mb-1" suppressHydrationWarning>
                        Email
                      </p>
                      <a 
                        href={`mailto:${email}`} 
                        className="text-base text-brand-primary hover:text-brand-accent transition-colors break-all"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Branches Link */}
                {branches && branches.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-brand-primary/10 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground mb-1" suppressHydrationWarning>
                        {isRu ? 'Адреса филиалов' : 'Filial manzillari'}
                      </p>
                      <Link 
                        href="/branches" 
                        className="text-base text-brand-primary hover:text-brand-accent transition-colors inline-flex items-center gap-1"
                        suppressHydrationWarning
                      >
                        {isRu ? 'Посмотреть все филиалы' : 'Barcha filiallarni ko\'rish'} →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Branches Card - Show nearby branches */}
            {branches && branches.length > 0 && (
              <NearbyBranches branches={branches} locale={locale} limit={3} />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

