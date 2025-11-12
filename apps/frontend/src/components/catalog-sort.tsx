'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface CatalogSortProps {
  categorySlug: string;
  locale: 'uz' | 'ru';
  currentSort: string;
}

const sortOptions = [
  { value: 'newest', label_uz: "Yangilar bo'yicha", label_ru: 'Сначала новые' },
  { value: 'price_asc', label_uz: "Narx: pastdan yuqoriga", label_ru: 'Цена: по возрастанию' },
  { value: 'price_desc', label_uz: "Narx: yuqoridan pastga", label_ru: 'Цена: по убыванию' },
];

function buildFilterUrl(slug: string, currentParams: URLSearchParams, updates: Record<string, string | undefined>) {
  const params = new URLSearchParams(currentParams);
  // Remove page when sort changes
  params.delete('page');
  Object.entries(updates).forEach(([key, value]) => {
    if (value && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });
  const queryString = params.toString();
  return `/catalog/${slug}${queryString ? `?${queryString}` : ''}`;
}

export default function CatalogSort({ categorySlug, locale, currentSort }: CatalogSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const url = buildFilterUrl(categorySlug, searchParams, { sort: value !== 'newest' ? value : undefined });
    router.push(url);
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="text-sm font-semibold text-brand-accent">
        {locale === 'ru' ? 'Сортировка:' : 'Tartiblash:'}
      </label>
      <select
        id="sort"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="rounded-lg border border-border/60 bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {locale === 'ru' ? option.label_ru : option.label_uz}
          </option>
        ))}
      </select>
    </div>
  );
}
