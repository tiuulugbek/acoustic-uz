'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Play,
  Phone,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBilingualText, DEFAULT_LOCALE, type Locale } from '@/lib/locale';
import { getLocaleFromCookie } from '@/lib/locale-client';
import {
  getPublicBanners,
  getPublicServices,
  getShowcase,
  getHomepageHearingAidItems,
  getHomepageNews,
  getPublicFaq,
  getHomepageJourney,
  getProductCategories,
  BannerResponse,
  ServiceResponse,
  ProductResponse,
  ShowcaseResponse,
  HearingAidItemResponse,
  HomepageNewsItemResponse,
  FaqResponse,
  HomepageJourneyStepResponse,
  ProductCategoryResponse,
} from '@/lib/api';

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  link: string;
};

type FallbackInteracousticsProduct = {
  name_uz: string;
  name_ru: string;
  description_uz?: string;
  description_ru?: string;
  image: string;
  brand: string;
};

const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#F07E22"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24">Acoustic</text></svg>`;
const placeholderImage = `data:image/svg+xml,${encodeURIComponent(placeholderSvg)}`;

const getFallbackSlides = (locale: Locale): HeroSlide[] => [
  {
    id: 'slide-1',
    title: locale === 'ru' ? 'Восстановление слуха' : 'Eshitishni tiklash',
    subtitle: locale === 'ru' ? 'Профессиональная диагностика и подбор слуховых аппаратов' : 'Professional diagnostika va eshitish apparatlari tanlash',
    cta: locale === 'ru' ? 'Записаться на прием' : 'Tekshiruvga yozilish',
    image: placeholderImage,
    link: '#booking',
  },
];

const fallbackServices = [
  {
    title_uz: 'Diagnostic Audiologiya',
    title_ru: 'Диагностическая аудиология',
    excerpt_uz: "Audiometriya, OAE va tympanometriya bo'yicha to'liq tekshiruvlar.",
    excerpt_ru: 'Полная диагностика слуха: аудиометрия, ОАЭ, тимпанометрия.',
    slug: 'diagnostika',
    image: placeholderImage,
  },
  {
    title_uz: 'Quloq apparatlarini tanlash',
    title_ru: 'Подбор слуховых аппаратов',
    excerpt_uz: 'Individual sozlash, moslashtirish va servis xizmatlari.',
    excerpt_ru: 'Индивидуальная настройка и сервис.',
    slug: 'apparatlar',
    image: placeholderImage,
  },
  {
    title_uz: 'Bolalar diagnostikasi',
    title_ru: 'Диагностика для детей',
    excerpt_uz: 'Har bir yoshdagi bolalar uchun audiologik tekshiruvlar.',
    excerpt_ru: 'Аудиологические обследования для детей любого возраста.',
    slug: 'bolalar-diagnostikasi',
    image: placeholderImage,
  },
  {
    title_uz: 'Koxlear implantlar',
    title_ru: 'Кохлеарные импланты',
    excerpt_uz: 'Koxlear implantatsiya va reabilitatsiya xizmatlari.',
    excerpt_ru: 'Кохлеарная имплантация и реабилитация.',
    slug: 'koxlear-implantlar',
    image: placeholderImage,
  },
];

const fallbackHearingItems: Array<
  Pick<HearingAidItemResponse, 'title_uz' | 'title_ru' | 'description_uz' | 'description_ru' | 'id'> & {
    image?: { url: string } | null;
    link?: string | null;
  }
> = [
  {
    id: 'hearing-1',
    title_uz: "Ko'rinmas quloq apparatlari",
    title_ru: 'Незаметные заушные',
    description_uz: "Quloq orqasida qulay joylashadigan, deyarli ko'rinmaydigan modelllar.",
    description_ru: 'Простые в уходе модели, которые легко скрываются за ухом.',
    link: '/catalog/category-invisible',
  },
  {
    id: 'hearing-2',
    title_uz: 'Keksalar uchun',
    title_ru: 'Для пожилых людей',
    description_uz: 'Qulay boshqaruvli, ishonchli va bardoshli eshitish yechimlari.',
    description_ru: 'Надёжные решения для пожилых клиентов.',
    link: '/catalog/category-seniors',
  },
  {
    id: 'hearing-3',
    title_uz: 'Bolalar uchun',
    title_ru: 'Для детей и подростков',
    description_uz: 'Bolalarning nutq rivojlanishini qo‘llab-quvvatlovchi modelllar.',
    description_ru: 'Решения, помогающие ребёнку развивать речь.',
    link: '/catalog/category-children',
  },
  {
    id: 'hearing-4',
    title_uz: 'AI texnologiyalari',
    title_ru: 'С AI-технологиями',
    description_uz: 'Sun\'iy intellekt asosidagi aqlli eshitish yechimlari.',
    description_ru: 'Умные технологии на базе искусственного интеллекта.',
    link: '/catalog/category-ai',
  },
];

const fallbackInteracoustics: FallbackInteracousticsProduct[] = [
  {
    name_uz: 'Interacoustics Titan',
    name_ru: 'Interacoustics Titan',
    description_uz: 'Tympanometriya va OAE diagnostikasi uchun universal platforma.',
    description_ru: 'Универсальная платформа для тимпанометрии и ОАЭ.',
    image: placeholderImage,
    brand: 'Interacoustics',
  },
];

const fallbackCochlear: FallbackInteracousticsProduct[] = [
  {
    name_uz: 'Cochlear Kanso 2',
    name_ru: 'Cochlear Kanso 2',
    description_uz: "Implantatsiya qilinadigan minigarnituralar uchun engil va ko'rinmas yechim.",
    description_ru: 'Лёгкое и незаметное решение для имплантируемых систем.',
    image: placeholderImage,
    brand: 'Cochlear',
  },
];

const fallbackJourney = [
  {
    title_uz: 'Diagnostika',
    title_ru: 'Диагностика',
    description_uz: 'Professional eshitish tekshiruvi.',
    description_ru: 'Профессиональная диагностика слуха.',
  },
  {
    title_uz: 'Tanlash',
    title_ru: 'Подбор',
    description_uz: 'Sizga mos apparat tanlash.',
    description_ru: 'Подбор подходящего аппарата.',
  },
];

const fallbackNews = [
  {
    title_uz: "Cochlear seminariga taklif",
    title_ru: 'Обучающий семинар Cochlear в Минске',
    excerpt_uz: 'Mutaxassislar va ota-onalar uchun yangi imkoniyatlar va bilimlar.',
    excerpt_ru: 'Еще больше инструментов и знаний, чтобы помочь взрослым и детям услышать радость.',
    slug: '#',
  },
];

function isProductResponse(
  product: ProductResponse | FallbackInteracousticsProduct,
): product is ProductResponse {
  return 'slug' in product;
}

// Helper to get locale from DOM - works on client only
// Fixed: Read from server-set values only, no re-detection after mount
function getClientLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  
  // Read from HTML data attribute first (set by server, available immediately)
  const htmlLocale = document.documentElement.getAttribute('data-locale');
  if (htmlLocale === 'ru' || htmlLocale === 'uz') {
    return htmlLocale as Locale;
  }
  
  // Fallback to window.__NEXT_LOCALE__ (set by script before React)
  if (typeof window !== 'undefined' && (window as { __NEXT_LOCALE__?: string }).__NEXT_LOCALE__) {
    const windowLocale = (window as { __NEXT_LOCALE__?: string }).__NEXT_LOCALE__;
    if (windowLocale === 'ru' || windowLocale === 'uz') {
      return windowLocale as Locale;
    }
  }
  
  // Fallback to cookie
  return getLocaleFromCookie();
}

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Initialize locale: read from server-set values (data-locale attribute or window.__NEXT_LOCALE__)
  // These are set by the server based on the cookie, so they're always in sync
  // During SSR, use DEFAULT_LOCALE (but this is a client component, so SSR shouldn't happen)
  const locale = useState<Locale>(() => {
    // On client, read from server-set values immediately
    // The server sets data-locale and window.__NEXT_LOCALE__ based on the cookie
    // So this will always match what the server rendered
    if (typeof document !== 'undefined') {
      return getClientLocale();
    }
    return DEFAULT_LOCALE;
  })[0]; // Only use the initial value, don't allow it to change
  
  // Use locale for display - it's stable and matches server render
  const displayLocale = locale;

  // Fetch data with correct locale
  // Note: React Query will automatically refetch when displayLocale changes (different query key)
  // All queries now handle errors gracefully - they return empty arrays/undefined on error
  // This allows the UI to always display fallback content when backend is unavailable
  const { data: bannerData, isLoading: bannersLoading, error: bannersError } = useQuery<BannerResponse[]>({
    queryKey: ['banners', displayLocale],
    queryFn: () => getPublicBanners(displayLocale),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
    throwOnError: false,
    // Provide fallback data
    placeholderData: [],
  });
  
  // Debug: Log banner data
  if (typeof window !== 'undefined') {
    console.log('[HomePage] Banner data:', bannerData);
    console.log('[HomePage] Banners loading:', bannersLoading);
    console.log('[HomePage] Banners error:', bannersError);
  }
  
  const { data: serviceData } = useQuery<ServiceResponse[]>({
    queryKey: ['services', displayLocale],
    queryFn: () => getPublicServices(displayLocale),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  });
  
  const { data: interacousticsData } = useQuery<ShowcaseResponse | null>({
    queryKey: ['showcase', 'interacoustics', displayLocale],
    queryFn: () => getShowcase('interacoustics', displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: null,
  });
  
  const { data: cochlearData } = useQuery<ShowcaseResponse | null>({
    queryKey: ['showcase', 'cochlear', displayLocale],
    queryFn: () => getShowcase('cochlear', displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: null,
  });
  
  const { data: hearingItemsData } = useQuery<HearingAidItemResponse[]>({
    queryKey: ['hearing-aid-items', displayLocale],
    queryFn: () => getHomepageHearingAidItems(displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  });
  
  const { data: categoriesData } = useQuery<ProductCategoryResponse[]>({
    queryKey: ['product-categories', displayLocale],
    queryFn: () => getProductCategories(displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  });
  
  const { data: journeyData } = useQuery<HomepageJourneyStepResponse[]>({
    queryKey: ['homepage-journey', displayLocale],
    queryFn: () => getHomepageJourney(displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  });
  
  const { data: newsItemsData } = useQuery<HomepageNewsItemResponse[]>({
    queryKey: ['homepage-news', displayLocale],
    queryFn: () => getHomepageNews(displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  });
  
  const { data: faqData } = useQuery<FaqResponse[]>({
    queryKey: ['faq', displayLocale],
    queryFn: () => getPublicFaq(displayLocale),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    throwOnError: false,
    placeholderData: [],
  });

  // Get fallback slides based on display locale
  const fallbackSlides = getFallbackSlides(displayLocale);
 
  // Use banner data from admin panel if available and has content, otherwise use fallback
  // Filter to only show banners with valid titles
  const slides: HeroSlide[] = (bannerData && bannerData.length > 0 
    ? bannerData.filter((banner) => banner.title_uz || banner.title_ru)
    : fallbackSlides
  ).map((banner, index) => {
    const isBackend = 'title_uz' in banner || 'title_ru' in banner;
    if (!isBackend) {
      const fallbackSlide = fallbackSlides[index % fallbackSlides.length];
      return {
        id: fallbackSlide.id,
        title: fallbackSlide.title,
        subtitle: fallbackSlide.subtitle,
        cta: fallbackSlide.cta,
        image: fallbackSlide.image,
        link: fallbackSlide.link,
      } satisfies HeroSlide;
    }
    const entity = banner as BannerResponse;
    const fallback = fallbackSlides[index % fallbackSlides.length];
    // Use locale-specific text, fallback to other locale if missing
    const title = displayLocale === 'ru' 
      ? (entity.title_ru || entity.title_uz || fallback.title)
      : (entity.title_uz || entity.title_ru || fallback.title);
    const subtitle = displayLocale === 'ru' 
      ? (entity.text_ru || entity.text_uz || fallback.subtitle || '')
      : (entity.text_uz || entity.text_ru || fallback.subtitle || '');
    const cta = displayLocale === 'ru' 
      ? (entity.ctaText_ru || entity.ctaText_uz || fallback.cta)
      : (entity.ctaText_uz || entity.ctaText_ru || fallback.cta);
    // Extract image URL from MediaResponse or use fallback
    // Convert relative URLs to absolute URLs by prepending API base URL
    let imageUrl = entity.image?.url || fallback.image;
    if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
      // Relative URL - prepend API base URL (without /api suffix since uploads are at root)
      // NEXT_PUBLIC_API_URL should be available on both server and client
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      // Remove /api from the base URL if present, since uploads are served from root
      const baseUrl = apiBase.replace('/api', '');
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    return {
      id: entity.id ?? `banner-${index}`,
      title: title || fallback.title,
      subtitle: subtitle || fallback.subtitle || '',
      cta: cta || fallback.cta,
      image: imageUrl,
      link: entity.ctaLink || fallback.link,
    } satisfies HeroSlide;
  });

  // Ensure we always have exactly 4 services (use fallback if needed)
  // If backend returns services, use them; otherwise use fallback services
  // Always pad or slice to exactly 4 services
  const servicesToUse = serviceData && serviceData.length > 0 ? serviceData : fallbackServices;
  
  // Create exactly 4 services, cycling through available services if needed
  const services = Array.from({ length: 4 }, (_, index) => {
    const service = servicesToUse[index % servicesToUse.length];
    const fallback = fallbackServices[index % fallbackServices.length];
    
    // Check if service is from backend (ServiceResponse has slug, title_uz, title_ru)
    const isBackendService = service && 'slug' in service && 'title_uz' in service && 'title_ru' in service;
    const backendService = isBackendService ? (service as ServiceResponse) : null;
    
    // Use backend service data if available, otherwise use fallback
    const localizedTitle = backendService
      ? (displayLocale === 'ru' ? backendService.title_ru : backendService.title_uz)
      : (displayLocale === 'ru' ? fallback.title_ru : fallback.title_uz);
    const localizedDescription = backendService
      ? (displayLocale === 'ru' ? (backendService.excerpt_ru ?? '') : (backendService.excerpt_uz ?? ''))
      : (displayLocale === 'ru' ? (fallback.excerpt_ru ?? '') : (fallback.excerpt_uz ?? ''));
    const slug = backendService ? backendService.slug : fallback.slug;
    // Use cover image from API or fallback placeholder
    const image = backendService?.cover?.url ?? fallback.image ?? placeholderImage;
    
    return {
      id: slug ?? `service-${index}`,
      title: localizedTitle || `Service ${index + 1}`,
      description: localizedDescription || '',
      slug: slug || `service-${index}`,
      image: image || placeholderImage,
    };
  });

  // Use all categories from catalog instead of homepage hearing aid items
  // Transform categories to match hearing items format
  const catalogCategories = (categoriesData?.length ? categoriesData : []).map((category) => {
    const title = getBilingualText(category.name_uz, category.name_ru, displayLocale);
    const description = getBilingualText(category.description_uz ?? '', category.description_ru ?? '', displayLocale);
    // Use category image if available, otherwise use orange square placeholder
    const image = category.image?.url ?? placeholderImage;
    const link = `/catalog/${category.slug}`;
    return {
      id: category.id,
      title,
      description,
      image,
      link,
      hasImage: !!category.image?.url, // Track if we have a real image
    };
  });

  // Fallback to homepage hearing aid items if no categories available
  const hearingItems = catalogCategories.length > 0 
    ? catalogCategories
    : (hearingItemsData?.length ? hearingItemsData : fallbackHearingItems).slice(0, 9).map((item, index) => {
        const fallback = fallbackHearingItems[index % fallbackHearingItems.length];
        const title = getBilingualText(item.title_uz ?? fallback.title_uz, item.title_ru ?? fallback.title_ru, displayLocale);
        const description = getBilingualText(item.description_uz ?? fallback.description_uz ?? '', item.description_ru ?? fallback.description_ru ?? '', displayLocale);
        const image = item.image?.url ?? placeholderImage;
        const link = item.link ?? fallback.link ?? '/catalog';
        return {
          id: item.id ?? fallback.id,
          title,
          description,
          image,
          link,
          hasImage: !!item.image?.url,
        };
      });

  const interacousticsSource: (ProductResponse | FallbackInteracousticsProduct)[] =
    interacousticsData?.products && interacousticsData.products.length > 0
      ? interacousticsData.products
      : fallbackInteracoustics;

  const interacousticsProducts = interacousticsSource.slice(0, 4).map((product, index) => {
    const fallback = fallbackInteracoustics[index % fallbackInteracoustics.length];
    if (isProductResponse(product)) {
      const titleUz = product.name_uz ?? fallback.name_uz;
      const titleRu = product.name_ru ?? fallback.name_ru;
      const descriptionUz = product.description_uz ?? fallback.description_uz ?? '';
      const descriptionRu = product.description_ru ?? fallback.description_ru ?? '';
      const image = product.brand?.logo?.url ?? fallback.image;
      const brand = product.brand?.name ?? fallback.brand;
      return {
        id: product.slug ?? product.id ?? `interacoustics-${index}`,
        title: displayLocale === 'ru' ? titleRu : titleUz,
        description: displayLocale === 'ru' ? descriptionRu : descriptionUz,
        image,
        brand,
        slug: product.slug,
      };
    }
    return {
      id: `interacoustics-fallback-${index}`,
      title: displayLocale === 'ru' ? product.name_ru : product.name_uz,
      description: displayLocale === 'ru' ? product.description_ru ?? '' : product.description_uz ?? '',
      image: product.image,
      brand: product.brand,
      slug: undefined,
    };
  });

  const cochlearSource: (ProductResponse | FallbackInteracousticsProduct)[] =
    cochlearData?.products && cochlearData.products.length > 0
      ? cochlearData.products
      : fallbackCochlear;

  const cochlearProducts = cochlearSource.slice(0, 4).map((product, index) => {
    const fallback = fallbackCochlear[index % fallbackCochlear.length];
    if (isProductResponse(product)) {
      const titleUz = product.name_uz ?? fallback.name_uz;
      const titleRu = product.name_ru ?? fallback.name_ru;
      const descriptionUz = product.description_uz ?? fallback.description_uz ?? '';
      const descriptionRu = product.description_ru ?? fallback.description_ru ?? '';
      const image = product.brand?.logo?.url ?? fallback.image;
      const brand = product.brand?.name ?? fallback.brand;
      return {
        id: product.slug ?? product.id ?? `cochlear-${index}`,
        title: displayLocale === 'ru' ? titleRu : titleUz,
        description: displayLocale === 'ru' ? descriptionRu : descriptionUz,
        image,
        brand,
        slug: product.slug,
      };
    }
    return {
      id: `cochlear-fallback-${index}`,
      title: displayLocale === 'ru' ? product.name_ru : product.name_uz,
      description: displayLocale === 'ru' ? product.description_ru ?? '' : product.description_uz ?? '',
      image: product.image,
      brand: product.brand,
      slug: undefined,
    };
  });

  const journeySteps = (journeyData?.length ? journeyData : fallbackJourney.map((step, i) => ({
    id: `journey-${i}`,
    title_uz: step.title_uz,
    title_ru: step.title_ru,
    description_uz: step.description_uz,
    description_ru: step.description_ru,
    order: i + 1,
    status: 'published' as const,
  }))).slice(0, 4).map((step, index) => {
    const fallback = fallbackJourney[index % fallbackJourney.length];
    const title = getBilingualText(step.title_uz ?? fallback.title_uz, step.title_ru ?? fallback.title_ru, displayLocale);
    const description = getBilingualText(step.description_uz ?? fallback.description_uz ?? '', step.description_ru ?? fallback.description_ru ?? '', displayLocale);
    return {
      id: step.id ?? `journey-${index}`,
      title,
      description,
      order: step.order ?? index + 1,
    };
  });

  const newsItems = (newsItemsData?.length ? newsItemsData : fallbackNews.map((item, i) => ({
    id: `news-${i}`,
    title_uz: item.title_uz,
    title_ru: item.title_ru,
    excerpt_uz: item.excerpt_uz,
    excerpt_ru: item.excerpt_ru,
    slug: item.slug,
    publishedAt: new Date().toISOString(),
    order: i + 1,
    status: 'published' as const,
  }))).slice(0, 6).map((item, index) => {
    const fallback = fallbackNews[index % fallbackNews.length];
    const title = getBilingualText(item.title_uz ?? fallback.title_uz, item.title_ru ?? fallback.title_ru, displayLocale);
    const excerpt = getBilingualText(item.excerpt_uz ?? fallback.excerpt_uz ?? '', item.excerpt_ru ?? fallback.excerpt_ru ?? '', displayLocale);
    return {
      id: item.id ?? `news-${index}`,
      title,
      excerpt,
      slug: item.slug ?? fallback.slug,
      publishedAt: item.publishedAt,
    };
  });

  const faqItems = (faqData?.length ? faqData : []).slice(0, 6).map((item) => {
    const question = getBilingualText(item.question_uz, item.question_ru, displayLocale);
    const answer = getBilingualText(item.answer_uz ?? '', item.answer_ru ?? '', displayLocale);
    return {
      id: item.id,
      question,
      answer,
    };
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Slides - Two-Column Layout */}
      {slides.length > 0 && (
        <section className="bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="relative overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-stretch">
                {/* Left Panel - Text Content with White Background */}
                <div className="relative flex flex-col justify-center bg-white px-6 py-6 md:px-8 md:py-8 md:w-1/2 md:min-h-[320px] rounded-l-lg">
                  {slides.map((slide, index) => (
                    <div
                      key={`text-${slide.id}`}
                      className={`transition-opacity duration-500 ${
                        index === activeSlide ? 'opacity-100 relative z-10' : 'absolute inset-0 opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <div className="space-y-3 md:space-y-4">
                        {/* Dark Blue Heading */}
                        <h1 className="text-xl font-bold leading-tight text-[#1e3a8a] md:text-2xl lg:text-3xl" suppressHydrationWarning>
                          {slide.title}
                        </h1>
                        {/* Grey Subtitle */}
                        {slide.subtitle && (
                          <p className="text-sm leading-relaxed text-muted-foreground md:text-base" suppressHydrationWarning>
                            {slide.subtitle}
                          </p>
                        )}
                        {/* CTA Buttons Row */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          {/* Primary Orange CTA Button */}
                          {slide.cta && (
                            <Link
                              href={slide.link}
                              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary/90 md:px-5 md:py-2.5"
                              suppressHydrationWarning
                            >
                              {slide.cta}
                              <ArrowRight size={14} className="md:w-4 md:h-4" />
                            </Link>
                          )}
                          {/* Secondary White Outlined Phone Button */}
                          <Link
                            href="tel:+998712021441"
                            className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/50 md:px-5 md:py-2.5"
                            suppressHydrationWarning
                          >
                            <Phone size={14} className="md:w-4 md:h-4" />
                            <span>1385</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Navigation Dots - Bottom Left */}
                  {slides.length > 1 && (
                    <div className="absolute bottom-3 left-6 flex items-center gap-2 z-20 md:bottom-4 md:left-8">
                      {slides.map((_, dotIndex) => (
                        <button
                          key={dotIndex}
                          type="button"
                          onClick={() => setActiveSlide(dotIndex)}
                          className={`h-2 w-2 rounded-full transition-all ${
                            dotIndex === activeSlide
                              ? 'h-2.5 w-2.5 bg-brand-primary'
                              : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                          }`}
                          aria-label={`Go to slide ${dotIndex + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Panel - Orange Block with Image or "Acoustic" Text */}
                <div className="relative w-full md:w-1/2 bg-brand-primary md:min-h-[320px] rounded-r-lg">
                  {slides.map((slide, index) => {
                    const imageUrl = slide.image;
                    const isActive = index === activeSlide;
                    // Check if we have a real image from backend (not placeholder)
                    // Real images are URLs (http/https) or uploaded media, not data URIs
                    const hasRealImage = imageUrl && 
                      imageUrl !== placeholderImage && 
                      !imageUrl.startsWith('data:image/svg+xml') &&
                      (imageUrl.startsWith('http://') || 
                       imageUrl.startsWith('https://') || 
                       (imageUrl.startsWith('/') && !imageUrl.startsWith('//')));
                    
                    return (
                      <div
                        key={`image-${slide.id}`}
                        className={`absolute inset-0 transition-opacity duration-500 rounded-r-lg ${
                          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      >
                        {hasRealImage ? (
                          // Show image if available from backend
                          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 lg:p-8">
                            <img
                              src={imageUrl}
                              alt={slide.title}
                              className="max-w-full max-h-full object-contain rounded-lg"
                              style={{ 
                                width: 'auto',
                                height: 'auto',
                                maxWidth: 'calc(100% - 2rem)',
                                maxHeight: 'calc(100% - 2rem)'
                              }}
                              onError={(e) => {
                                // If image fails to load, show "Acoustic" text
                                console.warn('[HomePage] Failed to load image:', imageUrl);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center rounded-r-lg"><span class="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Acoustic</span></div>';
                                }
                              }}
                            />
                          </div>
                        ) : (
                          // Show "Acoustic" text if no image (centered in orange block)
                          <div className="absolute inset-0 flex items-center justify-center rounded-r-lg">
                            <span className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Acoustic</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services Section - Image-based Cards - Always show 4 in a row */}
      {services.length > 0 && (
        <section className="bg-white py-8">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Наши услуги' : 'Bizning xizmatlar'}
              </h2>
            </div>
            {/* Grid: 1 col on mobile, 2 cols on small screens, 4 cols on medium+ screens */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {/* Always display exactly 4 services */}
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Service Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized={service.image?.startsWith('data:')}
                    />
                  </div>
                  
                  {/* Service Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-brand-primary" suppressHydrationWarning>
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground" suppressHydrationWarning>
                        {service.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2" suppressHydrationWarning>
                      {displayLocale === 'ru' ? 'Подробнее' : 'Batafsil'}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hearing Aids Section */}
      {hearingItems.length > 0 && (
        <section className="border-t bg-white py-12">
          <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Слуховые аппараты' : 'Eshitish apparatlari'}
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Решения для вашего образа жизни' : 'Turmush tarziga mos eshitish yechimlari'}
              </h2>
              {displayLocale === 'ru' ? (
                <p className="text-base text-muted-foreground" suppressHydrationWarning>
                  Мы подберём модель, которая подходит вашему образу жизни, активности и бюджету.
                </p>
              ) : (
                <p className="text-base text-muted-foreground" suppressHydrationWarning>
                  Biz sizning odatlaringiz, faolligingiz va byudjetingizga mos modelni topamiz.
                </p>
              )}
            </div>
            {/* 3-column grid for categories */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {hearingItems.slice(0, 9).map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  className="group flex flex-col h-full rounded-lg border border-border/60 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-brand-primary/50"
                >
                  {/* Orange square icon with "Acoustic" text or category image */}
                  <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg bg-brand-primary flex items-center justify-center">
                    {(item as any).hasImage && item.image !== placeholderImage ? (
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <span className="text-white text-lg font-bold">Acoustic</span>
                    )}
                  </div>
                  {/* Category title and description */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-brand-primary" suppressHydrationWarning>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                        {item.description}
                      </p>
                    )}
                    {/* Link text */}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary group-hover:gap-2" suppressHydrationWarning>
                      {displayLocale === 'ru' ? 'Подробнее' : 'Batafsil'}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interacoustics Section */}
      {interacousticsProducts.length > 0 && (
        <section className="border-t bg-white py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Interacoustics' : 'Interacoustics'}
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Диагностическое оборудование' : 'Diagnostik uskunalar'}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {interacousticsProducts.map((product) => {
                const productLink = product.slug ? `/products/${product.slug}` : '#';
                return (
            <Link
                key={product.id}
                    href={productLink}
                    className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-primary/5">
                      <Image src={product.image} alt={product.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
                </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-brand-primary" suppressHydrationWarning>
                        {product.brand}
                      </p>
                      <h3 className="text-base font-semibold text-brand-accent group-hover:text-brand-primary" suppressHydrationWarning>
                    {product.title}
                  </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                        {product.description}
                      </p>
                </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
      )}

      {/* Cochlear Section */}
      {cochlearProducts.length > 0 && (
        <section className="border-t bg-muted/20 py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Cochlear' : 'Cochlear'}
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Имплантируемые системы' : 'Implantatsiya qilinadigan tizimlar'}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {cochlearProducts.map((product) => {
                const productLink = product.slug ? `/products/${product.slug}` : '#';
                return (
            <Link
                key={product.id}
                    href={productLink}
                    className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-primary/5">
                      <Image src={product.image} alt={product.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
                </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-brand-primary" suppressHydrationWarning>
                        {product.brand}
                      </p>
                      <h3 className="text-base font-semibold text-brand-accent group-hover:text-brand-primary" suppressHydrationWarning>
                    {product.title}
                  </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                        {product.description}
                      </p>
                </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
      )}

      {/* Journey Section */}
      {journeySteps.length > 0 && (
        <section className="border-t bg-white py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
          <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Путь к лучшему слуху' : 'Yaxshi eshitishga yo\'l'}
              </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Как мы помогаем' : 'Biz qanday yordam beramiz'}
            </h2>
          </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {journeySteps.map((step) => (
                <div key={step.id} className="relative flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-2xl font-bold text-brand-primary">
                    {step.order}
                  </div>
                  <h3 className="text-lg font-semibold text-brand-accent" suppressHydrationWarning>
                    {step.title}
                </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                    {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* News Section */}
      {newsItems.length > 0 && (
        <section className="border-t bg-muted/20 py-12">
          <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
          <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Новости' : 'Yangiliklar'}
            </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Последние новости' : 'So\'nggi yangiliklar'}
            </h2>
          </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <Link
                key={item.id}
                  href={`/posts/${item.slug}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand-primary/50 hover:shadow-lg"
                >
                  <div className="space-y-2">
                    {item.publishedAt && (
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {new Date(item.publishedAt).toLocaleDateString(displayLocale === 'ru' ? 'ru-RU' : 'uz-UZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                    <h3 className="text-lg font-semibold text-brand-accent group-hover:text-brand-primary" suppressHydrationWarning>
                  {item.title}
                </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" suppressHydrationWarning>
                      {item.excerpt}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-primary" suppressHydrationWarning>
                      {displayLocale === 'ru' ? 'Читать' : "O'qish"}
                  <ArrowRight size={14} />
                </span>
                  </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* FAQ Section */}
      {faqItems.length > 0 && (
        <section className="border-t bg-white py-12">
        <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-6">
          <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Частые вопросы' : 'Tez-tez beriladigan savollar'}
            </p>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl" suppressHydrationWarning>
                {displayLocale === 'ru' ? 'Ответы на популярные запросы' : "Ko'p beriladigan savollarga javoblar"}
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {faqItems.map((item) => (
              <details
                key={item.id}
                className="group rounded-xl border border-border/50 bg-muted/10 p-4 shadow-sm transition hover:border-brand-primary/40"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-left text-sm font-semibold text-foreground">
                    <span suppressHydrationWarning>{item.question}</span>
                  <span className="text-brand-primary transition group-open:rotate-180">▼</span>
                </summary>
                  <div className="mt-3 text-xs text-muted-foreground leading-relaxed" suppressHydrationWarning>
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      )}
    </main>
  );
}