import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCatalogs, getPosts, getBrands } from '@/lib/api-server';
import type { CatalogResponse, PostResponse, BrandResponse } from '@/lib/api';
import { detectLocale } from '@/lib/locale-server';
import PageHeader from '@/components/page-header';

// Force dynamic rendering to ensure locale is always read from cookies
// This prevents Next.js from caching the page with a stale locale
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  };
}) {
  // Handle redirect from old query-based URLs
  if (searchParams.category) {
    redirect(`/catalog/${searchParams.category}`);
  }

  const locale = detectLocale();
  
  // If productType is provided, show products instead of catalogs
  if (searchParams.productType) {
    const { getProducts } = await import('@/lib/api-server');
    const productsResponse = await getProducts({
      status: 'published',
      productType: searchParams.productType,
      limit: 100,
      offset: 0,
      sort: 'newest',
    }, locale) || { items: [], total: 0, page: 1, pageSize: 12 };
    
    // Apply additional filters if needed
    let filteredProducts = productsResponse.items || [];
    
    // Filter by "children" if filter=children
    if (searchParams.filter === 'children') {
      filteredProducts = filteredProducts.filter((p) => 
        p.audience?.includes('children')
      );
    }
    
    // Filter by "wireless" if filter=wireless
    if (searchParams.filter === 'wireless') {
      filteredProducts = filteredProducts.filter((p) => 
        p.smartphoneCompatibility?.length > 0 || 
        p.smartphoneCompatibility?.includes('wireless') ||
        p.smartphoneCompatibility?.includes('bluetooth')
      );
    }
    
    const pageTitle = searchParams.productType === 'hearing-aids' 
      ? (locale === 'ru' ? 'Слуховые аппараты' : 'Eshitish moslamalari')
      : searchParams.productType === 'interacoustics'
      ? 'Interacoustics'
      : (locale === 'ru' ? 'Аксессуары' : 'Aksessuarlar');
    
    return (
      <main className="min-h-screen bg-background">
        <PageHeader
          locale={locale}
          breadcrumbs={[
            { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
            { label: locale === 'ru' ? 'Каталог' : 'Katalog', href: '/catalog' },
            { label: pageTitle },
          ]}
          title={pageTitle}
          description={locale === 'ru'
            ? `Все товары в категории "${pageTitle}". Используйте фильтры для уточнения поиска.`
            : `"${pageTitle}" kategoriyasidagi barcha mahsulotlar. Qidiruvni aniqlashtirish uchun filtrlardan foydalaning.`}
        />

        <section className="bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const productName = locale === 'ru' ? (product.name_ru || '') : (product.name_uz || '');
                  const mainImage = product.galleryUrls?.[0] ?? product.brand?.logo?.url ?? '';
                  const priceFormatted = product.price 
                    ? `${new Intl.NumberFormat('uz-UZ').format(Number(product.price))} so'm`
                    : null;
                  
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
                    >
                      {/* Rasm va matn bir xil qatorda */}
                      <div className="flex gap-4">
                        {/* Rasm - chapda, to'liq o'lchamda */}
                        <div className="relative aspect-square w-40 flex-shrink-0 overflow-hidden rounded-xl bg-brand-primary/5 sm:w-48">
                          {mainImage ? (
                            <Image
                              src={mainImage}
                              alt={productName}
                              fill
                              sizes="(max-width: 640px) 160px, 192px"
                              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                              suppressHydrationWarning
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-brand-primary">
                              <span className="text-white text-xs font-bold">Acoustic</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Matn - rasm yonida */}
                        <div className="flex flex-1 flex-col gap-2">
                          <h3 className="text-lg font-semibold text-brand-accent group-hover:text-brand-primary" suppressHydrationWarning>
                            {productName}
                          </h3>
                          {product.brand && <p className="text-xs text-muted-foreground">{product.brand.name}</p>}
                          {priceFormatted && <p className="text-xl font-semibold text-brand-primary" suppressHydrationWarning>{priceFormatted}</p>}
                        </div>
                      </div>
                      
                      {/* Matn - rasm tagida davom etadi */}
                      <div className="flex flex-col gap-2">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary group-hover:text-brand-accent" suppressHydrationWarning>
                          {locale === 'ru' ? 'Подробнее' : 'Batafsil'} →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
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
        </section>
      </main>
    );
  }
  
  // Fetch catalogs, posts, and brands from backend
  const [catalogsData, postsData, brandsData] = await Promise.all([
    getCatalogs(locale),
    getPosts(locale, true),
    getBrands(locale),
  ]);

  // Filter brands to show only Oticon, ReSound, Signia
  const mainBrands = brandsData?.filter((brand) => {
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
  
  // Sort brands: Oticon, ReSound, Signia
  const sortedBrands = [...mainBrands].sort((a, b) => {
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();
    const aSlug = (a.slug || '').toLowerCase();
    const bSlug = (b.slug || '').toLowerCase();
    const order = ['oticon', 'resound', 'signia'];
    const aIndex = order.findIndex(o => aName.includes(o) || aSlug.includes(o));
    const bIndex = order.findIndex(o => bName.includes(o) || bSlug.includes(o));
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  // Define other sections (accessories, earmolds, etc.)
  const otherSections = [
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
      const baseUrl = API_BASE_URL.replace('/api', '');
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
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: locale === 'ru' ? 'Каталог' : 'Katalog' },
        ]}
        title={locale === 'ru' ? 'Решения для вашего образа жизни' : 'Turmush tarziga mos eshitish yechimlari'}
        description={locale === 'ru'
          ? 'Мы подберём аппарат под ваши привычки, уровень активности и бюджет. Выберите один из разделов, затем просмотрите подходящие товары в каталоге.'
          : "Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz. Bo'limlardan birini tanlang, keyin esa katalog ichida mos mahsulotlarni ko'ring."}
      />

      {/* Main Content with Sidebar */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - 3 columns on large screens */}
            <div className="lg:col-span-3">
              {catalogItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {catalogItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="group flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-primary/50 hover:shadow-sm"
                    >
                      {/* Rasm va nom bir xil qatorda */}
                      <div className="flex gap-3">
                        {/* Rasm - chapda, avvalgi o'lchamda */}
                        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-primary/10">
                          {item.image ? (
                            <Image 
                              src={item.image} 
                              alt={item.title} 
                              fill 
                              sizes="112px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              suppressHydrationWarning
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-brand-primary">
                              <span className="text-white text-xs font-bold">Acoustic</span>
                            </div>
                          )}
                        </div>
                        {/* Nom - rasm yonida */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-brand-accent leading-tight group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      {/* Tavsif - rasm tagida */}
                      {item.description && (
                        <p className="text-sm text-muted-foreground leading-snug line-clamp-2" suppressHydrationWarning>
                          {item.description}
                        </p>
                      )}
                      {/* Batafsil link */}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary group-hover:text-brand-accent transition-all" suppressHydrationWarning>
                        {locale === 'ru' ? 'Подробнее' : 'Batafsil'} ↗
                      </span>
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
            <aside className="lg:col-span-1 space-y-8">
              {/* Other Sections */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4" suppressHydrationWarning>
                  {locale === 'ru' ? 'Другие разделы' : 'Boshqa bo\'limlar'}
                </h3>
                <nav className="space-y-2">
                  {otherSections.map((section) => {
                    const title = locale === 'ru' ? section.title_ru : section.title_uz;
                    return (
                      <Link
                        key={section.id}
                        href={section.link}
                        className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-xl">{section.icon}</span>
                        <span className="text-sm font-medium text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                          {title}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Brands Section - Only Oticon, ReSound, Signia */}
              {sortedBrands.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-foreground mb-4" suppressHydrationWarning>
                    {locale === 'ru' ? 'Бренды' : 'Brendlar'}
                  </h3>
                  <div className="space-y-4">
                    {sortedBrands.map((brand) => {
                      const brandName = brand.name || '';
                      const brandSlug = brand.slug || '';
                      const brandLogo = brand.logo?.url || '';
                      let logoUrl = brandLogo;
                      if (logoUrl && logoUrl.startsWith('/') && !logoUrl.startsWith('//')) {
                        const baseUrl = API_BASE_URL.replace('/api', '');
                        logoUrl = `${baseUrl}${logoUrl}`;
                      }
                      const brandLink = brandSlug ? `/catalog/${brandSlug}` : '#';
                      return (
                        <Link
                          key={brand.id}
                          href={brandLink}
                          className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-brand-primary/50 transition-colors bg-gray-50 group"
                        >
                          {logoUrl ? (
                            <Image
                              src={logoUrl}
                              alt={brandName}
                              width={120}
                              height={40}
                              className="object-contain max-h-10"
                              suppressHydrationWarning
                            />
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                              {brandName}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
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