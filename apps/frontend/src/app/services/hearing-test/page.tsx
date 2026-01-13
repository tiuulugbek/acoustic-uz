import type { Metadata } from 'next';
import { detectLocale } from '@/lib/locale-server';
import HearingTest from '@/components/hearing-test/hearing-test';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const testUrl = `${baseUrl}/services/hearing-test`;

  return {
    title: locale === 'ru' ? 'Онлайн тест слуха — Acoustic.uz' : 'Online eshitish testi — Acoustic.uz',
    description: locale === 'ru'
      ? 'Бесплатный онлайн тест слуха. Проверьте свой слух за 3 минуты. Результаты не являются медицинским диагнозом.'
      : 'Bepul online eshitish testi. Eshitishingizni 3 daqiqada tekshiring. Natijalar tibbiy tashxis emas.',
    alternates: {
      canonical: testUrl,
      languages: {
        uz: testUrl,
        ru: testUrl,
        'x-default': testUrl,
      },
    },
  };
}

export default function HearingTestPage() {
  return (
    <main className="min-h-screen bg-white">
      <HearingTest />
    </main>
  );
}

