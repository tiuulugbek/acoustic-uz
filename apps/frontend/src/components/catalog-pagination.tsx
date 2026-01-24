'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CatalogPaginationProps {
  categorySlug: string;
  locale: 'uz' | 'ru';
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

function buildPageUrl(slug: string, currentParams: URLSearchParams, page: number | null) {
  const params = new URLSearchParams(currentParams);
  if (!page || page === 1) {
    params.delete('page');
  } else {
    params.set('page', page.toString());
  }
  const queryString = params.toString();
  return `/catalog/${slug}${queryString ? `?${queryString}` : ''}`;
}

export default function CatalogPagination({ categorySlug, locale, currentPage, totalPages, totalItems }: CatalogPaginationProps) {
  const searchParams = useSearchParams();

  // Don't show pagination if there are no items or only one page
  if (totalItems === 0 || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4 border-t border-border/40 pt-6">
      <p className="text-sm text-muted-foreground">
        {locale === 'ru' ? `Страница ${currentPage} из ${totalPages}` : `${currentPage} / ${totalPages} sahifa`}
      </p>
      <nav className="flex items-center gap-2">
        {prevPage ? (
          <Link
            href={buildPageUrl(categorySlug, searchParams, prevPage)}
            className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-white px-3 py-2 text-sm font-semibold text-brand-accent transition hover:border-brand-primary/50 hover:bg-brand-primary/5"
          >
            <ChevronLeft className="h-4 w-4" />
            {locale === 'ru' ? 'Назад' : 'Oldingi'}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-sm font-semibold text-muted-foreground cursor-not-allowed">
            <ChevronLeft className="h-4 w-4" />
            {locale === 'ru' ? 'Назад' : 'Oldingi'}
          </span>
        )}

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
                  ...
                </span>
              );
            }

            if (typeof page !== 'number') return null;
            const pageNum = page as number;
            const isCurrent = pageNum === currentPage;

            return (
              <Link
                key={pageNum}
                href={buildPageUrl(categorySlug, searchParams, pageNum)}
                className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  isCurrent
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-border/60 bg-white text-brand-accent hover:border-brand-primary/50 hover:bg-brand-primary/5'
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {nextPage ? (
          <Link
            href={buildPageUrl(categorySlug, searchParams, nextPage)}
            className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-white px-3 py-2 text-sm font-semibold text-brand-accent transition hover:border-brand-primary/50 hover:bg-brand-primary/5"
          >
            {locale === 'ru' ? 'Вперёд' : 'Keyingi'}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-sm font-semibold text-muted-foreground cursor-not-allowed">
            {locale === 'ru' ? 'Вперёд' : 'Keyingi'}
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
