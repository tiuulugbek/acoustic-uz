'use client';

import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, MessageCircle, Clock, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Locale, DEFAULT_LOCALE } from '@/lib/locale';
import { getLocaleFromCookie } from '@/lib/locale-client';

const COMPANY_INFO = {
  uz: {
    name: 'Acoustic',
    tagline: '2008 yildan beri eshitish markazi',
    description: 'Eshitish qobiliyatini tiklash va yaxshilash markazi. Biz sizga professional yordam ko\'rsatamiz.',
    phone: '+998 71 202 14 41',
    phoneShort: '1385',
    email: 'info@acoustic.uz',
    address: 'Toshkent shahri',
    workingHours: 'Dushanba - Juma: 9:00 - 18:00',
    statusMessage: 'Sayt vaqtinchalik mavjud emas. Iltimos, ko\'rsatilgan kontaktlar orqali biz bilan bog\'laning.',
  },
  ru: {
    name: 'Acoustic',
    tagline: 'Центр слуха с 2008 года',
    description: 'Центр восстановления и улучшения слуха. Мы предоставляем профессиональную помощь.',
    phone: '+998 71 202 14 41',
    phoneShort: '1385',
    email: 'info@acoustic.uz',
    address: 'Город Ташкент',
    workingHours: 'Понедельник - Пятница: 9:00 - 18:00',
    statusMessage: 'Сайт временно недоступен. Пожалуйста, свяжитесь с нами по указанным контактам.',
  },
};

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    icon: Instagram,
    href: 'https://instagram.com/acoustic',
    color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:text-white hover:border-transparent',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    href: 'https://facebook.com/acoustic',
    color: 'hover:bg-blue-600 hover:text-white hover:border-transparent',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    href: 'https://youtube.com/acoustic',
    color: 'hover:bg-red-600 hover:text-white hover:border-transparent',
    bgColor: 'bg-red-50',
  },
  {
    name: 'Telegram',
    icon: MessageCircle,
    href: 'https://t.me/acoustic',
    color: 'hover:bg-blue-500 hover:text-white hover:border-transparent',
    bgColor: 'bg-blue-50',
  },
];

function getLocaleFromDOM(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  
  const htmlLocale = document.documentElement.getAttribute('data-locale');
  if (htmlLocale === 'ru' || htmlLocale === 'uz') {
    return htmlLocale as Locale;
  }
  
  if (typeof window !== 'undefined' && (window as any).__NEXT_LOCALE__) {
    const locale = (window as any).__NEXT_LOCALE__;
    if (locale === 'ru' || locale === 'uz') {
      return locale as Locale;
    }
  }
  
  return getLocaleFromCookie();
}

export default function BackendDownLanding() {
  const [locale, setLocale] = useState<Locale>(getLocaleFromDOM());
  const info = COMPANY_INFO[locale];

  // Watch for locale changes
  useEffect(() => {
    const checkLocale = () => {
      const domLocale = getLocaleFromDOM();
      if (domLocale !== locale) {
        setLocale(domLocale);
      }
    };

    const observer = new MutationObserver(checkLocale);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-locale'],
      });
    }

    const interval = setInterval(checkLocale, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [locale]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/5 via-background to-brand-accent/5">
      {/* Animated background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(240,126,34,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(63,48,145,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-12 md:py-20 md:px-6">
        {/* Status Banner */}
        <div className="mb-8 rounded-xl border-2 border-amber-200 bg-amber-50/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex items-center justify-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 animate-pulse" />
            <p className="text-sm font-medium text-amber-900">
              {info.statusMessage}
            </p>
          </div>
        </div>

        {/* Logo and Company Name */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 p-6 shadow-lg">
            <h1 className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-6xl font-extrabold text-transparent md:text-7xl">
              {info.name}
            </h1>
          </div>
          <p className="mt-4 text-2xl font-semibold text-muted-foreground md:text-3xl">
            {info.tagline}
          </p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent"></div>
        </div>

        {/* Main Content Card */}
        <div className="mb-10 rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
          <div className="p-8 md:p-14">
            <p className="mb-10 text-center text-xl leading-relaxed text-foreground/90 md:text-2xl">
              {info.description}
            </p>

            {/* Contact Information Grid */}
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {/* Phone */}
              <a
                href={`tel:${info.phone.replace(/\s/g, '')}`}
                className="group relative overflow-hidden rounded-2xl border-2 border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent p-6 text-center transition-all hover:border-brand-primary hover:shadow-lg hover:scale-105"
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 transition-transform group-hover:scale-110">
                    <Phone className="h-7 w-7 text-brand-primary" />
                  </div>
                </div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {locale === 'ru' ? 'Телефон' : 'Telefon'}
                </p>
                <p className="text-2xl font-bold text-brand-primary transition-colors group-hover:text-brand-primary/80">
                  {info.phone}
                </p>
                <p className="mt-2 text-base font-medium text-muted-foreground">
                  {info.phoneShort}
                </p>
              </a>

              {/* Email */}
              <a
                href={`mailto:${info.email}`}
                className="group relative overflow-hidden rounded-2xl border-2 border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent p-6 text-center transition-all hover:border-brand-primary hover:shadow-lg hover:scale-105"
              >
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 transition-transform group-hover:scale-110">
                    <Mail className="h-7 w-7 text-brand-primary" />
                  </div>
                </div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {locale === 'ru' ? 'Электронная почта' : 'Elektron pochta'}
                </p>
                <p className="break-words text-lg font-bold text-brand-primary transition-colors group-hover:text-brand-primary/80">
                  {info.email}
                </p>
              </a>

              {/* Address */}
              <div className="group rounded-2xl border-2 border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent p-6 text-center transition-all hover:border-brand-primary hover:shadow-lg">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 transition-transform group-hover:scale-110">
                    <MapPin className="h-7 w-7 text-brand-primary" />
                  </div>
                </div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {locale === 'ru' ? 'Адрес' : 'Manzil'}
                </p>
                <p className="mb-2 text-xl font-bold text-foreground">
                  {info.address}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{info.workingHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="mb-8 text-center">
          <h2 className="mb-8 text-3xl font-bold text-foreground">
            {locale === 'ru' ? 'Мы в социальных сетях' : 'Ijtimoiy tarmoqlarda'}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-border bg-card shadow-md transition-all hover:scale-110 hover:shadow-xl ${social.color}`}
                  aria-label={social.name}
                  title={social.name}
                >
                  <Icon className="h-7 w-7 transition-transform group-hover:scale-110" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Language Switcher */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 rounded-full border-2 border-border bg-card px-8 py-4 shadow-md">
            <button
              onClick={() => {
                const currentPath = window.location.pathname;
                const apiUrl = `/api/locale?locale=uz&redirect=${encodeURIComponent(currentPath)}`;
                window.location.href = apiUrl;
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                locale === 'uz'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-brand-primary'
              }`}
            >
              O'Z
            </button>
            <span className="h-6 w-px bg-border"></span>
            <button
              onClick={() => {
                const currentPath = window.location.pathname;
                const apiUrl = `/api/locale?locale=ru&redirect=${encodeURIComponent(currentPath)}`;
                window.location.href = apiUrl;
              }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                locale === 'ru'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-brand-primary'
              }`}
            >
              RU
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} {info.name}.{' '}
            {locale === 'ru' ? 'Все права защищены' : 'Barcha huquqlar himoyalangan'}
          </p>
        </div>
      </div>
    </div>
  );
}
