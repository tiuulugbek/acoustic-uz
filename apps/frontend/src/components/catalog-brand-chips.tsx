'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { normalizeImageUrl } from '@/lib/image-utils';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: { url: string } | null;
}

interface CatalogBrandChipsProps {
  categorySlug: string;
  locale: 'uz' | 'ru';
  brands: Brand[];
  selectedBrands: string[];
}

function buildFilterUrl(slug: string, currentParams: URLSearchParams, updates: Record<string, string | undefined>) {
  const params = new URLSearchParams(currentParams);
  // Remove page when brand filter changes
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

export default function CatalogBrandChips({ categorySlug, locale, brands = [], selectedBrands = [] }: CatalogBrandChipsProps) {
  const searchParams = useSearchParams();

  if (brands.length === 0) return null;

  const allBrandsUrl = buildFilterUrl(categorySlug, searchParams, { brand: undefined });
  const isAllSelected = selectedBrands.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border/40 pb-4">
      <Link
        href={allBrandsUrl}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
          isAllSelected
            ? 'border-brand-primary bg-brand-primary text-white'
            : 'border-border/60 bg-white text-brand-accent hover:border-brand-primary/50 hover:bg-brand-primary/5'
        }`}
      >
        {locale === 'ru' ? 'Все' : 'Barchasi'}
      </Link>
      {brands.map((brand) => {
        const isSelected = selectedBrands.includes(brand.slug);
        const newBrands = isSelected ? selectedBrands.filter((b) => b !== brand.slug) : [...selectedBrands, brand.slug];
        const url = buildFilterUrl(categorySlug, searchParams, { brand: newBrands.length > 0 ? newBrands.join(',') : undefined });

        return (
          <Link
            key={brand.id}
            href={url}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isSelected
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-border/60 bg-white text-brand-accent hover:border-brand-primary/50 hover:bg-brand-primary/5'
            }`}
          >
            {brand.logo?.url && (() => {
              const logoUrl = normalizeImageUrl(brand.logo.url);
              if (!logoUrl) return null;
              return (
                <Image
                  src={logoUrl}
                  alt={brand.name || 'Brand logo'}
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                  unoptimized
                />
              );
            })()}
            <span>{brand.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
