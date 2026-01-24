'use client';

import Link from 'next/link';

interface ProductFiltersProps {
  locale: 'uz' | 'ru';
  brands: Array<{ id: string; name: string; slug: string }>;
  basePath?: string; // e.g., '/catalog' or '/products'
  searchParams: {
    productType?: string;
    brandId?: string;
    sort?: string;
    audience?: string;
    formFactor?: string;
    signalProcessing?: string;
    powerLevel?: string;
    hearingLossLevel?: string;
    smartphoneCompatibility?: string;
    page?: string;
  };
}

export default function ProductFilters({
  locale,
  brands,
  basePath = '/catalog',
  searchParams,
}: ProductFiltersProps) {
  
  
  const buildFilterUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    
    // Preserve all existing params first
    if (searchParams.productType) params.set('productType', searchParams.productType);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    if (searchParams.brandId) params.set('brandId', searchParams.brandId);
    if (searchParams.audience) params.set('audience', searchParams.audience);
    if (searchParams.formFactor) params.set('formFactor', searchParams.formFactor);
    if (searchParams.signalProcessing) params.set('signalProcessing', searchParams.signalProcessing);
    if (searchParams.powerLevel) params.set('powerLevel', searchParams.powerLevel);
    if (searchParams.hearingLossLevel) params.set('hearingLossLevel', searchParams.hearingLossLevel);
    if (searchParams.smartphoneCompatibility) params.set('smartphoneCompatibility', searchParams.smartphoneCompatibility);
    
    // Apply updates (this will override existing values or remove them if undefined)
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    return `${basePath}?${params.toString()}`;
  };

  // Hide filters for interacoustics
  if (searchParams.productType === 'interacoustics') {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/60 bg-white p-4">
      <h3 className="mb-4 text-base font-semibold text-brand-primary">
        {locale === 'ru' ? 'Фильтр по параметрам' : 'Parametrlar bo\'yicha filter'}
      </h3>
      
      {/* Brand Filter */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-brand-primary">
          {locale === 'ru' ? 'Производитель' : 'Ishlab chiqaruvchi'}
        </h4>
        <div className="space-y-2">
          {brands.map((brand) => {
            const isChecked = searchParams.brandId === brand.id;
            const url = buildFilterUrl({ brandId: isChecked ? undefined : brand.id });
            
            return (
              <Link
                key={brand.id}
                href={url}
                className="flex items-center gap-2 hover:opacity-80"
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
                <span className="text-sm text-foreground">{brand.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Form Factor Filter */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-brand-primary">
          {locale === 'ru' ? 'Тип корпуса' : 'Korpus turi'}
        </h4>
        <div className="space-y-2">
          {[
            { value: 'BTE', label_ru: 'Заушные (BTE)', label_uz: 'Quloq orqasidagi (BTE)' },
            { value: 'miniRITE', label_ru: 'Минизаушные (miniRITE/miniBTE)', label_uz: 'Mini quloq orqasidagi (miniRITE/miniBTE)' },
            { value: 'ITC', label_ru: 'Внутриушные (ITC/ITE)', label_uz: 'Quloq ichidagi (ITC/ITE)' },
            { value: 'CIC', label_ru: 'Внутриканальные (CIC/IIC)', label_uz: 'Kanal ichidagi (CIC/IIC)' },
          ].map((option) => {
            const isChecked = searchParams.formFactor === option.value;
            const url = buildFilterUrl({ formFactor: isChecked ? undefined : option.value });
            
            return (
              <Link
                key={option.value}
                href={url}
                className="flex items-center gap-2 hover:opacity-80"
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
                <span className="text-sm text-foreground">
                  {locale === 'ru' ? option.label_ru : option.label_uz}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Signal Processing Filter */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-brand-primary">
          {locale === 'ru' ? 'Тип обработки сигнала' : 'Signal qayta ishlash turi'}
        </h4>
        <div className="space-y-2">
          {[
            { value: 'digital', label_ru: 'Цифровой', label_uz: 'Raqamli' },
            { value: 'digital-trimmer', label_ru: 'Цифровой триммерный', label_uz: 'Raqamli trimmer' },
          ].map((option) => {
            const isChecked = searchParams.signalProcessing === option.value;
            const url = buildFilterUrl({ signalProcessing: isChecked ? undefined : option.value });
            
            return (
              <Link
                key={option.value}
                href={url}
                className="flex items-center gap-2 hover:opacity-80"
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
                <span className="text-sm text-foreground">
                  {locale === 'ru' ? option.label_ru : option.label_uz}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Power Level Filter */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-brand-primary">
          {locale === 'ru' ? 'Мощность' : 'Quvvat'}
        </h4>
        <div className="space-y-2">
          {[
            { value: 'powerful', label_ru: 'Мощные', label_uz: 'Kuchli' },
            { value: 'super-powerful', label_ru: 'Сверхмощные', label_uz: 'O\'ta kuchli' },
            { value: 'medium', label_ru: 'Средней мощности', label_uz: 'O\'rtacha quvvat' },
          ].map((option) => {
            const isChecked = searchParams.powerLevel === option.value;
            const url = buildFilterUrl({ powerLevel: isChecked ? undefined : option.value });
            
            return (
              <Link
                key={option.value}
                href={url}
                className="flex items-center gap-2 hover:opacity-80"
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
                <span className="text-sm text-foreground">
                  {locale === 'ru' ? option.label_ru : option.label_uz}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Hearing Loss Level Filter */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-brand-primary">
          {locale === 'ru' ? 'Степень снижения слуха' : 'Eshitish qobiliyatining pasayish darajasi'}
        </h4>
        <div className="space-y-2">
          {[
            { value: 'I', label_ru: 'I степень (Слабая)', label_uz: 'I daraja (Zaif)' },
            { value: 'II', label_ru: 'II степень (Умеренная)', label_uz: 'II daraja (O\'rtacha)' },
            { value: 'III', label_ru: 'III степень (Тяжелая)', label_uz: 'III daraja (Og\'ir)' },
            { value: 'IV', label_ru: 'IV степень (Глубокая)', label_uz: 'IV daraja (Chuqur)' },
          ].map((option) => {
            const isChecked = searchParams.hearingLossLevel === option.value;
            const url = buildFilterUrl({ hearingLossLevel: isChecked ? undefined : option.value });
            
            return (
              <Link
                key={option.value}
                href={url}
                className="flex items-center gap-2 hover:opacity-80"
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
                <span className="text-sm text-foreground">
                  {locale === 'ru' ? option.label_ru : option.label_uz}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Smartphone Compatibility Filter */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-semibold text-brand-primary">
          {locale === 'ru' ? 'Совместимость со смартфонами' : 'Smartfonlar bilan mos kelishi'}
        </h4>
        <div className="space-y-2">
          {[
            { value: 'iphone', label_ru: 'Полная совместимость с iPhone', label_uz: 'iPhone bilan to\'liq mos keladi' },
            { value: 'android', label_ru: 'Совместимость при помощи доп. устройств', label_uz: 'Qo\'shimcha qurilmalar yordamida mos keladi' },
          ].map((option) => {
            const isChecked = searchParams.smartphoneCompatibility === option.value;
            const url = buildFilterUrl({ smartphoneCompatibility: isChecked ? undefined : option.value });
            
            return (
              <Link
                key={option.value}
                href={url}
                className="flex items-center gap-2 hover:opacity-80"
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
                <span className="text-sm text-foreground">
                  {locale === 'ru' ? option.label_ru : option.label_uz}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
