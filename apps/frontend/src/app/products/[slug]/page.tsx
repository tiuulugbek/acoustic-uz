import Image from 'next/image';
import Script from 'next/script';
// Removed notFound import - we never crash, always show UI
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import {
  type ProductResponse,
  type RelatedProductSummary,
  type UsefulArticleSummary,
} from '@/lib/api';
import { getProductBySlug } from '@/lib/api-server';
import ProductTabs from '@/components/product-tabs';
import { detectLocale } from '@/lib/locale-server';
import { getBilingualText } from '@/lib/locale';

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28">Acoustic</text></svg>`;
const placeholderImage = `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;

const availabilityMap: Record<string, { uz: string; ru: string; schema: string; color: string }> = {
  'in-stock': {
    uz: 'Sotuvda',
    ru: 'В наличии',
    schema: 'https://schema.org/InStock',
    color: 'text-emerald-600 bg-emerald-50',
  },
  preorder: {
    uz: 'Buyurtmaga',
    ru: 'Под заказ',
    schema: 'https://schema.org/PreOrder',
    color: 'text-amber-600 bg-amber-50',
  },
  'out-of-stock': {
    uz: 'Tugagan',
    ru: 'Нет в наличии',
    schema: 'https://schema.org/OutOfStock',
    color: 'text-rose-600 bg-rose-50',
  },
};

const dictionary = {
  audience: {
    children: { uz: 'Bolalar', ru: 'Детям' },
    adults: { uz: 'Kattalar', ru: 'Взрослым' },
    elderly: { uz: 'Keksalar', ru: 'Пожилым людям' },
  },
  formFactors: {
    bte: { uz: 'BTE (quloq orqasida)', ru: 'BTE (за ухом)' },
    'mini-bte': { uz: 'Mini BTE', ru: 'Mini BTE' },
    ite: { uz: 'ITE (quloq ichida)', ru: 'ITE (в ухе)' },
    itc: { uz: 'ITC (kanal ichida)', ru: 'ITC (в канале)' },
    'cic-iic': { uz: 'CIC / IIC (ko‘rinmas)', ru: 'CIC / IIC (невидимые)' },
    ric: { uz: 'RIC', ru: 'RIC' },
  },
  smartphone: {
    iphone: { uz: 'iPhone bilan mos', ru: 'Совместим с iPhone' },
    android: { uz: 'Android / Bluetooth', ru: 'Android / Bluetooth' },
    remote: { uz: 'Masofadan boshqaruv', ru: 'Дистанционное управление' },
  },
  hearingLoss: {
    mild: { uz: 'I daraja (yengil)', ru: 'I степень (лёгкая)' },
    moderate: { uz: 'II daraja (o‘rta)', ru: 'II степень (средняя)' },
    severe: { uz: 'III daraja (og‘ir)', ru: 'III степень (тяжёлая)' },
    profound: { uz: 'IV daraja (chuqur)', ru: 'IV степень (глубокая)' },
  },
  payment: {
    'cash-card': { uz: 'Naqd / karta', ru: 'Наличные / карта' },
    'installment-0': { uz: '0% muddatli to‘lov', ru: 'Рассрочка 0%' },
    'installment-6': { uz: '6 oylik muddatli to‘lov', ru: 'Рассрочка на 6 мес.' },
  },
};

interface ProductPageProps {
  params: {
    slug: string;
  };
}


function formatPrice(price?: string | null) {
  if (!price) return null;
  const numeric = Number(price);
  if (Number.isNaN(numeric)) return price;
  return `${new Intl.NumberFormat('uz-UZ').format(numeric)} so‘m`;
}

function combineBilingual(uz: string[] = [], ru: string[] = []) {
  const max = Math.max(uz.length, ru.length);
  return Array.from({ length: max }).map((_, index) => {
    const uzText = uz[index] ?? '';
    const ruText = ru[index] ?? '';
    if (!uzText && !ruText) {
      return null;
    }
    return { uz: uzText, ru: ruText };
  }).filter(Boolean) as { uz: string; ru: string }[];
}

function translateList(
  values: string[] = [],
  map: Record<string, { uz: string; ru: string }>,
  locale: 'uz' | 'ru' = 'uz',
) {
  return values.map((value) => map[value]?.[locale] ?? map[value]?.uz ?? value);
}

function buildJsonLd(product: ProductResponse, mainImage: string) {
  const availability = product.availabilityStatus ? availabilityMap[product.availabilityStatus] : undefined;
  const price = product.price ? Number(product.price) : undefined;
  const offers = price
    ? {
        '@type': 'Offer',
        priceCurrency: 'UZS',
        price,
        availability: availability?.schema ?? 'https://schema.org/InStock',
      }
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name_uz,
    description: product.description_uz ?? product.description_ru ?? undefined,
    sku: product.slug,
    image: product.galleryUrls?.length ? product.galleryUrls : [mainImage],
    brand: {
      '@type': 'Brand',
      name: product.brand?.name ?? 'Acoustic',
    },
    offers,
    category: product.category?.name_uz ?? undefined,
    url: `https://acoustic.uz/products/${product.slug}`,
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const locale = detectLocale();
    const product = await getProductBySlug(params.slug, locale);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';
    const productUrl = `${baseUrl}/products/${params.slug}`;
    const title = getBilingualText(product.name_uz, product.name_ru, locale);
    const description = getBilingualText(product.description_uz ?? product.intro_uz, product.description_ru ?? product.intro_ru, locale);
    
    return {
      title: `${title} — Acoustic.uz`,
      description: description || undefined,
      alternates: {
        canonical: productUrl,
        languages: {
          uz: productUrl,
          ru: productUrl,
          'x-default': productUrl,
        },
      },
      openGraph: {
        title: `${title} — Acoustic.uz`,
        description: description || undefined,
        url: productUrl,
        images: product.galleryUrls?.length ? product.galleryUrls.map((url) => ({ url })) : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'Mahsulot topilmadi — Acoustic.uz',
    };
  }
}

function RelatedProducts({ products }: { products: RelatedProductSummary[] }) {
  if (!products.length) return null;

  return (
    <section className="border-t border-border/60 bg-white py-10">
      <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
        <h2 className="text-2xl font-semibold text-brand-accent">O‘xshash mahsulotlar</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((item) => {
            const image = item.galleryUrls?.[0] ?? placeholderImage;
            return (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/40"
              >
                <div className="relative h-44 w-full bg-brand-primary/5">
                  <Image
                    src={image}
                    alt={item.name_uz}
                    fill
                    className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-sm font-semibold text-brand-accent group-hover:text-brand-primary">{item.name_uz}</h3>
                  {item.name_ru ? (
                    <p className="text-xs text-muted-foreground">{item.name_ru}</p>
                  ) : null}
                  {item.price ? (
                    <p className="mt-auto text-sm font-semibold text-brand-primary">{formatPrice(item.price)}</p>
                  ) : (
                    <p className="mt-auto text-xs text-muted-foreground">Narx bo‘yicha murojaat qiling</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function UsefulArticles({ articles }: { articles: UsefulArticleSummary[] }) {
  if (!articles.length) return null;
  return (
    <div className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-accent">Foydali maqolalar</h3>
      <ul className="mt-4 space-y-3 text-sm">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/posts/${article.slug}`} className="group block">
              <span className="font-medium text-brand-primary group-hover:underline">
                {article.title_uz}
              </span>
              {article.title_ru ? (
                <p className="text-xs text-muted-foreground">{article.title_ru}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const locale = detectLocale();
  
  // Handle errors gracefully - getProductBySlug returns null if backend is down or product not found
  // The api-server wrapper ensures this never throws, so we can safely await it
  const product = await getProductBySlug(params.slug, locale);

  // If product is null, show fallback UI (backend down or product not found)
  // Never crash - always show UI structure
  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              {locale === 'ru' ? 'Продукт не найден' : 'Mahsulot topilmadi'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'ru' 
                ? 'К сожалению, мы не можем загрузить информацию о продукте в данный момент.'
                : 'Afsuski, mahsulot haqida ma\'lumotni hozircha yuklay olmaymiz.'}
            </p>
            <Link href="/catalog" className="mt-6 inline-block text-brand-primary hover:underline">
              {locale === 'ru' ? '← Вернуться в каталог' : '← Katalogga qaytish'}
            </Link>
          </div>
        </div>
      </main>
    );
  }
  const priceFormatted = formatPrice(product.price);
  const availability = product.availabilityStatus ? availabilityMap[product.availabilityStatus] : undefined;
  const mainImage = product.galleryUrls?.[0] ?? product.brand?.logo?.url ?? placeholderImage;
  const gallery = product.galleryUrls?.length ? product.galleryUrls : product.brand?.logo?.url ? [product.brand.logo.url] : [];
  const features = combineBilingual(product.features_uz, product.features_ru);
  const benefits = combineBilingual(product.benefits_uz, product.benefits_ru);
  const isRu = locale === 'ru';

  const tabTitles = {
    description: isRu ? 'Описание' : 'Tavsif',
    tech: isRu ? 'Технологии' : 'Texnologiyalar',
    fitting: isRu ? 'Диапазон настройки' : 'Sozlash diapazoni',
  };

  const productTabs = [
    {
      key: 'description',
      title: tabTitles.description,
      primary: isRu
        ? product.description_ru ?? product.description_uz ?? null
        : product.description_uz ?? product.description_ru ?? null,
      secondary: isRu ? product.description_uz ?? null : product.description_ru ?? null,
    },
    {
      key: 'tech',
      title: tabTitles.tech,
      primary: isRu
        ? product.tech_ru ?? product.specsText ?? null
        : product.tech_uz ?? product.specsText ?? null,
      secondary: isRu ? product.tech_uz ?? null : product.tech_ru ?? null,
    },
    {
      key: 'fitting',
      title: tabTitles.fitting,
      primary: isRu ? product.fittingRange_ru ?? null : product.fittingRange_uz ?? null,
      secondary: isRu ? product.fittingRange_uz ?? null : product.fittingRange_ru ?? null,
    },
  ];
  const paymentOptions = translateList(product.paymentOptions, dictionary.payment, locale);
  const audienceList = translateList(product.audience, dictionary.audience, locale);
  const formFactorList = translateList(product.formFactors, dictionary.formFactors, locale);
  const smartphoneList = translateList(product.smartphoneCompatibility, dictionary.smartphone, locale);
  const hearingLossList = translateList(product.hearingLossLevels, dictionary.hearingLoss, locale);

  const heroFeatureItems = (
    features.length > 0
      ? features
      : benefits.length > 0
        ? benefits
        : combineBilingual(product.features_uz, product.features_ru)
  ).slice(0, 3);

  const heroFeatureTexts = heroFeatureItems
    .map((item) => (isRu ? item.ru ?? item.uz : item.uz ?? item.ru))
    .filter((text): text is string => Boolean(text && text.trim().length));

  const availabilityLabel =
    availability && (isRu ? availability.ru : availability.uz)
      ? isRu
        ? availability.ru
        : availability.uz
      : isRu
        ? 'Уточните наличие'
        : 'Holatini aniqlashtiring';

  const priceLabel = priceFormatted ?? (isRu ? 'По запросу' : 'So‘rov orqali');
  const paymentLabel = paymentOptions.length
    ? paymentOptions.join(', ')
    : isRu
      ? 'Уточните условия оплаты'
      : 'To‘lov shartlarini aniqlashtiring';

  const introText = isRu
    ? product.intro_ru ?? product.intro_uz ?? null
    : product.intro_uz ?? product.intro_ru ?? null;

  const basicInfo = [
    {
      label: isRu ? 'Производитель' : 'Ishlab chiqaruvchi',
      value: product.brand?.name ?? (isRu ? 'Не указано' : 'Ko‘rsatilmagan'),
    },
    {
      label: isRu ? 'Наличие' : 'Holat',
      value: availabilityLabel,
    },
    {
      label: isRu ? 'Цена' : 'Narx',
      value: priceLabel,
    },
    {
      label: isRu ? 'Способ оплаты' : 'To‘lov usullari',
      value: paymentLabel,
    },
  ];

  const sidebarCategories = [
    {
      href: '/catalog',
      label: isRu ? 'Каталог слуховых аппаратов' : 'Katalog eshitish apparatlari',
    },
    {
      href: '/catalog?category=batareyalar',
      label: isRu ? 'Батарейки для слуховых аппаратов' : 'Batareyalar',
    },
    {
      href: '/catalog?category=aksessuarlar',
      label: isRu ? 'Аксессуары' : 'Aksessuarlar',
    },
    {
      href: '/catalog?category=simsiz-aksessuarlar',
      label: isRu ? 'Беспроводные аксессуары' : 'Simsiz aksessuarlar',
    },
  ];

  const brandLinks = [
    {
      name: 'Oticon',
      slug: 'oticon',
      bg: 'bg-[#f8f5f9]',
      text: 'text-[#5d1d63]',
    },
    {
      name: 'ReSound',
      slug: 'resound',
      bg: 'bg-[#fef4f4]',
      text: 'text-[#a40024]',
    },
    {
      name: 'Signia',
      slug: 'signia',
      bg: 'bg-[#f7f7f7]',
      text: 'text-[#323232]',
    },
  ];
  const productJsonLd = buildJsonLd(product, mainImage);

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Link href="/" className="hover:text-brand-primary">
              Bosh sahifa
            </Link>
            <span>›</span>
            <Link href="/catalog" className="hover:text-brand-primary">
              Katalog
            </Link>
            <span>›</span>
            <span className="text-brand-primary">{product.name_uz}</span>
          </nav>
          <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-accent md:text-4xl">{product.name_uz}</h1>
              {product.name_ru ? (
                <p className="text-sm font-medium text-brand-accent/70">{product.name_ru}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-2 text-right md:items-end">
              {priceFormatted ? (
                <span className="text-2xl font-semibold text-brand-primary">{priceFormatted}</span>
              ) : (
                <span className="text-sm font-semibold text-brand-primary/80">Narx bo‘yicha murojaat qiling</span>
              )}
              {availability ? (
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${availability.color}`}>
                  {availability.uz}
                  <span className="text-[10px] text-black/40">/ {availability.ru}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
          <div className="space-y-10">
            <section className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="relative h-64 overflow-hidden rounded-2xl bg-brand-primary/5 md:h-72 lg:h-80">
                  <Image src={mainImage} alt={product.name_uz} fill className="object-contain p-8" priority />
                </div>
                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
                      {isRu ? 'Основная информация' : 'Asosiy ma’lumotlar'}
                    </p>
                    <dl className="grid gap-3 text-sm text-brand-accent/80">
                      {basicInfo.map((item) => (
                        <div key={item.label} className="grid gap-1 sm:grid-cols-[160px,1fr]">
                          <dt className="font-semibold text-brand-accent">{item.label}</dt>
                          <dd>{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {heroFeatureTexts.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
                        {isRu ? 'Ключевые преимущества' : 'Asosiy afzalliklar'}
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-brand-accent/80">
                        {heroFeatureTexts.map((text, index) => (
                          <li key={`hero-feature-${index}`} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-primary" />
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/appointment"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-brand-primary/90"
                    >
                      {isRu ? 'Записаться на подбор' : 'Qabulga yozilish'}
                    </Link>
                    <Link
                      href="tel:+998712021441"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-primary/40 px-5 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
                    >
                      <Phone size={16} /> 1385
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {introText ? (
              <section className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-brand-accent">
                  {isRu ? 'Краткое описание' : 'Qisqacha tavsif'}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-brand-accent/80">{introText}</p>
              </section>
            ) : null}

            {gallery.length > 1 ? (
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {gallery.slice(1, 9).map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className="relative h-24 w-full overflow-hidden rounded-2xl border border-border/40 bg-brand-primary/5"
                  >
                    <Image src={imageUrl} alt={`${product.name_uz} galereya`} fill className="object-contain p-3" />
                  </div>
                ))}
              </section>
            ) : null}

            <section className="space-y-6 rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
              {features.length ? (
                <div>
                  <h2 className="text-lg font-semibold text-brand-accent">
                    {isRu ? 'Преимущества модели' : 'Model afzalliklari'}
                  </h2>
                  <ul className="mt-3 space-y-3">
                    {features.map((item, index) => {
                      const text = isRu ? item.ru ?? item.uz : item.uz ?? item.ru;
                      if (!text) return null;
                      return (
                        <li
                          key={`feature-${index}`}
                          className="rounded-2xl border border-brand-accent/10 bg-brand-accent/5 p-4 text-sm text-brand-accent"
                        >
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {benefits.length ? (
                <div>
                  <h2 className="text-lg font-semibold text-brand-accent">
                    {isRu ? 'При покупке в Acoustic' : 'Acoustic markazidagi afzalliklar'}
                  </h2>
                  <ul className="mt-3 space-y-3">
                    {benefits.map((item, index) => {
                      const text = isRu ? item.ru ?? item.uz : item.uz ?? item.ru;
                      if (!text) return null;
                      return (
                        <li
                          key={`benefit-${index}`}
                          className="flex gap-3 rounded-2xl border border-brand-primary/10 bg-brand-primary/5 p-4 text-sm text-brand-accent"
                        >
                          <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                          <span>{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {product.regulatoryNote_uz || product.regulatoryNote_ru ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
                  <p>{isRu ? product.regulatoryNote_ru ?? product.regulatoryNote_uz : product.regulatoryNote_uz ?? product.regulatoryNote_ru}</p>
                </div>
              ) : null}
            </section>

            <ProductTabs tabs={productTabs} />

            <RelatedProducts products={product.relatedProducts ?? []} />

            <UsefulArticles articles={product.usefulArticles ?? []} />
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
                {isRu ? 'Разделы каталога' : 'Katalog bo‘limlari'}
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-brand-accent/80">
                {sidebarCategories.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2 transition hover:border-brand-primary/30 hover:text-brand-primary"
                    >
                      <span>{item.label}</span>
                      <ArrowRight size={14} className="text-brand-primary/70" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
                {isRu ? 'Популярные бренды' : 'Mashhur brendlar'}
              </h2>
              <p className="mt-2 text-xs text-muted-foreground">
                {isRu
                  ? 'Выберите бренд, чтобы посмотреть все модели.'
                  : 'Brendni tanlab, barcha modellardan tanlang.'}
              </p>
              <div className="mt-4 space-y-3">
                {brandLinks.map((brand) => {
                  const isActive = product.brand?.slug === brand.slug;
                  return (
                    <Link
                      key={brand.slug}
                      href={`/catalog?brand=${encodeURIComponent(brand.slug)}`}
                      className={`flex h-16 items-center justify-center rounded-2xl border border-border/50 bg-white text-base font-semibold transition hover:border-brand-primary/40 hover:shadow ${
                        isActive ? 'border-brand-primary/60 shadow-sm' : ''
                      } ${brand.bg} ${brand.text}`}
                    >
                      <span className="uppercase tracking-wide">{brand.name}</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-border/60 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">
                {isRu ? 'Информация' : 'Ma’lumot'}
              </p>
              <div className="mt-3 space-y-1 text-sm text-brand-accent/80">
                {audienceList.length ? (
                  <p>
                    <span className="font-semibold">{isRu ? 'Подходит' : 'Kimlar uchun'}:</span> {audienceList.join(', ')}
                  </p>
                ) : null}
                {formFactorList.length ? (
                  <p>
                    <span className="font-semibold">{isRu ? 'Тип корпуса' : 'Korpus turi'}:</span> {formFactorList.join(', ')}
                  </p>
                ) : null}
                {hearingLossList.length ? (
                  <p>
                    <span className="font-semibold">{isRu ? 'Степень снижения слуха' : 'Eshitish darajalari'}:</span>{' '}
                    {hearingLossList.join(', ')}
                  </p>
                ) : null}
                {smartphoneList.length ? (
                  <p>
                    <span className="font-semibold">{isRu ? 'Совместимость' : 'Mosligi'}:</span> {smartphoneList.join(', ')}
                  </p>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <Script
        id="product-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </main>
  );
}
