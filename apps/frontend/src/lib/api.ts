const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export class ApiFetchError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Fetch JSON from API with locale support
 * Adds locale to query params and sets X-Locale header for backend
 * Always uses cache: 'no-store' to prevent caching of locale-dependent content
 * 
 * Gracefully handles errors: if the backend is unavailable, returns empty data
 * instead of throwing errors, so the UI can display fallback content.
 */
async function fetchJson<T>(
  path: string,
  locale?: string,
  init?: RequestInit,
): Promise<T> {
  try {
    // Parse the path to handle existing query parameters
    const [pathname, existingQuery] = path.split('?');
    // Fix: Remove leading slash if present to avoid absolute path replacement
    // Then properly append to API_BASE
    const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    // Ensure API_BASE ends with / for proper URL construction
    const baseUrl = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
    const url = new URL(cleanPath, baseUrl);
    
    // Add existing query parameters if any
    if (existingQuery) {
      existingQuery.split('&').forEach((param) => {
        const [key, value] = param.split('=');
        if (key && value) {
          url.searchParams.set(key, decodeURIComponent(value));
        }
      });
    }
    
    // Add locale to query params if provided
    if (locale && (locale === 'ru' || locale === 'uz')) {
      url.searchParams.set('lang', locale);
    }

    // Build headers object
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge existing headers from init
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, init.headers);
      }
    }

    // Add X-Locale header if locale is provided
    if (locale && (locale === 'ru' || locale === 'uz')) {
      headers['X-Locale'] = locale;
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      // Add cache-busting timestamp for homepage services, FAQ, and news to ensure fresh data
      const isHomepageServices = path.includes('/homepage/services');
      const isFaq = path.includes('/faq');
      const isHomepageNews = path.includes('/homepage/news');
      let finalUrl = url.toString();
      if (isHomepageServices || isFaq || isHomepageNews) {
        // Add cache-busting query parameter
        const separator = url.search ? '&' : '?';
        finalUrl = `${finalUrl}${separator}_t=${Date.now()}`;
      }
      
      const response = await fetch(finalUrl, {
        ...init,
        headers,
        cache: 'no-store', // Always disable caching for locale-dependent content
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Don't throw errors - return empty data instead
        // This allows the UI to gracefully fall back to default content
        console.warn(`[API] Request failed: ${response.status} ${response.statusText} for ${path}`);
        return [] as T; // Return empty array for list endpoints, undefined will be handled by callers
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // Re-throw AbortError as network error
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw fetchError;
    }
  } catch (error) {
    // Catch all errors (network errors, timeouts, JSON parse errors, etc.)
    // Return empty data instead of throwing, so UI can display fallback content
    console.warn(`[API] Failed to fetch ${path}:`, error instanceof Error ? error.message : 'Unknown error');
    
    // Return appropriate empty value based on expected return type
    // For array endpoints, return empty array; for object endpoints, return null/undefined
    // The caller should handle these gracefully
    if (path.includes('/banners') || path.includes('/services') || path.includes('/products') || 
        path.includes('/categories') || path.includes('/homepage') || path.includes('/faq') ||
        path.includes('/brands')) {
      return [] as T;
    }
    
    // For single object endpoints, return null
    return null as T;
  }
}

export interface MediaResponse {
  id: string;
  url: string;
  alt_uz?: string | null;
  alt_ru?: string | null;
}

export interface BannerResponse {
  id: string;
  title_uz: string;
  title_ru: string;
  text_uz?: string | null;
  text_ru?: string | null;
  ctaText_uz?: string | null;
  ctaText_ru?: string | null;
  ctaLink?: string | null;
  image?: MediaResponse | null;
}

export interface ServiceResponse {
  id: string;
  title_uz: string;
  title_ru: string;
  excerpt_uz?: string | null;
  excerpt_ru?: string | null;
  slug: string;
  cover?: MediaResponse | null;
  image?: MediaResponse | null; // Homepage services use 'image' instead of 'cover'
}

export interface ProductCategoryResponse {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz?: string | null;
  description_ru?: string | null;
  icon?: string | null;
  image?: MediaResponse | null;
  parentId?: string | null;
  order: number;
}

export const getPublicBanners = (locale?: string) => {
  const url = '/banners?public=true';
  return fetchJson<BannerResponse[]>(url, locale);
};

export const getPublicServices = (locale?: string) => {
  const url = '/services?public=true';
  return fetchJson<ServiceResponse[]>(url, locale);
};

export const getHomepageServices = (locale?: string) => {
  const url = '/homepage/services';
  return fetchJson<ServiceResponse[]>(url, locale);
};

export const getProductCategories = (locale?: string) => {
  return fetchJson<ProductCategoryResponse[]>('/product-categories', locale);
};

export const getCategoryBySlug = async (slug: string, locale?: string): Promise<ProductCategoryResponse | null> => {
  try {
    // First try direct API endpoint (if backend supports it)
    const directResult = await fetchJson<ProductCategoryResponse>(`/product-categories/slug/${slug}`, locale);
    if (directResult) {
      return directResult;
    }
  } catch {
    // Fallback to searching all categories
  }
  
  // Fallback: get all categories and find by slug
  const categories = await getProductCategories(locale);
  if (!categories || categories.length === 0) {
    return null;
  }
  return categories.find((cat) => cat.slug === slug) ?? null;
};

export interface MenuItemResponse {
  id: string;
  title_uz: string;
  title_ru: string;
  href: string;
  order: number;
  children?: MenuItemResponse[];
}

export interface MenuResponse {
  id: string;
  name: string;
  items: MenuItemResponse[];
}

export const getMenu = (name: string, locale?: string) => {
  return fetchJson<MenuResponse>(`/menus/${name}`, locale);
};

export interface ServiceDetailResponse extends ServiceResponse {
  body_uz?: string | null;
  body_ru?: string | null;
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const getServiceBySlug = async (slug: string, locale?: string): Promise<ServiceDetailResponse | null> => {
  // fetchJson already handles errors gracefully and returns null for object endpoints
  return await fetchJson<ServiceDetailResponse | null>(`/services/slug/${slug}`, locale);
};

export interface ProductResponse {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  price?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  specsText?: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo?: MediaResponse | null;
  } | null;
  category?: {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
  } | null;
  audience: string[];
  formFactors: string[];
  signalProcessing?: string | null;
  powerLevel?: string | null;
  hearingLossLevels: string[];
  smartphoneCompatibility: string[];
  tinnitusSupport?: boolean | null;
  paymentOptions: string[];
  availabilityStatus?: string | null;
  intro_uz?: string | null;
  intro_ru?: string | null;
  features_uz: string[];
  features_ru: string[];
  benefits_uz: string[];
  benefits_ru: string[];
  tech_uz?: string | null;
  tech_ru?: string | null;
  fittingRange_uz?: string | null;
  fittingRange_ru?: string | null;
  regulatoryNote_uz?: string | null;
  regulatoryNote_ru?: string | null;
  galleryIds: string[];
  galleryUrls: string[];
  relatedProductIds: string[];
  usefulArticleSlugs: string[];
  relatedProducts?: RelatedProductSummary[];
  usefulArticles?: UsefulArticleSummary[];
}

export interface RelatedProductSummary {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  price?: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo?: MediaResponse | null;
  } | null;
  galleryUrls?: string[];
  availabilityStatus?: string | null;
}

export interface UsefulArticleSummary {
  id: string;
  title_uz: string;
  title_ru: string;
  slug: string;
  excerpt_uz?: string | null;
  excerpt_ru?: string | null;
}

export interface ShowcaseResponse {
  id: string;
  type: 'interacoustics' | 'cochlear';
  products: ProductResponse[];
}

export const getShowcase = (type: 'interacoustics' | 'cochlear', locale?: string): Promise<ShowcaseResponse | null> => {
  // fetchJson already handles errors gracefully and returns null for object endpoints
  return fetchJson<ShowcaseResponse | null>(`/showcases/${type}`, locale);
};

export const getProductBySlug = (slug: string, locale?: string): Promise<ProductResponse | null> => {
  // fetchJson already handles errors gracefully and returns null for object endpoints
  return fetchJson<ProductResponse | null>(`/products/slug/${slug}`, locale);
};

export interface ProductListParams {
  status?: string;
  brandId?: string;
  categoryId?: string;
  search?: string;
  audience?: string;
  formFactor?: string;
  signalProcessing?: string;
  powerLevel?: string;
  hearingLossLevel?: string;
  smartphoneCompatibility?: string;
  paymentOption?: string;
  availabilityStatus?: string;
}

export const getProducts = (params?: ProductListParams, locale?: string) => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.brandId) query.set('brandId', params.brandId);
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  if (params?.search) query.set('search', params.search);
  if (params?.audience) query.set('audience', params.audience);
  if (params?.formFactor) query.set('formFactor', params.formFactor);
  if (params?.signalProcessing) query.set('signalProcessing', params.signalProcessing);
  if (params?.powerLevel) query.set('powerLevel', params.powerLevel);
  if (params?.hearingLossLevel) query.set('hearingLossLevel', params.hearingLossLevel);
  if (params?.smartphoneCompatibility) query.set('smartphoneCompatibility', params.smartphoneCompatibility);
  if (params?.paymentOption) query.set('paymentOption', params.paymentOption);
  if (params?.availabilityStatus) query.set('availabilityStatus', params.availabilityStatus);

  const queryString = query.toString();
  const path = queryString ? `/products?${queryString}` : '/products';
  return fetchJson<ProductResponse[]>(path, locale);
};

export interface HearingAidItemResponse {
  id: string;
  title_uz: string;
  title_ru: string;
  description_uz?: string | null;
  description_ru?: string | null;
  image?: MediaResponse | null;
  link?: string | null;
  order: number;
  status: string;
}

export const getHomepageHearingAidItems = (locale?: string) => {
  return fetchJson<HearingAidItemResponse[]>('/homepage/hearing-aids', locale);
};

export interface HomepageNewsItemResponse {
  id: string;
  title_uz: string;
  title_ru: string;
  excerpt_uz?: string | null;
  excerpt_ru?: string | null;
  slug: string;
  publishedAt?: string | null;
  order: number;
  status: string;
}

export const getHomepageNews = (locale?: string) => {
  return fetchJson<HomepageNewsItemResponse[]>('/homepage/news', locale);
};

export interface FaqResponse {
  id: string;
  question_uz: string;
  question_ru: string;
  answer_uz?: string | null;
  answer_ru?: string | null;
  order: number;
  status: string;
}

export const getPublicFaq = (locale?: string) => {
  const url = '/faq?public=true';
  return fetchJson<FaqResponse[]>(url, locale);
};

export interface HomepageJourneyStepResponse {
  id: string;
  title_uz: string;
  title_ru: string;
  description_uz?: string | null;
  description_ru?: string | null;
  order: number;
  status: string;
}

export const getHomepageJourney = (locale?: string) => {
  return fetchJson<HomepageJourneyStepResponse[]>('/homepage/journey', locale);
};

export interface BrandResponse {
  id: string;
  name: string;
  slug: string;
  logo?: MediaResponse | null;
}

export const getBrands = (locale?: string) => {
  return fetchJson<BrandResponse[]>('/brands', locale);
};
