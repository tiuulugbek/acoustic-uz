'use client';

import Link from 'next/link';
import type { FilterOption } from '@/lib/filter-utils';


interface FilterOption {
  value: string;
  label_uz: string;
  label_ru: string;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="space-y-3 border-b border-border/40 pb-4">
      <h3 className="text-sm font-semibold text-brand-accent">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface FilterCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  url: string;
  count?: number;
}

function FilterCheckbox({ id: _id, label, checked, url, count }: FilterCheckboxProps) {
  return (
    <Link href={url} className="flex items-center justify-between gap-2 cursor-pointer text-sm text-muted-foreground hover:text-brand-accent">
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={checked} readOnly className="rounded border-border/60 text-brand-primary focus:ring-brand-primary pointer-events-none" tabIndex={-1} />
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && <span className="text-xs text-muted-foreground">({count})</span>}
    </Link>
  );
}

interface CatalogFiltersProps {
  categorySlug?: string;
  productType?: string;
  locale: 'uz' | 'ru';
  brands: Array<{ id: string; name: string; slug: string; count?: number }>;
  selectedBrands: string[];
  selectedBrandName?: string;
  selectedAudience: string[];
  selectedForms: string[];
  selectedPower: string[];
  selectedLoss: string[];
  audienceCounts?: Record<string, number>;
  formCounts?: Record<string, number>;
  powerCounts?: Record<string, number>;
  lossCounts?: Record<string, number>;
  audienceOptions?: FilterOption[];
  formFactorOptions?: FilterOption[];
  powerLevelOptions?: FilterOption[];
  hearingLossOptions?: FilterOption[];
};

interface ExtendedCatalogFiltersProps extends CatalogFiltersProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

function buildFilterUrl(
  slugOrType: string | undefined,
  baseParams: Record<string, string | undefined>,
  updates: Record<string, string | undefined>,
  isProductType: boolean = false
) {
  const params = new URLSearchParams();
  
  // Add base params
  Object.entries(baseParams).forEach(([key, value]) => {
    if (value && value !== '') {
      params.set(key, value);
    }
  });
  
  // Remove page when filters change
  params.delete('page');
  
  // Apply updates
  Object.entries(updates).forEach(([key, value]) => {
    if (value && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  });
  
  if (isProductType && slugOrType) {
    params.set('productType', slugOrType);
    const queryString = params.toString();
    return `/catalog${queryString ? `?${queryString}` : ''}`;
  } else if (slugOrType) {
    const queryString = params.toString();
    return `/catalog/${slugOrType}${queryString ? `?${queryString}` : ''}`;
  } else {
    const queryString = params.toString();
    return `/catalog${queryString ? `?${queryString}` : ''}`;
  }
}

export default function CatalogFilters({
  categorySlug,
  productType,
  locale,
  brands = [],
  selectedBrands,
  selectedBrandName,
  selectedAudience,
  selectedForms,
  selectedPower,
  selectedLoss,
  audienceCounts = {},
  formCounts = {},
  powerCounts = {},
  lossCounts = {},
  audienceOptions = [],
  formFactorOptions = [],
  powerLevelOptions = [],
  hearingLossOptions = [],
  searchParams = {},
}: ExtendedCatalogFiltersProps) {
  // Create base params from searchParams for buildFilterUrl
  const baseParams: Record<string, string | undefined> = {};
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        baseParams[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        baseParams[key] = value[0];
      }
    });
  }
  
  // audienceOptions now comes from props (generated from product data)

  // formFactorOptions now comes from props (generated from product data)

  // hearingLossOptions now comes from props (generated from product data)

  // powerLevelOptions now comes from props (generated from product data)

  const hasActiveFilters =
    selectedBrands.length > 0 || selectedAudience.length > 0 || selectedForms.length > 0 || selectedPower.length > 0 || selectedLoss.length > 0;

  return (
    <div className="space-y-6 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-accent">{locale === 'ru' ? 'Фильтры' : 'Filtrlar'}</h2>

      {/* Brand Filter */}
      {selectedBrandName ? (
        <FilterSection title={locale === 'ru' ? 'Бренд' : 'Brend'}>
          <div className="flex items-center gap-2 text-sm font-medium text-brand-accent">
            <span>{selectedBrandName}</span>
          </div>
        </FilterSection>
      ) : (brands && brands.length > 0) ? (
        <FilterSection title={locale === 'ru' ? 'Бренд' : 'Brend'}>
          {brands
            .filter((brand) => (brand.count ?? 0) > 0)
            .map((brand) => {
              const isSelected = selectedBrands.includes(brand.slug);
              const newBrands = isSelected ? selectedBrands.filter((b) => b !== brand.slug) : [...selectedBrands, brand.slug];
              const filterKey = productType ? 'brandId' : 'brand';
              const url = buildFilterUrl(productType || categorySlug, baseParams, { [filterKey]: newBrands.length > 0 ? newBrands.join(',') : undefined }, !!productType);
              return <FilterCheckbox key={brand.id} id={`brand-${brand.id}`} label={brand.name} checked={isSelected} url={url} count={brand.count} />;
            })}
        </FilterSection>
      ) : null}

      {/* Audience Filter */}
      {Object.values(audienceCounts).some((count) => count > 0) && (
        <FilterSection title={locale === 'ru' ? 'Для кого' : 'Kimlar uchun'}>
          {audienceOptions
            .filter((option) => (audienceCounts[option.value] ?? 0) > 0)
            .map((option) => {
              const isSelected = selectedAudience.includes(option.value);
              const newAudience = isSelected ? selectedAudience.filter((a) => a !== option.value) : [...selectedAudience, option.value];
              const url = buildFilterUrl(productType || categorySlug, baseParams, { audience: newAudience.length > 0 ? newAudience.join(',') : undefined }, !!productType);
              return (
                <FilterCheckbox
                  key={option.value}
                  id={`audience-${option.value}`}
                  label={locale === 'ru' ? option.label_ru : option.label_uz}
                  checked={isSelected}
                  url={url}
                  count={audienceCounts[option.value]}
                />
              );
            })}
        </FilterSection>
      )}

      {/* Form Factor Filter */}
      {Object.values(formCounts).some((count) => count > 0) && (
        <FilterSection title={locale === 'ru' ? 'Тип корпуса' : 'Korpus turi'}>
          {formFactorOptions
            .filter((option) => (formCounts[option.value] ?? 0) > 0)
            .map((option) => {
              const isSelected = selectedForms.includes(option.value);
              const newForms = isSelected ? selectedForms.filter((f) => f !== option.value) : [...selectedForms, option.value];
              const filterKey = productType ? 'formFactor' : 'form';
              const url = buildFilterUrl(productType || categorySlug, baseParams, { [filterKey]: newForms.length > 0 ? newForms.join(',') : undefined }, !!productType);
              return (
                <FilterCheckbox
                  key={option.value}
                  id={`form-${option.value}`}
                  label={locale === 'ru' ? option.label_ru : option.label_uz}
                  checked={isSelected}
                  url={url}
                  count={formCounts[option.value]}
                />
              );
            })}
        </FilterSection>
      )}

      {/* Hearing Loss Level Filter */}
      {Object.values(lossCounts).some((count) => count > 0) && (
        <FilterSection title={locale === 'ru' ? 'Степень снижения слуха' : 'Eshitish darajalari'}>
          {hearingLossOptions
            .filter((option) => (lossCounts[option.value] ?? 0) > 0)
            .map((option) => {
              const isSelected = selectedLoss.includes(option.value);
              const newLoss = isSelected ? selectedLoss.filter((l) => l !== option.value) : [...selectedLoss, option.value];
              const filterKey = productType ? 'hearingLossLevel' : 'loss';
              const url = buildFilterUrl(productType || categorySlug, baseParams, { [filterKey]: newLoss.length > 0 ? newLoss.join(',') : undefined }, !!productType);
              return (
                <FilterCheckbox
                  key={option.value}
                  id={`loss-${option.value}`}
                  label={locale === 'ru' ? option.label_ru : option.label_uz}
                  checked={isSelected}
                  url={url}
                  count={lossCounts[option.value]}
                />
              );
            })}
        </FilterSection>
      )}

      {/* Power Level Filter */}
      {Object.values(powerCounts).some((count) => count > 0) && (
        <FilterSection title={locale === 'ru' ? 'Мощность' : 'Quvvat'}>
          {powerLevelOptions
            .filter((option) => (powerCounts[option.value] ?? 0) > 0)
            .map((option) => {
              const isSelected = selectedPower.includes(option.value);
              const newPower = isSelected ? selectedPower.filter((p) => p !== option.value) : [...selectedPower, option.value];
              const filterKey = productType ? 'powerLevel' : 'power';
              const url = buildFilterUrl(productType || categorySlug, baseParams, { [filterKey]: newPower.length > 0 ? newPower.join(',') : undefined }, !!productType);
              return (
                <FilterCheckbox
                  key={option.value}
                  id={`power-${option.value}`}
                  label={locale === 'ru' ? option.label_ru : option.label_uz}
                  checked={isSelected}
                  url={url}
                  count={powerCounts[option.value]}
                />
              );
            })}
        </FilterSection>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Link
          href={buildFilterUrl(productType || categorySlug, {}, {}, !!productType)}
          className="inline-block w-full rounded-full border border-brand-primary/30 bg-white px-4 py-2 text-center text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
        >
          {locale === 'ru' ? 'Сбросить фильтры' : 'Filtrlarni tozalash'}
        </Link>
      )}
    </div>
  );
}
