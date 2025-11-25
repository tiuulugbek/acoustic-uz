import { Suspense } from 'react';
import { Metadata } from 'next';
import { detectLocale } from '@/lib/locale-server';
import SearchResults from '@/components/search-results';
import PageHeader from '@/components/page-header';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const locale = detectLocale();
  const query = searchParams.q || '';
  
  return {
    title: query 
      ? (locale === 'ru' ? `Поиск: ${query} — Acoustic.uz` : `Qidiruv: ${query} — Acoustic.uz`)
      : (locale === 'ru' ? 'Поиск — Acoustic.uz' : 'Qidiruv — Acoustic.uz'),
    description: locale === 'ru' 
      ? 'Поиск по сайту Acoustic.uz'
      : 'Acoustic.uz saytida qidiruv',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const locale = detectLocale();
  const query = searchParams.q || '';

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: locale === 'ru' ? 'Поиск' : 'Qidiruv' },
        ]}
        title={locale === 'ru' ? 'Поиск' : 'Qidiruv'}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <Suspense fallback={<div className="text-center py-12">Yuklanmoqda...</div>}>
          <SearchResults query={query} locale={locale} />
        </Suspense>
      </div>
    </main>
  );
}


