'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
        <input type="checkbox" checked={checked} readOnly className="rounded border-border/60 text-brand-primary focus:ring-brand-primary pointer-events-none" />
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && <span className="text-xs text-muted-foreground">({count})</span>}
    </Link>
  );
}

interface CatalogFiltersProps {
  categorySlug: string;
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
}

function buildFilterUrl(slug: string, currentParams: URLSearchParams, updates: Record<string, string | undefined>) {
  const params = new URLSearchParams(currentParams);
  // Remove page when filters change
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

export default function CatalogFilters({
  categorySlug,
  locale,
  brands,
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
}: CatalogFiltersProps) {
  const searchParams = useSearchParams();
  const audienceOptions: FilterOption[] = [
    { value: 'children', label_uz: 'Bolalar', label_ru: 'Детям' },
    { value: 'adults', label_uz: 'Kattalar', label_ru: 'Взрослым' },
    { value: 'elderly', label_uz: 'Keksalar', label_ru: 'Пожилым' },
  ];

  const formFactorOptions: FilterOption[] = [
    { value: 'bte', label_uz: 'BTE', label_ru: 'BTE' },
    { value: 'mini-bte', label_uz: 'Mini BTE', label_ru: 'Mini BTE' },
    { value: 'ric', label_uz: 'RIC', label_ru: 'RIC' },
    { value: 'rite', label_uz: 'RITE', label_ru: 'RITE' },
    { value: 'ite', label_uz: 'ITE', label_ru: 'ITE' },
    { value: 'cic', label_uz: 'CIC', label_ru: 'CIC' },
    { value: 'cic-iic', label_uz: 'CIC/IIC', label_ru: 'CIC/IIC' },
    { value: 'iic', label_uz: 'IIC', label_ru: 'IIC' },
    { value: 'power-bte', label_uz: 'Power BTE', label_ru: 'Power BTE' },
  ];

  const hearingLossOptions: FilterOption[] = [
    { value: 'mild', label_uz: 'I daraja', label_ru: 'I степень' },
    { value: 'moderate', label_uz: 'II daraja', label_ru: 'II степень' },
    { value: 'severe', label_uz: 'III daraja', label_ru: 'III степень' },
    { value: 'profound', label_uz: 'IV daraja', label_ru: 'IV степень' },
  ];

  const powerLevelOptions: FilterOption[] = [
    { value: 'Standard', label_uz: 'Standart', label_ru: 'Стандартная' },
    { value: 'Power', label_uz: 'Kuchli', label_ru: 'Мощная' },
    { value: 'Super Power', label_uz: 'Super kuchli', label_ru: 'Супермощная' },
  ];

  const hasActiveFilters =
    selectedBrands.length > 0 || selectedAudience.length > 0 || selectedForms.length > 0 || selectedPower.length > 0 || selectedLoss.length > 0;

  return (
    <div className="sticky top-24 space-y-6 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-accent">{locale === 'ru' ? 'Фильтры' : 'Filtrlar'}</h2>

      {/* Brand Filter */}
      {selectedBrandName ? (
        <FilterSection title={locale === 'ru' ? 'Бренд' : 'Brend'}>
          <div className="flex items-center gap-2 text-sm font-medium text-brand-accent">
            <span>{selectedBrandName}</span>
          </div>
        </FilterSection>
      ) : brands.length > 0 ? (
        <FilterSection title={locale === 'ru' ? 'Бренд' : 'Brend'}>
          {brands
            .filter((brand) => (brand.count ?? 0) > 0)
            .map((brand) => {
              const isSelected = selectedBrands.includes(brand.slug);
              const newBrands = isSelected ? selectedBrands.filter((b) => b !== brand.slug) : [...selectedBrands, brand.slug];
              const url = buildFilterUrl(categorySlug, searchParams, { brand: newBrands.length > 0 ? newBrands.join(',') : undefined });
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
              const url = buildFilterUrl(categorySlug, searchParams, { audience: newAudience.length > 0 ? newAudience.join(',') : undefined });
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
              const url = buildFilterUrl(categorySlug, searchParams, { form: newForms.length > 0 ? newForms.join(',') : undefined });
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
              const url = buildFilterUrl(categorySlug, searchParams, { loss: newLoss.length > 0 ? newLoss.join(',') : undefined });
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
              const url = buildFilterUrl(categorySlug, searchParams, { power: newPower.length > 0 ? newPower.join(',') : undefined });
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
          href={`/catalog/${categorySlug}`}
          className="inline-block w-full rounded-full border border-brand-primary/30 bg-white px-4 py-2 text-center text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
        >
          {locale === 'ru' ? 'Сбросить фильтры' : 'Filtrlarni tozalash'}
        </Link>
      )}
    </div>
  );
}
