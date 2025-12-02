import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCatalogs, getPosts, getBrands, getSettings } from '@/lib/api-server';
import type { CatalogResponse, PostResponse, BrandResponse, SettingsResponse } from '@/lib/api';
import { detectLocale } from '@/lib/locale-server';
import CatalogHeroImage from '@/components/catalog-hero-image';
import Sidebar from '@/components/sidebar';
import { normalizeImageUrl } from '@/lib/image-utils';

// ISR: Revalidate every 30 minutes
export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLocale();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const catalogUrl = `${baseUrl}/catalog`;

  return {
    title: locale === 'ru' ? 'Каталог — Acoustic.uz' : 'Katalog — Acoustic.uz',
    description: locale === 'ru'
      ? 'Каталог слуховых аппаратов и решений от Acoustic. Выберите подходящий аппарат под ваш образ жизни, уровень активности и бюджет.'
      : "Acoustic eshitish markazining katalogi — eshitish apparatlari, implantlar va aksessuarlar haqida ma'lumot.",
    alternates: {
      canonical: catalogUrl,
      languages: {
        uz: catalogUrl,
        ru: catalogUrl,
        'x-default': catalogUrl,
      },
    },
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Redirect old query-based URLs to path-based
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { 
    category?: string;
    productType?: string;
    filter?: string;
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
}) {
  // Handle redirect from old query-based URLs
  if (searchParams.category) {
    redirect(`/catalog/${searchParams.category}`);
  }

  const locale = detectLocale();
  
  // If productType is provided, show products instead of catalogs
  if (searchParams.productType) {
    const { getProducts, getProductCategories } = await import('@/lib/api-server');
    const page = parseInt(searchParams.page || '1', 10);
    // For interacoustics, show 6 products per page (3x2), otherwise 12 (3x4)
    const pageSize = searchParams.productType === 'interacoustics' ? 6 : 12;
    const offset = (page - 1) * pageSize;
    
    const [productsResponse, categoriesData, postsData, brandsData, settingsData] = await Promise.all([
      getProducts({
      status: 'published',
      productType: searchParams.productType,
        brandId: searchParams.brandId,
        audience: searchParams.audience,
        formFactor: searchParams.formFactor,
        signalProcessing: searchParams.signalProcessing,
        powerLevel: searchParams.powerLevel,
        hearingLossLevel: searchParams.hearingLossLevel,
        smartphoneCompatibility: searchParams.smartphoneCompatibility,
        limit: pageSize,
        offset: offset,
        sort: searchParams.sort === 'price_asc' ? 'price_asc' : searchParams.sort === 'price_desc' ? 'price_desc' : 'newest',
      }, locale) || { items: [], total: 0, page: 1, pageSize: 12 },
      getProductCategories(locale),
      getPosts(locale, true),
      getBrands(locale),
      getSettings(locale),
    ]);
    
    const totalPages = Math.ceil((productsResponse.total || 0) / pageSize);
    
    let filteredProducts = productsResponse.items || [];
    
    // Filter by "children" if filter=children (legacy support)
    if (searchParams.filter === 'children') {
      filteredProducts = filteredProducts.filter((p) => 
        p.audience?.includes('children')
      );
    }
    
    // Filter by "wireless" if filter=wireless (legacy support)
    if (searchParams.filter === 'wireless') {
      filteredProducts = filteredProducts.filter((p) => 
        p.smartphoneCompatibility?.length > 0 || 
        p.smartphoneCompatibility?.includes('wireless') ||
        p.smartphoneCompatibility?.includes('bluetooth')
      );
    }
    
    const pageTitle = searchParams.productType === 'hearing-aids' 
      ? (locale === 'ru' ? 'Каталог и цены на слуховые аппараты' : 'Eshitish moslamalari katalogi va narxlari')
      : searchParams.productType === 'interacoustics'
      ? 'Interacoustics'
      : (locale === 'ru' ? 'Аксессуары' : 'Aksessuarlar');
    
    // Filter brands for tabs (Oticon, ReSound, Signia)
    const brandTabs = brandsData?.filter((brand) => {
      const brandName = brand.name?.toLowerCase() || '';
      return brandName.includes('oticon') || brandName.includes('resound') || brandName.includes('signia');
    }) || [];
    
    // Sort brands: Oticon, ReSound, Signia
    const brandOrder = ['oticon', 'resound', 'signia'];
    brandTabs.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aIndex = brandOrder.findIndex(o => aName.includes(o));
      const bIndex = brandOrder.findIndex(o => bName.includes(o));
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
    
    const availabilityMap: Record<string, { uz: string; ru: string }> = {
      'in-stock': { uz: 'Sotuvda', ru: 'В наличии' },
      preorder: { uz: 'Buyurtmaga', ru: 'Под заказ' },
      'out-of-stock': { uz: 'Tugagan', ru: 'Нет в наличии' },
    };
    
    return (
      <main className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-6">
            <Link href="/" className="hover:text-brand-primary" suppressHydrationWarning>
              {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
            </Link>
            <span className="mx-2">›</span>
            <Link href="/catalog" className="hover:text-brand-primary" suppressHydrationWarning>
              {locale === 'ru' ? 'Каталог' : 'Katalog'}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-brand-primary" suppressHydrationWarning>
              {searchParams.productType === 'hearing-aids' 
                ? (locale === 'ru' ? 'Слуховые аппараты' : 'Eshitish moslamalari')
                : pageTitle}
            </span>
          </div>
        </section>

        {/* Top Banner */}
        <section className="bg-brand-accent py-4">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h1 className="text-xl font-bold text-white uppercase tracking-wide md:text-2xl" suppressHydrationWarning>
              {searchParams.productType === 'hearing-aids'
                ? (locale === 'ru' ? 'КАТАЛОГ И ЦЕНЫ НА СЛУХОВЫЕ АППАРАТЫ' : 'ESHTISH MOSLAMALARI KATALOGI VA NARXLARI')
                : pageTitle}
            </h1>
          </div>
        </section>

        {/* Main Content with Sidebar */}
        <section className="bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Sidebar - Filter Panel First */}
              <aside className="space-y-6">
                {/* Filter Panel - Hide for interacoustics */}
                {searchParams.productType !== 'interacoustics' && (
                  <div className="rounded-lg border border-border/60 bg-white p-4">
                    <h3 className="mb-4 text-base font-semibold text-brand-primary">
                      {locale === 'ru' ? 'Фильтр по параметрам' : 'Parametrlar bo\'yicha filter'}
                    </h3>
                    
                    {/* Производитель (Manufacturer) - Hide for interacoustics */}
                  {searchParams.productType !== 'interacoustics' && (
                    <div className="mb-6">
                      <h4 className="mb-3 text-sm font-semibold text-brand-primary">
                        {locale === 'ru' ? 'Производитель' : 'Ishlab chiqaruvchi'}
                      </h4>
                      <div className="space-y-2">
                        {brandTabs.map((brand) => {
                          const isChecked = searchParams.brandId === brand.id;
                          const params = new URLSearchParams();
                          if (searchParams.productType) params.set('productType', searchParams.productType);
                          if (searchParams.sort) params.set('sort', searchParams.sort);
                          if (!isChecked) params.set('brandId', brand.id);
                          // Preserve other filters
                          if (searchParams.audience) params.set('audience', searchParams.audience);
                          if (searchParams.formFactor) params.set('formFactor', searchParams.formFactor);
                          if (searchParams.signalProcessing) params.set('signalProcessing', searchParams.signalProcessing);
                          if (searchParams.powerLevel) params.set('powerLevel', searchParams.powerLevel);
                          if (searchParams.hearingLossLevel) params.set('hearingLossLevel', searchParams.hearingLossLevel);
                          if (searchParams.smartphoneCompatibility) params.set('smartphoneCompatibility', searchParams.smartphoneCompatibility);
                          
                          return (
                            <Link
                              key={brand.id}
                              href={`/catalog?${params.toString()}`}
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
                  )}


                  {/* Тип корпуса (Body type) - Hide for interacoustics */}
                  {searchParams.productType !== 'interacoustics' && (
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
                        const params = new URLSearchParams();
                        if (searchParams.productType) params.set('productType', searchParams.productType);
                        if (searchParams.sort) params.set('sort', searchParams.sort);
                        if (searchParams.brandId) params.set('brandId', searchParams.brandId);
                        if (searchParams.audience) params.set('audience', searchParams.audience);
                        if (!isChecked) params.set('formFactor', option.value);
                        // Preserve other filters
                        if (searchParams.signalProcessing) params.set('signalProcessing', searchParams.signalProcessing);
                        if (searchParams.powerLevel) params.set('powerLevel', searchParams.powerLevel);
                        if (searchParams.hearingLossLevel) params.set('hearingLossLevel', searchParams.hearingLossLevel);
                        if (searchParams.smartphoneCompatibility) params.set('smartphoneCompatibility', searchParams.smartphoneCompatibility);
                        
                        return (
                          <Link
                            key={option.value}
                            href={`/catalog?${params.toString()}`}
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
                  )}

                  {/* Тип обработки сигнала (Signal processing) - Hide for interacoustics */}
                  {searchParams.productType !== 'interacoustics' && (
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
                        const params = new URLSearchParams();
                        if (searchParams.productType) params.set('productType', searchParams.productType);
                        if (searchParams.sort) params.set('sort', searchParams.sort);
                        if (searchParams.brandId) params.set('brandId', searchParams.brandId);
                        if (searchParams.audience) params.set('audience', searchParams.audience);
                        if (searchParams.formFactor) params.set('formFactor', searchParams.formFactor);
                        if (!isChecked) params.set('signalProcessing', option.value);
                        // Preserve other filters
                        if (searchParams.powerLevel) params.set('powerLevel', searchParams.powerLevel);
                        if (searchParams.hearingLossLevel) params.set('hearingLossLevel', searchParams.hearingLossLevel);
                        if (searchParams.smartphoneCompatibility) params.set('smartphoneCompatibility', searchParams.smartphoneCompatibility);
                        
                        return (
                          <Link
                            key={option.value}
                            href={`/catalog?${params.toString()}`}
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
                  )}

                  {/* Мощность (Power) - Hide for interacoustics */}
                  {searchParams.productType !== 'interacoustics' && (
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
                        const params = new URLSearchParams();
                        if (searchParams.productType) params.set('productType', searchParams.productType);
                        if (searchParams.sort) params.set('sort', searchParams.sort);
                        if (searchParams.brandId) params.set('brandId', searchParams.brandId);
                        if (searchParams.audience) params.set('audience', searchParams.audience);
                        if (searchParams.formFactor) params.set('formFactor', searchParams.formFactor);
                        if (searchParams.signalProcessing) params.set('signalProcessing', searchParams.signalProcessing);
                        if (!isChecked) params.set('powerLevel', option.value);
                        // Preserve other filters
                        if (searchParams.hearingLossLevel) params.set('hearingLossLevel', searchParams.hearingLossLevel);
                        if (searchParams.smartphoneCompatibility) params.set('smartphoneCompatibility', searchParams.smartphoneCompatibility);
                        
                        return (
                          <Link
                            key={option.value}
                            href={`/catalog?${params.toString()}`}
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
                  )}

                  {/* Степень снижения слуха (Hearing loss level) - Hide for interacoustics */}
                  {searchParams.productType !== 'interacoustics' && (
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
                        const params = new URLSearchParams();
                        if (searchParams.productType) params.set('productType', searchParams.productType);
                        if (searchParams.sort) params.set('sort', searchParams.sort);
                        if (searchParams.brandId) params.set('brandId', searchParams.brandId);
                        if (searchParams.audience) params.set('audience', searchParams.audience);
                        if (searchParams.formFactor) params.set('formFactor', searchParams.formFactor);
                        if (searchParams.signalProcessing) params.set('signalProcessing', searchParams.signalProcessing);
                        if (searchParams.powerLevel) params.set('powerLevel', searchParams.powerLevel);
                        if (!isChecked) params.set('hearingLossLevel', option.value);
                        // Preserve other filters
                        if (searchParams.smartphoneCompatibility) params.set('smartphoneCompatibility', searchParams.smartphoneCompatibility);
                        
                        return (
                          <Link
                            key={option.value}
                            href={`/catalog?${params.toString()}`}
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
                  )}

                  {/* Совместимость со смартфонами (Smartphone compatibility) - Hide for interacoustics */}
                  {searchParams.productType !== 'interacoustics' && (
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
                        const params = new URLSearchParams();
                        if (searchParams.productType) params.set('productType', searchParams.productType);
                        if (searchParams.sort) params.set('sort', searchParams.sort);
                        if (searchParams.brandId) params.set('brandId', searchParams.brandId);
                        if (searchParams.audience) params.set('audience', searchParams.audience);
                        if (searchParams.formFactor) params.set('formFactor', searchParams.formFactor);
                        if (searchParams.signalProcessing) params.set('signalProcessing', searchParams.signalProcessing);
                        if (searchParams.powerLevel) params.set('powerLevel', searchParams.powerLevel);
                        if (searchParams.hearingLossLevel) params.set('hearingLossLevel', searchParams.hearingLossLevel);
                        if (!isChecked) params.set('smartphoneCompatibility', option.value);
                        
                        return (
                          <Link
                            key={option.value}
                            href={`/catalog?${params.toString()}`}
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
                  )}
                  </div>
                )}

                {/* Categories */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Link
                      href="/catalog?productType=hearing-aids"
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-foreground">
                        {locale === 'ru' ? 'Слуховые аппараты' : 'Eshitish moslamalari'}
                      </span>
                    </Link>
                    <Link
                      href="/catalog?categoryId=batteries"
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                        <div className="h-6 w-4 rounded-sm border-2 border-foreground/30"></div>
                      </div>
                      <span className="text-sm text-foreground">
                        {locale === 'ru' ? 'Батарейки для слуховых аппаратов' : 'Eshitish apparatlari uchun batareyalar'}
                      </span>
                    </Link>
                    <Link
                      href="/catalog?categoryId=care"
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                        <div className="h-5 w-5 rounded border border-foreground/30"></div>
                      </div>
                      <span className="text-sm text-foreground">
                        {locale === 'ru' ? 'Средства по уходу' : 'Parvarish vositalari'}
                      </span>
                    </Link>
                    <Link
                      href="/catalog?categoryId=accessories"
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3 transition hover:border-brand-primary/50 hover:bg-white"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white border border-border/40">
                        <div className="h-6 w-4 rounded border border-foreground/30"></div>
                      </div>
                      <span className="text-sm text-foreground">
                        {locale === 'ru' ? 'Беспроводные аксессуары' : 'Simsiz aksessuarlar'}
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Useful Articles */}
                {postsData && postsData.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border/60 pb-2">
                      {locale === 'ru' ? 'Полезные статьи' : 'Foydali maqolalar'}
                    </h3>
                    <div className="space-y-3">
                      {postsData.slice(0, 5).map((post) => {
                        const title = locale === 'ru' ? (post.title_ru || '') : (post.title_uz || '');
                        const coverImage = (post as any).cover?.url || '';
                        return (
                          <Link
                            key={post.id}
                            href={`/posts/${post.slug}`}
                            className="group flex items-start gap-3 rounded-lg transition hover:opacity-80"
                          >
                            {coverImage ? (
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
                                <Image
                                  src={coverImage}
                                  alt={title}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                  suppressHydrationWarning
                                />
                              </div>
                            ) : (
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted/30">
                                <div className="flex h-full w-full items-center justify-center">
                                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                </div>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-brand-primary group-hover:underline line-clamp-2" suppressHydrationWarning>
                                {title}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </aside>

              {/* Main Content */}
              <div className="space-y-6">
                {/* Promotional Hero Section - Before Brand Tabs */}
                {searchParams.productType === 'hearing-aids' && (
                  <section className="relative w-full rounded-lg overflow-hidden">
                    <CatalogHeroImage
                      src={normalizeImageUrl(settingsData?.catalogHeroImage?.url) || '/images/catalog-hero.jpg'}
                      alt={locale === 'ru' ? 'Каталог слуховых аппаратов' : 'Eshitish moslamalari katalogi'}
                      locale={locale}
                    />
                  </section>
                )}

                {/* Brand Tabs - Hide for interacoustics */}
                {brandTabs.length > 0 && searchParams.productType !== 'interacoustics' && (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/catalog?productType=${searchParams.productType}`}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        !searchParams.brandId
                          ? 'bg-brand-primary text-white'
                          : 'bg-muted/30 text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {locale === 'ru' ? 'Все' : 'Barchasi'}
                    </Link>
                    {brandTabs.map((brand) => {
                      const params = new URLSearchParams();
                      if (searchParams.productType) params.set('productType', searchParams.productType);
                      params.set('brandId', brand.id);
                      if (searchParams.sort) params.set('sort', searchParams.sort);
                      // Preserve filters
                      if (searchParams.audience) params.set('audience', searchParams.audience);
                      if (searchParams.formFactor) params.set('formFactor', searchParams.formFactor);
                      if (searchParams.signalProcessing) params.set('signalProcessing', searchParams.signalProcessing);
                      if (searchParams.powerLevel) params.set('powerLevel', searchParams.powerLevel);
                      if (searchParams.hearingLossLevel) params.set('hearingLossLevel', searchParams.hearingLossLevel);
                      if (searchParams.smartphoneCompatibility) params.set('smartphoneCompatibility', searchParams.smartphoneCompatibility);
                      
                      return (
                        <Link
                          key={brand.id}
                          href={`/catalog?${params.toString()}`}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            searchParams.brandId === brand.id
                              ? 'bg-brand-primary text-white'
                              : 'bg-muted/30 text-foreground hover:bg-muted/50'
                          }`}
                        >
                          {brand.name}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Sort */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{locale === 'ru' ? 'Сортировать по:' : 'Saralash:'}</span>
                  <Link
                    href={`/catalog?productType=${searchParams.productType}&sort=price_asc${searchParams.brandId ? `&brandId=${searchParams.brandId}` : ''}`}
                    className={`hover:text-brand-primary ${searchParams.sort === 'price_asc' ? 'text-brand-primary font-medium' : ''}`}
                  >
                    {locale === 'ru' ? 'цене' : 'narx'}
                  </Link>
                </div>

                {/* Products Grid - 3x4 = 12 items */}
            {filteredProducts.length > 0 ? (
                  <>
              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts.slice(0, pageSize).map((product) => {
                  const productName = locale === 'ru' ? (product.name_ru || '') : (product.name_uz || '');
                  
                  // Try to get image from galleryUrls, thumbnail, or brand logo
                  let mainImage = '';
                  if (product.galleryUrls && product.galleryUrls.length > 0) {
                    mainImage = normalizeImageUrl(product.galleryUrls[0]);
                  } else if (product.brand?.logo?.url) {
                    mainImage = normalizeImageUrl(product.brand.logo.url);
                  }
                  
                  const priceFormatted = product.price 
                    ? `${new Intl.NumberFormat('uz-UZ').format(Number(product.price))} so'm`
                    : null;
                      const availability = product.availabilityStatus 
                        ? availabilityMap[product.availabilityStatus] 
                    : null;
                  
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                          className="group flex flex-col gap-2 sm:gap-3 rounded-lg border-[0.5px] border-brand-accent/40 bg-white p-2 sm:p-4 shadow-sm transition hover:border-brand-accent/60 hover:shadow-md"
                        >
                          {/* Product Image - Top, Large */}
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-brand-accent/60 bg-white">
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={productName}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-105"
                              suppressHydrationWarning
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-brand-primary">
                                <span className="text-white text-lg font-bold">Acoustic</span>
                            </div>
                          )}
                        </div>
                        
                          {/* Product Info */}
                          <div className="flex flex-col gap-1 sm:gap-2">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 group-hover:text-brand-primary" suppressHydrationWarning>
                            {productName}
                          </h3>
                            {priceFormatted && (
                              <p className="text-base sm:text-lg font-semibold text-brand-primary" suppressHydrationWarning>
                                {priceFormatted}
                              </p>
                            )}
                            {availability && (
                              <p className="text-xs sm:text-sm text-emerald-600 font-medium" suppressHydrationWarning>
                                {locale === 'ru' ? availability.ru : availability.uz}
                              </p>
                            )}
                            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-brand-primary group-hover:gap-2 transition-all mt-auto" suppressHydrationWarning>
                              {locale === 'ru' ? 'Подробнее' : 'Batafsil'}
                              <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-6">
                        {page > 1 && (
                          <Link
                            href={`/catalog?productType=${searchParams.productType}&page=${page - 1}${searchParams.brandId ? `&brandId=${searchParams.brandId}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}${searchParams.audience ? `&audience=${searchParams.audience}` : ''}${searchParams.formFactor ? `&formFactor=${searchParams.formFactor}` : ''}${searchParams.signalProcessing ? `&signalProcessing=${searchParams.signalProcessing}` : ''}${searchParams.powerLevel ? `&powerLevel=${searchParams.powerLevel}` : ''}${searchParams.hearingLossLevel ? `&hearingLossLevel=${searchParams.hearingLossLevel}` : ''}${searchParams.smartphoneCompatibility ? `&smartphoneCompatibility=${searchParams.smartphoneCompatibility}` : ''}`}
                            className="px-4 py-2 rounded-lg border border-border/60 bg-white text-sm font-medium text-foreground transition hover:border-brand-primary/50 hover:bg-muted/20"
                          >
                            {locale === 'ru' ? 'Назад' : 'Orqaga'}
                          </Link>
                        )}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 7) {
                              pageNum = i + 1;
                            } else if (page <= 4) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 3) {
                              pageNum = totalPages - 6 + i;
                            } else {
                              pageNum = page - 3 + i;
                            }
                            
                            const params = new URLSearchParams();
                            if (searchParams.productType) params.set('productType', searchParams.productType);
                            params.set('page', pageNum.toString());
                            if (searchParams.brandId) params.set('brandId', searchParams.brandId);
                            if (searchParams.sort) params.set('sort', searchParams.sort);
                            if (searchParams.audience) params.set('audience', searchParams.audience);
                            if (searchParams.formFactor) params.set('formFactor', searchParams.formFactor);
                            if (searchParams.signalProcessing) params.set('signalProcessing', searchParams.signalProcessing);
                            if (searchParams.powerLevel) params.set('powerLevel', searchParams.powerLevel);
                            if (searchParams.hearingLossLevel) params.set('hearingLossLevel', searchParams.hearingLossLevel);
                            if (searchParams.smartphoneCompatibility) params.set('smartphoneCompatibility', searchParams.smartphoneCompatibility);
                            
                            return (
                              <Link
                                key={pageNum}
                                href={`/catalog?${params.toString()}`}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                                  page === pageNum
                                    ? 'bg-brand-primary text-white'
                                    : 'border border-border/60 bg-white text-foreground hover:border-brand-primary/50 hover:bg-muted/20'
                                }`}
                              >
                                {pageNum}
                              </Link>
                            );
                          })}
                        </div>
                        {page < totalPages && (
                          <Link
                            href={`/catalog?productType=${searchParams.productType}&page=${page + 1}${searchParams.brandId ? `&brandId=${searchParams.brandId}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}${searchParams.audience ? `&audience=${searchParams.audience}` : ''}${searchParams.formFactor ? `&formFactor=${searchParams.formFactor}` : ''}${searchParams.signalProcessing ? `&signalProcessing=${searchParams.signalProcessing}` : ''}${searchParams.powerLevel ? `&powerLevel=${searchParams.powerLevel}` : ''}${searchParams.hearingLossLevel ? `&hearingLossLevel=${searchParams.hearingLossLevel}` : ''}${searchParams.smartphoneCompatibility ? `&smartphoneCompatibility=${searchParams.smartphoneCompatibility}` : ''}`}
                            className="px-4 py-2 rounded-lg border border-border/60 bg-white text-sm font-medium text-foreground transition hover:border-brand-primary/50 hover:bg-muted/20"
                          >
                            {locale === 'ru' ? 'Далее' : 'Keyingi'}
                          </Link>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-12 text-center">
                <p className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                  {locale === 'ru' ? 'Товары не найдены' : 'Mahsulotlar topilmadi'}
                </p>
                <p className="mt-2 text-sm text-muted-foreground" suppressHydrationWarning>
                  {locale === 'ru'
                    ? 'Попробуйте изменить параметры фильтров.'
                    : "Filtrlarni o'zgartirib ko'ring."}
                </p>
              </div>
            )}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
  
  // Fetch catalogs, posts, brands, and settings from backend
  const [catalogsData, postsData, brandsData, settingsData] = await Promise.all([
    getCatalogs(locale),
    getPosts(locale, true),
    getBrands(locale),
    getSettings(locale),
  ]);

  // Filter brands based on settings.sidebarBrandIds, or fallback to Oticon, ReSound, Signia
  let mainBrands: BrandResponse[] = [];
  if (settingsData?.sidebarBrandIds && settingsData.sidebarBrandIds.length > 0) {
    // Use brands from settings
    mainBrands = brandsData?.filter((brand) => 
      settingsData.sidebarBrandIds!.includes(brand.id)
    ) || [];
  } else {
    // Fallback to default brands: Oticon, ReSound, Signia
    mainBrands = brandsData?.filter((brand) => {
    const brandName = brand.name?.toLowerCase() || '';
    const brandSlug = brand.slug?.toLowerCase() || '';
    return (
      brandName.includes('oticon') ||
      brandName.includes('resound') ||
      brandName.includes('signia') ||
      brandSlug.includes('oticon') ||
      brandSlug.includes('resound') ||
      brandSlug.includes('signia')
    );
  }) || [];
  
  // Check if Signia exists in the filtered brands
  const hasSignia = mainBrands.some(b => {
    const name = (b.name || '').toLowerCase();
    const slug = (b.slug || '').toLowerCase();
    return name.includes('signia') || slug.includes('signia');
  });
  
  // If Signia is not found in backend, add it manually
  if (!hasSignia) {
    mainBrands.push({
      id: 'signia-manual',
      name: 'Signia',
      slug: 'signia',
      logo: null,
    } as BrandResponse);
    }
  }
  
  // Sort brands: maintain order from settings or default order
  const sortedBrands = settingsData?.sidebarBrandIds && settingsData.sidebarBrandIds.length > 0
    ? [...mainBrands].sort((a, b) => {
        const aIndex = settingsData.sidebarBrandIds!.indexOf(a.id);
        const bIndex = settingsData.sidebarBrandIds!.indexOf(b.id);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      })
    : [...mainBrands].sort((a, b) => {
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    const aSlug = (a.slug || '').toLowerCase();
    const bSlug = (b.slug || '').toLowerCase();
    const order = ['oticon', 'resound', 'signia'];
    const aIndex = order.findIndex(o => aName.includes(o) || aSlug.includes(o));
    const bIndex = order.findIndex(o => bName.includes(o) || bSlug.includes(o));
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  // Get sidebar sections from settings, fallback to default
  const otherSections = (settingsData?.sidebarSections && Array.isArray(settingsData.sidebarSections) && settingsData.sidebarSections.length > 0)
    ? settingsData.sidebarSections.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [
    {
      id: 'accessories',
      title_uz: 'Aksessuarlar',
      title_ru: 'Аксессуары',
      link: '/catalog/accessories',
      icon: '📱',
    },
    {
      id: 'earmolds',
      title_uz: 'Quloq qo\'shimchalari',
      title_ru: 'Ушные вкладыши',
      link: '/catalog/earmolds',
      icon: '👂',
    },
    {
      id: 'batteries',
      title_uz: 'Batareyalar',
      title_ru: 'Батарейки',
      link: '/catalog/batteries',
      icon: '🔋',
    },
    {
      id: 'care',
      title_uz: 'Parvarish vositalari',
      title_ru: 'Средства ухода',
      link: '/catalog/care',
      icon: '🧴',
    },
  ];

  // Transform catalogs for display
  const catalogItems = (catalogsData && catalogsData.length > 0 ? catalogsData : []).map((catalog) => {
    const title = locale === 'ru' ? (catalog.name_ru || '') : (catalog.name_uz || '');
    const description = locale === 'ru' ? (catalog.description_ru || '') : (catalog.description_uz || '');
    
    // Build image URL
    let image = catalog.image?.url || '';
    if (image && image.startsWith('/') && !image.startsWith('//')) {
      // Properly extract base URL by removing /api from the end
      let baseUrl = API_BASE_URL;
      if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4); // Remove '/api'
      } else if (baseUrl.endsWith('/api/')) {
        baseUrl = baseUrl.slice(0, -5); // Remove '/api/'
      }
      // Ensure baseUrl doesn't end with /
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      image = `${baseUrl}${image}`;
    }
    
    // Use catalog slug for link
    const link = catalog.slug ? `/catalog/${catalog.slug}` : '/catalog';

    return {
      id: catalog.id,
      title: title || '',
      description: description || '',
      image: image || '',
      link,
    };
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <section className="bg-[hsl(var(--secondary))]">
        <div className="mx-auto max-w-6xl px-4 py-2 sm:py-3 text-xs font-semibold uppercase tracking-wide text-white sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2">
            <Link href="/" className="hover:text-white/80 text-white/70 break-words" suppressHydrationWarning>
              {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
            </Link>
            <span className="mx-1 sm:mx-2">›</span>
            <span className="text-white break-words" suppressHydrationWarning>
              {locale === 'ru' ? 'Каталог' : 'Katalog'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="bg-white py-8 md:py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - 3 columns on large screens */}
            <div className="lg:col-span-3">
              {/* Header Title and Description */}
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3" suppressHydrationWarning>
                  {locale === 'ru' ? 'Решения для вашего образа жизни' : 'Turmush tarziga mos eshitish yechimlari'}
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed" suppressHydrationWarning>
                  {locale === 'ru'
                    ? 'Мы подберём аппарат под ваши привычки, уровень активности и бюджет. Выберите один из разделов, затем просмотрите подходящие товары в каталоге.'
                    : "Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz. Bo'limlardan birini tanlang, keyin esa katalog ichida mos mahsulotlarni ko'ring."}
                </p>
              </div>

              {/* Catalog Cards */}
              {catalogItems.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {catalogItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="group flex gap-4 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-primary/50 hover:shadow-md"
                    >
                      {/* Rasm - chapda */}
                      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-brand-primary/10">
                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.title} 
                            fill 
                            sizes="128px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            suppressHydrationWarning
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-brand-primary">
                            <span className="text-white text-xs font-bold">Acoustic</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Matn - o'ngda */}
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        {/* Katalog nomi */}
                        <h3 className="text-base font-semibold text-brand-accent leading-tight group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                          {item.title}
                        </h3>
                        
                        {/* Tavsif */}
                        {item.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" suppressHydrationWarning>
                    {locale === 'ru' 
                      ? 'Каталог продуктов пуст. Товары будут добавлены в ближайшее время.' 
                      : 'Mahsulotlar katalogi bo\'sh. Mahsulotlar tez orada qo\'shiladi.'}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar - 1 column on large screens */}
            <div className="lg:col-span-1">
              <Sidebar locale={locale} settingsData={settingsData} brandsData={brandsData} pageType="catalog" />
            </div>
          </div>
        </div>
      </section>

      {/* Useful Articles Section */}
      {postsData && postsData.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl" suppressHydrationWarning>
                {locale === 'ru' ? 'Полезные статьи' : 'Foydali maqolalar'}
              </h2>
              <div className="h-px w-20 bg-brand-primary"></div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {postsData.slice(0, 4).map((post) => {
                const title = locale === 'ru' ? (post.title_ru || '') : (post.title_uz || '');
                const excerpt = locale === 'ru' ? (post.excerpt_ru || '') : (post.excerpt_uz || '');
                const link = post.slug ? `/posts/${post.slug}` : '#';
                return (
                  <Link
                    key={post.id}
                    href={link}
                    className="group flex flex-col gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-brand-primary/50 hover:shadow-md transition-all"
                  >
                    <h3 className="text-base font-semibold text-brand-primary group-hover:text-brand-accent leading-snug line-clamp-2" suppressHydrationWarning>
                      {title}
                    </h3>
                    {excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3" suppressHydrationWarning>
                        {excerpt}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary group-hover:gap-2 transition-all mt-auto" suppressHydrationWarning>
                      {locale === 'ru' ? 'Читать' : "O'qish"}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}