'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

const centerLinks = [
  { href: '/about', label: 'Biz haqimizda' },
  { href: '/branches', label: 'Filial manzillari' },
  { href: '/services', label: 'Qabulga yozilish' },
  { href: '/contacts', label: "Qo'ng'iroq buyurtma qilish" },
  { href: '/faq', label: 'Savol berish' },
  { href: '/feedback', label: 'Fikr bildirish' },
];

const catalogLinks = [
  { href: '/catalog?category=kattalar', label: 'Kattalar uchun apparatlar' },
  { href: '/catalog?category=bolalar', label: 'Bolalar uchun apparatlar' },
  { href: '/catalog?category=aksessuarlar', label: 'Simsiz aksessuarlar' },
  { href: '/catalog?category=batareyalar', label: 'Batareyalar' },
  { href: '/catalog?category=quloq-vkladish', label: 'Quloq vkladishlari' },
  { href: '/catalog?category=parvarish', label: "Parvarish vositalari" },
];

const socialRowLinks = [
  { href: '/contacts', label: "Biz bilan bog'laning" },
  { href: 'https://tiktok.com/@acoustic', label: 'TikTok' },
  { href: 'https://instagram.com/acoustic', label: 'Instagram' },
  { href: 'https://facebook.com/acoustic', label: 'Facebook' },
  { href: 'https://youtube.com/acoustic', label: 'YouTube' },
  { href: 'https://t.me/acoustic', label: 'Telegram' },
];

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-brand-accent">Acoustic markazi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {centerLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-brand-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-brand-accent">Katalog</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {catalogLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-brand-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-brand-accent">Aloqa ma'lumotlari</h4>
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
          {socialRowLinks.map((item) => (
            <Link key={item.label} href={item.href} className="transition hover:text-brand-primary">
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-border/60 bg-white py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Acoustic. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
