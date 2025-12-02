import Image from 'next/image';
import Link from 'next/link';
// Removed notFound import - we never crash, always show UI
import type { Metadata } from 'next';
import { type ProductResponse, type BrandResponse } from '@/lib/api';
import { getProducts, getCategoryBySlug, getCatalogBySlug, getBrands, type ProductListResponse, type CatalogResponse } from '@/lib/api-server';
import CatalogFilters from '@/components/catalog-filters';
import CatalogSort from '@/components/catalog-sort';
import CatalogBrandChips from '@/components/catalog-brand-chips';
import CatalogPagination from '@/components/catalog-pagination';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';
import { normalizeImageUrl } from '@/lib/image-utils';

// Force dynamic rendering to ensure locale is always read from cookies
// This prevents Next.js from caching the page with a stale locale
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CatalogCategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    brand?: string;
    audience?: string;
    form?: string;
    signal?: string;
    power?: string;
    loss?: string;
    sort?: string;
    page?: string;
  };
}

const PRODUCTS_PER_PAGE = 12;


function formatPrice(price?: string | null) {
  if (!price) return null;
  const numeric = Number(price);
  if (Number.isNaN(numeric)) return price;
  return `${new Intl.NumberFormat('uz-UZ').format(numeric)} so'm`;
}

const availabilityMap: Record<string, { uz: string; ru: string; color: string }> = {
  'in-stock': {
    uz: 'Sotuvda',
    ru: 'В наличии',
    color: 'text-emerald-600 bg-emerald-50',
  },
  preorder: {
    uz: 'Buyurtmaga',
    ru: 'Под заказ',
    color: 'text-amber-600 bg-amber-50',
  },
  'out-of-stock': {
    uz: 'Tugagan',
    ru: 'Нет в наличии',
    color: 'text-rose-600 bg-rose-50',
  },
};

// Calculate facet counts from products
function calculateFacetCounts(products: ProductResponse[]) {
  const brandCounts: Record<string, number> = {};
  const audienceCounts: Record<string, number> = {};
  const formCounts: Record<string, number> = {};
  const powerCounts: Record<string, number> = {};
  const lossCounts: Record<string, number> = {};

  products.forEach((product) => {
    // Brand counts
    if (product.brand) {
      brandCounts[product.brand.slug] = (brandCounts[product.brand.slug] || 0) + 1;
    }

    // Audience counts
    product.audience.forEach((audience) => {
      audienceCounts[audience] = (audienceCounts[audience] || 0) + 1;
    });

    // Form factor counts
    product.formFactors.forEach((form) => {
      formCounts[form] = (formCounts[form] || 0) + 1;
    });

    // Power level counts
    if (product.powerLevel) {
      powerCounts[product.powerLevel] = (powerCounts[product.powerLevel] || 0) + 1;
    }

    // Hearing loss level counts
    product.hearingLossLevels.forEach((loss) => {
      lossCounts[loss] = (lossCounts[loss] || 0) + 1;
    });
  });

  return { brandCounts, audienceCounts, formCounts, powerCounts, lossCounts };
}

export async function generateMetadata({ params }: CatalogCategoryPageProps): Promise<Metadata> {
  const locale = detectLocale();
  
  // Try catalog first, then category
  const catalog = await getCatalogBySlug(params.slug, locale);
  const category = !catalog ? await getCategoryBySlug(params.slug, locale) : null;
  
  if (!catalog && !category) {
    return {
      title: locale === 'ru' ? 'Каталог не найден — Acoustic.uz' : 'Katalog topilmadi — Acoustic.uz',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const pageUrl = `${baseUrl}/catalog/${params.slug}`;
  const pageName = catalog 
    ? getBilingualText(catalog.name_uz, catalog.name_ru, locale)
    : getBilingualText(category!.name_uz, category!.name_ru, locale);

  return {
    title: `${pageName} — ${locale === 'ru' ? 'Каталог' : 'Katalog'} — Acoustic.uz`,
    description: locale === 'ru'
      ? `Слуховые аппараты и решения ${catalog ? 'в каталоге' : 'в категории'} ${pageName}.`
      : `${pageName} ${catalog ? 'katalogidagi' : 'kategoriyasidagi'} eshitish apparatlari va yechimlari.`,
    alternates: {
      canonical: pageUrl,
      languages: {
        uz: pageUrl,
        ru: pageUrl,
        'x-default': pageUrl,
      },
    },
  };
}

export default async function CatalogCategoryPage({ params, searchParams }: CatalogCategoryPageProps) {
  const locale = detectLocale();
  
  // Check if slug is a brand slug
  const brands = await getBrands(locale);
  let brand = brands.find(b => b.slug === params.slug);
  
  // If Signia is not found in backend, add it manually (same as in catalog/page.tsx)
  if (!brand && params.slug.toLowerCase() === 'signia') {
    brand = {
      id: 'signia-manual',
      name: 'Signia',
      slug: 'signia',
      logo: null,
    } as BrandResponse;
  }
  
  // If it's a brand, set brand filter in searchParams
  const effectiveSearchParams = brand 
    ? { ...searchParams, brand: searchParams.brand ? `${searchParams.brand},${brand.slug}` : brand.slug }
    : searchParams;
  
  // Optimized: Try catalog first (more common), then category
  // Both work the same way - unified filtering logic
  const catalog = !brand ? await getCatalogBySlug(params.slug, locale) : null;
  const category = !brand && !catalog ? await getCategoryBySlug(params.slug, locale) : null;
  
  // Determine filter type for products query
  const filterType = catalog ? 'catalog' : category ? 'category' : null;
  const filterId = catalog?.id || category?.id || null;

  // If both catalog and category are null (or it's a brand), show all products instead of error
  // This handles cases where homepage links to catalogs/categories that don't exist yet
  // Users can still browse all products and use filters
  // NOTE: For P0, we still use client-side filtering for the fallback case
  // This will be improved in P1 when backend supports multi-value filters
  if (!catalog && !category) {
    // For P0: Fetch all products to show when category doesn't exist
    // TODO (P1): Use backend pagination with filters once backend supports it
    const allProductsResponse = await getProducts({ 
      status: 'published',
      limit: 1000, // Temporary: fetch many to support client-side filtering
      offset: 0,
      sort: (effectiveSearchParams.sort as 'newest' | 'price_asc' | 'price_desc') || 'newest',
    }, locale) || { items: [], total: 0, page: 1, pageSize: 12 };
    
    // Safety check: ensure items is an array
    const allProducts = allProductsResponse?.items || [];
    
    // Apply filters even without category (client-side for P0)
    const selectedBrands = effectiveSearchParams.brand?.split(',').filter(Boolean) ?? [];
    const selectedAudience = effectiveSearchParams.audience?.split(',').filter(Boolean) ?? [];
    const selectedForms = effectiveSearchParams.form?.split(',').filter(Boolean) ?? [];
    const selectedSignal = effectiveSearchParams.signal?.split(',').filter(Boolean) ?? [];
    const selectedPower = effectiveSearchParams.power?.split(',').filter(Boolean) ?? [];
    const selectedLoss = effectiveSearchParams.loss?.split(',').filter(Boolean) ?? [];

    let filteredProducts = [...allProducts];

    if (selectedBrands.length > 0) {
      filteredProducts = filteredProducts.filter((p) => p.brand && selectedBrands.includes(p.brand.slug));
    }
    if (selectedAudience.length > 0) {
      filteredProducts = filteredProducts.filter((p) => selectedAudience.some((a) => p.audience.includes(a)));
    }
    if (selectedForms.length > 0) {
      filteredProducts = filteredProducts.filter((p) => selectedForms.some((f) => p.formFactors.includes(f)));
    }
    if (selectedSignal.length > 0) {
      filteredProducts = filteredProducts.filter((p) => p.signalProcessing && selectedSignal.includes(p.signalProcessing));
    }
    if (selectedPower.length > 0) {
      filteredProducts = filteredProducts.filter((p) => p.powerLevel && selectedPower.includes(p.powerLevel));
    }
    if (selectedLoss.length > 0) {
      filteredProducts = filteredProducts.filter((p) => selectedLoss.some((l) => p.hearingLossLevels.includes(l)));
    }

    // Client-side pagination (P0 fallback - will be removed in P1)
    const sortBy = (effectiveSearchParams.sort as 'newest' | 'price_asc' | 'price_desc') || 'newest';
    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));
    const currentPage = Math.min(Math.max(1, parseInt(effectiveSearchParams.page || '1', 10)), totalPages);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Get brands for filters
    const brandMap = new Map<string, BrandResponse>();
    allProducts.forEach((p) => {
      if (p.brand) {
        brandMap.set(p.brand.id, p.brand);
      }
    });
    const availableBrands: Array<BrandResponse & { count?: number }> = Array.from(brandMap.values());

    const { audienceCounts, formCounts, powerCounts, lossCounts } = calculateFacetCounts(allProducts);

    const placeholderImage = `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28">Acoustic</text></svg>`,
    )}`;

    // Show all products when category doesn't exist
    const brandName = brand ? (brand.name || '') : '';
    
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
            {brand && (
              <>
                <span className="mx-2">›</span>
                <span className="text-brand-primary" suppressHydrationWarning>{brandName}</span>
              </>
            )}
          </div>
        </section>

        {/* Header */}
        <section className="bg-brand-accent text-white">
          <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-5">
            <div className="flex-1 space-y-1.5">
              <h1 className="text-xl font-bold md:text-2xl" suppressHydrationWarning>
                {brand ? brandName : (locale === 'ru' ? 'Все товары' : 'Barcha mahsulotlar')}
              </h1>
              <p className="max-w-4xl text-sm leading-relaxed text-white/90" suppressHydrationWarning>
                {brand
                  ? (locale === 'ru'
                      ? `Все товары бренда ${brandName}. Используйте фильтры для уточнения поиска.`
                      : `${brandName} brendidagi barcha mahsulotlar. Qidiruvni aniqlashtirish uchun filtrlardan foydalaning.`)
                  : (locale === 'ru'
                      ? 'Все товары в каталоге. Используйте фильтры для уточнения поиска.'
                      : "Katalogdagi barcha mahsulotlar. Qidiruvni aniqlashtirish uchun filtrlardan foydalaning.")}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content - reuse same layout as category page */}
        <section className="bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Filter Sidebar */}
              <aside className="hidden lg:block">
                <CatalogFilters
                  categorySlug={params.slug}
                  locale={locale}
                  brands={brand ? [] : availableBrands}
                  selectedBrands={selectedBrands}
                  selectedBrandName={brand ? brandName : undefined}
                  selectedAudience={selectedAudience}
                  selectedForms={selectedForms}
                  selectedPower={selectedPower}
                  selectedLoss={selectedLoss}
                  audienceCounts={audienceCounts}
                  formCounts={formCounts}
                  powerCounts={powerCounts}
                  lossCounts={lossCounts}
                />
              </aside>

              {/* Product Grid */}
              <div className="space-y-6">
                {/* Brand Chips - only show if not a brand page */}
                {!brand && availableBrands.length > 0 && (
                  <CatalogBrandChips 
                    categorySlug={params.slug} 
                    locale={locale} 
                    brands={availableBrands} 
                    selectedBrands={effectiveSearchParams.brand?.split(',').filter(Boolean) ?? []} 
                  />
                )}

                {/* Sort & Results Count */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? `Найдено товаров: ${totalItems}` : `Topilgan mahsulotlar: ${totalItems}`}
                  </p>
                  <CatalogSort categorySlug={params.slug} locale={locale} currentSort={sortBy} />
                </div>

                {/* Products Grid */}
                {paginatedProducts.length > 0 ? (
                  <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {paginatedProducts.map((product) => {
                        const rawImage = product.galleryUrls?.[0] ?? product.brand?.logo?.url ?? '';
                        const mainImage = rawImage ? normalizeImageUrl(rawImage) : placeholderImage;
                        const priceFormatted = formatPrice(product.price);
                        const availability = product.availabilityStatus ? availabilityMap[product.availabilityStatus] : undefined;
                        const productName = getBilingualText(product.name_uz, product.name_ru, locale);

                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
                          >
                            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-primary/5">
                              <Image
                                src={mainImage}
                                alt={productName}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-brand-accent group-hover:text-brand-primary">{productName}</h3>
                              {product.brand && <p className="text-xs text-muted-foreground">{product.brand.name}</p>}
                              {priceFormatted && <p className="text-xl font-semibold text-brand-primary">{priceFormatted}</p>}
                              {availability && (
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${availability.color}`}>
                                  {locale === 'ru' ? availability.ru : availability.uz}
                                </span>
                              )}
                            </div>
                            <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary group-hover:text-brand-accent" suppressHydrationWarning>
                              {locale === 'ru' ? 'Подробнее' : 'Batafsil'} →
                            </span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    <CatalogPagination
                      categorySlug={params.slug}
                      locale={locale}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                    />
                  </>
                ) : (
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-12 text-center">
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

  // Handle catalog or category
  if (catalog) {
    // Catalog: Use server-side pagination with catalogId filter
    const sortBy = (searchParams.sort as 'newest' | 'price_asc' | 'price_desc') || 'newest';
    const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
    const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;

    // P0: Use server-side pagination for catalogs
    const productsResponse = await getProducts({
      status: 'published',
      catalogId: catalog.id,
      limit: PRODUCTS_PER_PAGE,
      offset: offset,
      sort: sortBy,
    }, locale) || { items: [], total: 0, page: 1, pageSize: 12 };

    // Safety check: ensure items is an array and total is a number
    const paginatedProducts = productsResponse?.items || [];
    const totalItems = productsResponse?.total || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));

    // For facet counts, we need all products in catalog (before filters)
    // P0: Fetch all catalog products for counts (P1 will provide counts from backend)
    const allCatalogProductsResponse = await getProducts({
      status: 'published',
      catalogId: catalog.id,
      limit: 1000, // Fetch all for counts
      offset: 0,
      sort: 'newest',
    }, locale) || { items: [], total: 0, page: 1, pageSize: 12 };

    // Safety check: ensure items is an array
    const catalogProducts = allCatalogProductsResponse?.items || [];
    const { brandCounts, audienceCounts, formCounts, powerCounts, lossCounts } = calculateFacetCounts(catalogProducts);

    // Get brands that appear in this catalog's products with counts
    const brandMap = new Map<string, BrandResponse>();
    catalogProducts.forEach((p) => {
      if (p.brand) {
        brandMap.set(p.brand.id, p.brand);
      }
    });
    const availableBrands: Array<BrandResponse & { count?: number }> = Array.from(brandMap.values())
      .map((brand) => ({
        ...brand,
        count: brandCounts[brand.slug] || 0,
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0));

    const placeholderImage = `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28">Acoustic</text></svg>`,
    )}`;

    const catalogName = getBilingualText(catalog.name_uz, catalog.name_ru, locale);

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
            <span className="text-brand-primary" suppressHydrationWarning>{catalogName}</span>
          </div>
        </section>

        {/* Header */}
        <section className="bg-brand-accent text-white">
          <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-5">
            <div className="flex-1 space-y-1.5">
              <h1 className="text-xl font-bold md:text-2xl" suppressHydrationWarning>{catalogName}</h1>
              <p className="max-w-4xl text-sm leading-relaxed text-white/90" suppressHydrationWarning>
                {locale === 'ru'
                  ? `Все товары в каталоге "${catalogName}". Используйте фильтры для уточнения поиска.`
                  : `"${catalogName}" katalogidagi barcha mahsulotlar. Qidiruvni aniqlashtirish uchun filtrlardan foydalaning.`}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Filter Sidebar */}
              <aside className="hidden lg:block">
                <CatalogFilters
                  categorySlug={params.slug}
                  locale={locale}
                  brands={availableBrands}
                  selectedBrands={searchParams.brand?.split(',').filter(Boolean) ?? []}
                  selectedAudience={searchParams.audience?.split(',').filter(Boolean) ?? []}
                  selectedForms={searchParams.form?.split(',').filter(Boolean) ?? []}
                  selectedPower={searchParams.power?.split(',').filter(Boolean) ?? []}
                  selectedLoss={searchParams.loss?.split(',').filter(Boolean) ?? []}
                  audienceCounts={audienceCounts}
                  formCounts={formCounts}
                  powerCounts={powerCounts}
                  lossCounts={lossCounts}
                />
              </aside>

              {/* Product Grid */}
              <div className="space-y-6">
                {/* Brand Chips - only show if not a brand page */}
                {!brand && availableBrands.length > 0 && (
                  <CatalogBrandChips 
                    categorySlug={params.slug} 
                    locale={locale} 
                    brands={availableBrands} 
                    selectedBrands={searchParams.brand?.split(',').filter(Boolean) ?? []} 
                  />
                )}

                {/* Sort & Results Count */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? `Найдено товаров: ${totalItems}` : `Topilgan mahsulotlar: ${totalItems}`}
                  </p>
                  <CatalogSort categorySlug={params.slug} locale={locale} currentSort={sortBy} />
                </div>

                {/* Products Grid */}
                {paginatedProducts.length > 0 ? (
                  <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {paginatedProducts.map((product) => {
                        const rawImage = product.galleryUrls?.[0] ?? product.brand?.logo?.url ?? '';
                        const mainImage = rawImage ? normalizeImageUrl(rawImage) : placeholderImage;
                        const priceFormatted = formatPrice(product.price);
                        const availability = product.availabilityStatus ? availabilityMap[product.availabilityStatus] : undefined;
                        const productName = getBilingualText(product.name_uz, product.name_ru, locale);

                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
                          >
                            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-primary/5">
                              <Image
                                src={mainImage}
                                alt={productName}
                                fill
                                className="object-contain transition-transform group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              {product.brand && (
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  {product.brand.name}
                                </p>
                              )}
                              <h3 className="line-clamp-2 font-semibold leading-tight" suppressHydrationWarning>{productName}</h3>
                              {priceFormatted && (
                                <p className="text-lg font-bold text-brand-primary" suppressHydrationWarning>{priceFormatted}</p>
                              )}
                              {availability && (
                                <span className={`inline-block w-fit rounded-full px-2 py-1 text-xs font-medium ${availability.color}`} suppressHydrationWarning>
                                  {locale === 'ru' ? availability.ru : availability.uz}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <CatalogPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      href={`/catalog/${params.slug}`}
                      searchParams={searchParams}
                    />
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground" suppressHydrationWarning>
                      {locale === 'ru' ? 'Товары не найдены' : 'Mahsulotlar topilmadi'}
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

  // Category logic (existing code)
  // P0: Use server-side pagination for categories with direct categoryId
  // Property-based matching (P1) will require backend filter support
  // For now, we check if category uses property-based matching
  const categorySlug = category!.slug;
  const usesPropertyBasedMatching = [
    'category-children',
    'category-seniors',
    'category-ai',
    'category-moderate-loss',
    'category-powerful',
    'category-tinnitus',
    'category-smartphone',
    'category-invisible',
  ].includes(categorySlug);

  // Calculate pagination params from URL
  const sortBy = (searchParams.sort as 'newest' | 'price_asc' | 'price_desc') || 'newest';
  const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
  const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;

  let productsResponse: ProductListResponse;
  let paginatedProducts: ProductResponse[];
  let totalItems: number;
  let totalPages: number;
  let brandCounts: Record<string, number>;
  let audienceCounts: Record<string, number>;
  let formCounts: Record<string, number>;
  let powerCounts: Record<string, number>;
  let lossCounts: Record<string, number>;
  let availableBrands: Array<BrandResponse & { count?: number }>;

  if (usesPropertyBasedMatching) {
    // P0: For property-based categories, still fetch all and filter client-side
    // TODO (P1): Move to backend filters once backend supports property-based matching
    const allProductsResponse = await getProducts({
      status: 'published',
      limit: 1000, // Temporary: fetch many to support client-side filtering
      offset: 0,
      sort: sortBy,
    }, locale) || { items: [], total: 0, page: 1, pageSize: 12 };

    // Filter by property-based matching
    // Safety check: ensure items is an array
    const allProducts = allProductsResponse?.items || [];
    let filteredProducts = allProducts.filter((p) => {
      // Direct category match (products assigned to this category via categoryId)
      if (p.category?.id === category.id) {
        return true;
      }
      
      // Property-based matching for catalog categories
      if (categorySlug === 'category-children' && p.audience?.includes('children')) {
        return true;
      }
      if (categorySlug === 'category-seniors' && p.audience?.includes('elderly')) {
        return true;
      }
      if (categorySlug === 'category-ai' && p.signalProcessing?.toLowerCase().includes('ai')) {
        return true;
      }
      if (categorySlug === 'category-moderate-loss' && p.hearingLossLevels?.includes('moderate')) {
        return true;
      }
      if (categorySlug === 'category-powerful' && (p.hearingLossLevels?.includes('severe') || p.hearingLossLevels?.includes('profound') || p.powerLevel?.toLowerCase().includes('power'))) {
        return true;
      }
      if (categorySlug === 'category-tinnitus' && p.tinnitusSupport === true) {
        return true;
      }
      if (categorySlug === 'category-smartphone' && (p.smartphoneCompatibility?.length > 0 || p.smartphoneCompatibility?.includes('iphone') || p.smartphoneCompatibility?.includes('android'))) {
        return true;
      }
      if (categorySlug === 'category-invisible' && (p.formFactors?.includes('iic') || p.formFactors?.includes('cic') || p.formFactors?.includes('cic-iic'))) {
        return true;
      }
      
      return false;
    });

    // Apply filters (client-side for P0 - will move to backend in P1)
    const selectedBrands = searchParams.brand?.split(',').filter(Boolean) ?? [];
    const selectedAudience = searchParams.audience?.split(',').filter(Boolean) ?? [];
    const selectedForms = searchParams.form?.split(',').filter(Boolean) ?? [];
    const selectedSignal = searchParams.signal?.split(',').filter(Boolean) ?? [];
    const selectedPower = searchParams.power?.split(',').filter(Boolean) ?? [];
    const selectedLoss = searchParams.loss?.split(',').filter(Boolean) ?? [];

    if (selectedBrands.length > 0) {
      filteredProducts = filteredProducts.filter((p) => p.brand && selectedBrands.includes(p.brand.slug));
    }
    if (selectedAudience.length > 0) {
      filteredProducts = filteredProducts.filter((p) => selectedAudience.some((a) => p.audience.includes(a)));
    }
    if (selectedForms.length > 0) {
      filteredProducts = filteredProducts.filter((p) => selectedForms.some((f) => p.formFactors.includes(f)));
    }
    if (selectedSignal.length > 0) {
      filteredProducts = filteredProducts.filter((p) => p.signalProcessing && selectedSignal.includes(p.signalProcessing));
    }
    if (selectedPower.length > 0) {
      filteredProducts = filteredProducts.filter((p) => p.powerLevel && selectedPower.includes(p.powerLevel));
    }
    if (selectedLoss.length > 0) {
      filteredProducts = filteredProducts.filter((p) => selectedLoss.some((l) => p.hearingLossLevels.includes(l)));
    }

    // Client-side pagination (P0 - will move to backend in P1)
    totalItems = filteredProducts.length;
    totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));
    const pageToUse = Math.min(currentPage, totalPages);
    const startIndex = (pageToUse - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    productsResponse = {
      items: paginatedProducts,
      total: totalItems,
      page: pageToUse,
      pageSize: PRODUCTS_PER_PAGE,
    };

    // For property-based categories, use filtered products (before search params filters) for counts
    // We need to get products that match the category property but before URL filter params are applied
    const categoryMatchedProducts = allProducts.filter((p) => {
      // Direct category match
      if (p.category?.id === category.id) {
        return true;
      }
      // Property-based matching
      if (categorySlug === 'category-children' && p.audience?.includes('children')) {
        return true;
      }
      if (categorySlug === 'category-seniors' && p.audience?.includes('elderly')) {
        return true;
      }
      if (categorySlug === 'category-ai' && p.signalProcessing?.toLowerCase().includes('ai')) {
        return true;
      }
      if (categorySlug === 'category-moderate-loss' && p.hearingLossLevels?.includes('moderate')) {
        return true;
      }
      if (categorySlug === 'category-powerful' && (p.hearingLossLevels?.includes('severe') || p.hearingLossLevels?.includes('profound') || p.powerLevel?.toLowerCase().includes('power'))) {
        return true;
      }
      if (categorySlug === 'category-tinnitus' && p.tinnitusSupport === true) {
        return true;
      }
      if (categorySlug === 'category-smartphone' && (p.smartphoneCompatibility?.length > 0 || p.smartphoneCompatibility?.includes('iphone') || p.smartphoneCompatibility?.includes('android'))) {
        return true;
      }
      if (categorySlug === 'category-invisible' && (p.formFactors?.includes('iic') || p.formFactors?.includes('cic') || p.formFactors?.includes('cic-iic'))) {
        return true;
      }
      return false;
    });

    // Calculate counts from category-matched products (before URL filter params)
    const counts = calculateFacetCounts(categoryMatchedProducts);
    brandCounts = counts.brandCounts;
    audienceCounts = counts.audienceCounts;
    formCounts = counts.formCounts;
    powerCounts = counts.powerCounts;
    lossCounts = counts.lossCounts;

    // Get brands that appear in this category's products with counts
    const brandMap = new Map<string, BrandResponse>();
    categoryMatchedProducts.forEach((p) => {
      if (p.brand) {
        brandMap.set(p.brand.id, p.brand);
      }
    });
    availableBrands = Array.from(brandMap.values())
      .map((brand) => ({
        ...brand,
        count: brandCounts[brand.slug] || 0,
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0));
  } else {
    // P0: Use server-side pagination for direct categoryId matches
    productsResponse = await getProducts({
      status: 'published',
      categoryId: category.id,
      limit: PRODUCTS_PER_PAGE,
      offset: offset,
      sort: sortBy,
    }, locale) || { items: [], total: 0, page: 1, pageSize: 12 };

    // Safety check: ensure items is an array and total is a number
    paginatedProducts = productsResponse?.items || [];
    totalItems = productsResponse?.total || 0;
    totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));

    // For facet counts, we need all products in category (before filters)
    // P0: Fetch all category products for counts (P1 will provide counts from backend)
    const allCategoryProductsResponse = await getProducts({
      status: 'published',
      categoryId: category.id,
      limit: 1000, // Fetch all for counts
      offset: 0,
      sort: 'newest',
    }, locale) || { items: [], total: 0, page: 1, pageSize: 12 };

    // Safety check: ensure items is an array
    const categoryProducts = allCategoryProductsResponse?.items || [];
    const counts = calculateFacetCounts(categoryProducts);
    brandCounts = counts.brandCounts;
    audienceCounts = counts.audienceCounts;
    formCounts = counts.formCounts;
    powerCounts = counts.powerCounts;
    lossCounts = counts.lossCounts;

    // Get brands that appear in this category's products with counts
    const brandMap = new Map<string, BrandResponse>();
    categoryProducts.forEach((p) => {
      if (p.brand) {
        brandMap.set(p.brand.id, p.brand);
      }
    });
    availableBrands = Array.from(brandMap.values())
      .map((brand) => ({
        ...brand,
        count: brandCounts[brand.slug] || 0,
      }))
      .sort((a, b) => (b.count || 0) - (a.count || 0));
  }

  const placeholderImage = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28">Acoustic</text></svg>`,
  )}`;

  const categoryName = getBilingualText(category.name_uz, category.name_ru, locale);

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
          <span className="text-brand-primary" suppressHydrationWarning>{categoryName}</span>
        </div>
      </section>

      {/* Header */}
      <section className="bg-brand-accent text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-5">
          <div className="flex-1 space-y-1.5">
            <h1 className="text-xl font-bold md:text-2xl" suppressHydrationWarning>{categoryName}</h1>
            <p className="max-w-4xl text-sm leading-relaxed text-white/90" suppressHydrationWarning>
              {locale === 'ru'
                ? `Все товары в категории "${categoryName}". Используйте фильтры для уточнения поиска.`
                : `"${categoryName}" kategoriyasidagi barcha mahsulotlar. Qidiruvni aniqlashtirish uchun filtrlardan foydalaning.`}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Filter Sidebar */}
            <aside className="hidden lg:block">
              <CatalogFilters
                categorySlug={params.slug}
                locale={locale}
                brands={availableBrands}
                selectedBrands={searchParams.brand?.split(',').filter(Boolean) ?? []}
                selectedAudience={searchParams.audience?.split(',').filter(Boolean) ?? []}
                selectedForms={searchParams.form?.split(',').filter(Boolean) ?? []}
                selectedPower={searchParams.power?.split(',').filter(Boolean) ?? []}
                selectedLoss={searchParams.loss?.split(',').filter(Boolean) ?? []}
                audienceCounts={audienceCounts}
                formCounts={formCounts}
                powerCounts={powerCounts}
                lossCounts={lossCounts}
              />
            </aside>

            {/* Product Grid */}
            <div className="space-y-6">
              {/* Brand Chips */}
              {availableBrands.length > 0 && (
                <CatalogBrandChips 
                  categorySlug={params.slug} 
                  locale={locale} 
                  brands={availableBrands} 
                  selectedBrands={searchParams.brand?.split(',').filter(Boolean) ?? []} 
                />
              )}

              {/* Sort & Results Count */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                  {locale === 'ru' ? `Найдено товаров: ${totalItems}` : `Topilgan mahsulotlar: ${totalItems}`}
                </p>
                <CatalogSort categorySlug={params.slug} locale={locale} currentSort={sortBy} />
              </div>

              {/* Products Grid */}
              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedProducts.map((product) => {
                      const mainImage = product.galleryUrls?.[0] ?? product.brand?.logo?.url ?? placeholderImage;
                      const priceFormatted = formatPrice(product.price);
                      const availability = product.availabilityStatus ? availabilityMap[product.availabilityStatus] : undefined;
                      const productName = getBilingualText(product.name_uz, product.name_ru, locale);

                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
                        >
                          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-primary/5">
                            <Image
                              src={mainImage}
                              alt={productName}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-brand-accent group-hover:text-brand-primary" suppressHydrationWarning>{productName}</h3>
                            {product.brand && <p className="text-xs text-muted-foreground">{product.brand.name}</p>}
                            {priceFormatted && <p className="text-xl font-semibold text-brand-primary">{priceFormatted}</p>}
                            {availability && (
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${availability.color}`} suppressHydrationWarning>
                                {locale === 'ru' ? availability.ru : availability.uz}
                              </span>
                            )}
                          </div>
                          <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary group-hover:text-brand-accent" suppressHydrationWarning>
                            {locale === 'ru' ? 'Подробнее' : 'Batafsil'} →
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  <CatalogPagination
                    categorySlug={params.slug}
                    locale={locale}
                    currentPage={productsResponse?.page || 1}
                    totalPages={totalPages}
                    totalItems={totalItems}
                  />
                </>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-12 text-center">
                  <p className="text-lg font-semibold text-brand-accent">
                    {locale === 'ru' ? 'Товары не найдены' : 'Mahsulotlar topilmadi'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {locale === 'ru'
                      ? 'Попробуйте изменить параметры фильтров или вернитесь в каталог.'
                      : "Filtrlarni o'zgartirib ko'ring yoki katalogga qayting."}
                  </p>
                  <Link
                    href={`/catalog/${params.slug}`}
                    className="mt-4 inline-block rounded-full border border-brand-primary/30 bg-white px-6 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
                  >
                    {locale === 'ru' ? 'Сбросить фильтры' : 'Filtrlarni tozalash'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}