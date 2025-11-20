'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLocaleFromDOM, type Locale } from '@/lib/locale-client';

const centerLinks = {
  uz: [
    { href: '/about', label: 'Biz haqimizda' },
    { href: '/branches', label: 'Filial manzillari' },
    { href: '/services', label: 'Qabulga yozilish' },
    { href: '/contacts', label: "Qo'ng'iroq buyurtma qilish" },
    { href: '/faq', label: 'Savol berish' },
    { href: '/feedback', label: 'Fikr bildirish' },
  ],
  ru: [
    { href: '/about', label: 'О нас' },
    { href: '/branches', label: 'Адреса филиалов' },
    { href: '/services', label: 'Записаться на приём' },
    { href: '/contacts', label: 'Заказать звонок' },
    { href: '/faq', label: 'Задать вопрос' },
    { href: '/feedback', label: 'Оставить отзыв' },
  ],
};

const catalogLinks = {
  uz: [
    { href: '/catalog?category=kattalar', label: 'Kattalar uchun apparatlar' },
    { href: '/catalog?category=bolalar', label: 'Bolalar uchun apparatlar' },
    { href: '/catalog?category=aksessuarlar', label: 'Simsiz aksessuarlar' },
    { href: '/catalog?category=batareyalar', label: 'Batareyalar' },
    { href: '/catalog?category=quloq-vkladish', label: 'Quloq vkladishlari' },
    { href: '/catalog?category=parvarish', label: "Parvarish vositalari" },
  ],
  ru: [
    { href: '/catalog?category=kattalar', label: 'Аппараты для взрослых' },
    { href: '/catalog?category=bolalar', label: 'Аппараты для детей' },
    { href: '/catalog?category=aksessuarlar', label: 'Беспроводные аксессуары' },
    { href: '/catalog?category=batareyalar', label: 'Батареи' },
    { href: '/catalog?category=quloq-vkladish', label: 'Ушные вкладыши' },
    { href: '/catalog?category=parvarish', label: "Средства по уходу" },
  ],
};

const socialRowLinks = {
  uz: [
    { href: '/contacts', label: "Biz bilan bog'laning" },
    { href: 'https://tiktok.com/@acoustic', label: 'TikTok' },
    { href: 'https://instagram.com/acoustic', label: 'Instagram' },
    { href: 'https://facebook.com/acoustic', label: 'Facebook' },
    { href: 'https://youtube.com/acoustic', label: 'YouTube' },
    { href: 'https://t.me/acoustic', label: 'Telegram' },
  ],
  ru: [
    { href: '/contacts', label: 'Связаться с нами' },
    { href: 'https://tiktok.com/@acoustic', label: 'TikTok' },
    { href: 'https://instagram.com/acoustic', label: 'Instagram' },
    { href: 'https://facebook.com/acoustic', label: 'Facebook' },
    { href: 'https://youtube.com/acoustic', label: 'YouTube' },
    { href: 'https://t.me/acoustic', label: 'Telegram' },
  ],
};

export default function SiteFooter() {
  // Get initial locale from DOM (matches server render)
  const getInitialLocale = (): Locale => {
    if (typeof document === 'undefined') return 'uz';
    return getLocaleFromDOM();
  };
  
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  
  // Update locale whenever DOM changes (e.g., after page reload with new locale)
  useEffect(() => {
    const updateLocale = () => {
      const currentLocale = getLocaleFromDOM();
      if (currentLocale !== locale) {
        setLocale(currentLocale);
      }
    };
    
    // Update immediately
    updateLocale();
    
    // Watch for DOM attribute changes
    const observer = new MutationObserver(updateLocale);
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-locale'],
      });
    }
    
    // Also check periodically (in case of page reload)
    const interval = setInterval(updateLocale, 500);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [locale]);
  
  const centerLinksList = centerLinks[locale];
  const catalogLinksList = catalogLinks[locale];
  const socialRowLinksList = socialRowLinks[locale];
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
              {locale === 'ru' ? 'Центр Acoustic' : 'Acoustic markazi'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {centerLinksList.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
              {locale === 'ru' ? 'Каталог' : 'Katalog'}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {catalogLinksList.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
              {locale === 'ru' ? 'Контактная информация' : "Aloqa ma'lumotlari"}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-brand-primary" />
                <Link href="tel:+998712021441" className="hover:text-brand-primary">
                  +998 71 202 14 41
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-brand-primary" />
                <Link href="mailto:info@acoustic.uz" className="hover:text-brand-primary">
                  info@acoustic.uz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 text-xs font-semibold text-brand-accent/80 md:px-6">
          {socialRowLinksList.map((item) => (
            <Link key={item.label} href={item.href} className="transition hover:text-brand-primary" suppressHydrationWarning>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-border/60 bg-white py-4 text-center text-xs text-muted-foreground" suppressHydrationWarning>
        © {new Date().getFullYear()} Acoustic. {locale === 'ru' ? 'Все права защищены.' : 'Barcha huquqlar himoyalangan.'}
      </div>
    </footer>
  );
}
