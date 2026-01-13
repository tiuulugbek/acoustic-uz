import type { Metadata } from 'next';
import { detectLocale } from '@/lib/locale-server';

export async function generateBranchesMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const branchesUrl = `${baseUrl}/branches`;
  
  const title = locale === 'ru' ? 'Филиалы — Acoustic.uz' : 'Filiallar — Acoustic.uz';
  const description = locale === 'ru' 
    ? 'Наши филиалы в Узбекистане. Найдите ближайший центр слуха Acoustic. Адреса, телефоны, часы работы. Запишитесь на консультацию в удобном для вас филиале.'
    : 'O\'zbekistondagi filiallarimiz. Eng yaqin Acoustic eshitish markazini toping. Manzillar, telefonlar, ish vaqti. O\'zingizga qulay filialda maslahat uchun yoziling.';
  
  return {
    title,
    description,
    alternates: {
      canonical: branchesUrl,
      languages: {
        uz: branchesUrl,
        ru: branchesUrl,
        'x-default': branchesUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: branchesUrl,
      siteName: 'Acoustic.uz',
      locale: locale === 'ru' ? 'ru_RU' : 'uz_UZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

