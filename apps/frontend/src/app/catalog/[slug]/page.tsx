import Image from 'next/image';
import Link from 'next/link';
// Removed notFound import - we never crash, always show UI
import type { Metadata } from 'next';
import { getProducts, type ProductResponse, type BrandResponse } from '@/lib/api';
import { getCategoryBySlug, type ProductCategoryResponse } from '@/lib/api-server';
import CatalogFilters from '@/components/catalog-filters';
import CatalogSort from '@/components/catalog-sort';
import CatalogBrandChips from '@/components/catalog-brand-chips';
import CatalogPagination from '@/components/catalog-pagination';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';

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
  const category = await getCategoryBySlug(params.slug, locale);
  if (!category) {
    return {
      title: locale === 'ru' ? 'Категория не найдена — Acoustic.uz' : 'Kategoriya topilmadi — Acoustic.uz',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
  const categoryUrl = `${baseUrl}/catalog/${params.slug}`;
  const categoryName = getBilingualText(category.name_uz, category.name_ru, locale);

  return {
    title: `${categoryName} — ${locale === 'ru' ? 'Каталог' : 'Katalog'} — Acoustic.uz`,
    description: locale === 'ru'
      ? `Слуховые аппараты и решения в категории ${categoryName}.`
      : `${categoryName} kategoriyasidagi eshitish apparatlari va yechimlari.`,
    alternates: {
      canonical: categoryUrl,
      languages: {
        uz: categoryUrl,
        ru: categoryUrl,
        'x-default': categoryUrl,
      },
    },
  };
}

export default async function CatalogCategoryPage({ params, searchParams }: CatalogCategoryPageProps) {
  const locale = detectLocale();
  
  // Handle errors gracefully - getCategoryBySlug returns null if backend is down or category not found
  // The api-server wrapper ensures this never throws, so we can safely await it
  const category = await getCategoryBySlug(params.slug, locale);

  // If category is null, show fallback UI (backend down or category not found)
  // Never crash - always show UI structure
  if (!category) {
    // Show empty state with same UI structure
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              {locale === 'ru' ? 'Категория не найдена' : 'Kategoriya topilmadi'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ru' 
                ? 'К сожалению, мы не можем загрузить информацию о категории в данный момент.'
                : 'Afsuski, kategoriya haqida ma\'lumotni hozircha yuklay olmaymiz.'}
            </p>
            <Link href="/catalog" className="mt-6 inline-block text-brand-primary hover:underline">
              {locale === 'ru' ? '← Вернуться в каталог' : '← Katalogga qaytish'}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Fetch all data with locale - returns empty array if backend is down
  const allProducts = await getProducts({ status: 'published' }, locale) || [];

  // Filter products by category
  let filteredProducts = allProducts.filter((p) => p.category?.id === category.id);

  // Apply filters (multiple values supported via comma-separated query params)
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

  // Sort products
  const sortBy = searchParams.sort ?? 'newest';
  if (sortBy === 'price_asc') {
    filteredProducts.sort((a, b) => {
      const priceA = a.price ? Number(a.price) : Infinity;
      const priceB = b.price ? Number(b.price) : Infinity;
      return priceA - priceB;
    });
  } else if (sortBy === 'price_desc') {
    filteredProducts.sort((a, b) => {
      const priceA = a.price ? Number(a.price) : Infinity;
      const priceB = b.price ? Number(b.price) : Infinity;
      return priceB - priceA;
    });
  }
  // newest is default (already sorted by createdAt desc from API)

  // Calculate total items and pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, parseInt(searchParams.page || '1', 10)), totalPages);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Get all products in category (before filters) for facet counts
  const categoryProducts = allProducts.filter((p) => p.category?.id === category.id);
  const { brandCounts, audienceCounts, formCounts, powerCounts, lossCounts } = calculateFacetCounts(categoryProducts);

  // Get brands that appear in this category's products with counts
  const brandMap = new Map<string, BrandResponse>();
  categoryProducts.forEach((p) => {
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

  const categoryName = getBilingualText(category.name_uz, category.name_ru, locale);

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:px-6">
          <Link href="/" className="hover:text-brand-primary">
            {locale === 'ru' ? 'Главная' : 'Bosh sahifa'}
          </Link>
          <span className="mx-2">›</span>
          <Link href="/catalog" className="hover:text-brand-primary">
            {locale === 'ru' ? 'Каталог' : 'Katalog'}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-brand-primary">{categoryName}</span>
        </div>
      </section>

      {/* Header */}
      <section className="bg-brand-accent text-white">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:px-6">
          <h1 className="text-3xl font-bold md:text-4xl">{categoryName}</h1>
          <p className="max-w-4xl text-base leading-relaxed text-white/90">
            {locale === 'ru'
              ? `Все товары в категории "${categoryName}". Используйте фильтры для уточнения поиска.`
              : `"${categoryName}" kategoriyasidagi barcha mahsulotlar. Qidiruvni aniqlashtirish uchun filtrlardan foydalaning.`}
          </p>
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
                selectedBrands={selectedBrands}
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
              {/* Brand Chips */}
              {availableBrands.length > 0 && (
                <CatalogBrandChips categorySlug={params.slug} locale={locale} brands={availableBrands} selectedBrands={selectedBrands} />
              )}

              {/* Sort & Results Count */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
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
                            <h3 className="text-lg font-semibold text-brand-accent group-hover:text-brand-primary">{productName}</h3>
                            {product.brand && <p className="text-xs text-muted-foreground">{product.brand.name}</p>}
                            {priceFormatted && <p className="text-xl font-semibold text-brand-primary">{priceFormatted}</p>}
                            {availability && (
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${availability.color}`}>
                                {locale === 'ru' ? availability.ru : availability.uz}
                              </span>
                            )}
                          </div>
                          <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary group-hover:text-brand-accent">
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