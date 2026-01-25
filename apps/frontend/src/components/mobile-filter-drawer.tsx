'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { X, Filter } from 'lucide-react';

interface MobileFilterDrawerProps {
  locale: 'uz' | 'ru';
  brandTabs: Array<{ id: string; name: string; slug: string }>;
  searchParams: {
    productType?: string;
    brandId?: string;
    sort?: string;
    audience?: string;
    formFactor?: string;
    signalProcessing?: string;
    powerLevel?: string;
    smartphoneCompatibility?: string;
  };
}

export default function MobileFilterDrawer({ locale, brandTabs, searchParams }: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentParams = useSearchParams();

  const buildFilterUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(currentParams);
    params.delete('page');
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    return `/catalog?${params.toString()}`;
  };

  const activeFiltersCount = [
    searchParams.brandId,
    searchParams.audience,
    searchParams.formFactor,
    searchParams.signalProcessing,
    searchParams.powerLevel,
    searchParams.smartphoneCompatibility,
  ].filter(Boolean).length;

  return (
    <>
      {/* Filter Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-brand-primary text-white px-4 py-3 rounded-full shadow-lg hover:bg-brand-accent transition-colors"
      >
        <Filter size={20} />
        <span className="font-medium">
          {locale === 'ru' ? 'Фильтр' : 'Filter'}
        </span>
        {activeFiltersCount > 0 && (
          <span className="bg-white text-brand-primary rounded-full px-2 py-0.5 text-xs font-bold min-w-[20px] text-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-out ${
              isOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ maxHeight: '90vh' }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/60">
                <h2 className="text-lg font-semibold text-brand-accent">
                  {locale === 'ru' ? 'Фильтр' : 'Filter'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted/50 rounded-full transition-colors"
                >
                  <X size={24} className="text-muted-foreground" />
                </button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Brand Filter */}
                {brandTabs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-brand-primary mb-3">
                      {locale === 'ru' ? 'Производитель' : 'Ishlab chiqaruvchi'}
                    </h3>
                    <div className="space-y-2">
                      <Link
                        href={buildFilterUrl({ brandId: undefined })}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2 p-2 rounded-lg transition ${
                          !searchParams.brandId
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                          !searchParams.brandId
                            ? 'border-brand-primary bg-brand-primary'
                            : 'border-border/60 bg-white'
                        }`}>
                          {!searchParams.brandId && (
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm">{locale === 'ru' ? 'Все' : 'Barchasi'}</span>
                      </Link>
                      {brandTabs.map((brand) => {
                        const isChecked = searchParams.brandId === brand.id;
                        return (
                          <Link
                            key={brand.id}
                            href={buildFilterUrl({ brandId: isChecked ? undefined : brand.id })}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2 p-2 rounded-lg transition ${
                              isChecked
                                ? 'bg-brand-primary/10 text-brand-primary'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                              isChecked
                                ? 'border-brand-primary bg-brand-primary'
                                : 'border-border/60 bg-white'
                            }`}>
                              {isChecked && (
                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm">{brand.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form Factor Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-primary mb-3">
                    {locale === 'ru' ? 'Тип корпуса' : 'Korpus turi'}
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: 'BTE', label_ru: 'Заушные (BTE)', label_uz: 'Quloq orqasidagi (BTE)' },
                      { value: 'miniRITE', label_ru: 'Минизаушные (miniRITE/miniBTE)', label_uz: 'Mini quloq orqasidagi (miniRITE/miniBTE)' },
                      { value: 'ITC', label_ru: 'Внутриушные (ITC/ITE)', label_uz: 'Quloq ichidagi (ITC/ITE)' },
                      { value: 'CIC', label_ru: 'Внутриканальные (CIC/IIC)', label_uz: 'Kanal ichidagi (CIC/IIC)' },
                    ].map((option) => {
                      const isChecked = searchParams.formFactor === option.value;
                      return (
                        <Link
                          key={option.value}
                          href={buildFilterUrl({ formFactor: isChecked ? undefined : option.value })}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-2 p-2 rounded-lg transition ${
                            isChecked
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                            isChecked
                              ? 'border-brand-primary bg-brand-primary'
                              : 'border-border/60 bg-white'
                          }`}>
                            {isChecked && (
                              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm">{locale === 'ru' ? option.label_ru : option.label_uz}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="pt-4 border-t border-border/60">
                    <Link
                      href={`/catalog?productType=${searchParams.productType || 'hearing-aids'}`}
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center py-3 rounded-lg border-2 border-brand-primary text-brand-primary font-medium hover:bg-brand-primary/10 transition-colors"
                    >
                      {locale === 'ru' ? 'Сбросить фильтры' : 'Filtrlarni tozalash'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

