/**
 * Server-side API utilities
 * These functions wrap the regular API calls with error handling
 * to ensure the UI always renders, even when the backend is down.
 */

import {
  getCategoryBySlug as getCategoryBySlugApi,
  getServiceBySlug as getServiceBySlugApi,
  getProductBySlug as getProductBySlugApi,
  getProducts as getProductsApi,
  getProductCategories as getProductCategoriesApi,
  getPublicBanners as getPublicBannersApi,
  getHomepageServices as getHomepageServicesApi,
  getPublicServices as getPublicServicesApi,
  getShowcase as getShowcaseApi,
  getHomepageHearingAidItems as getHomepageHearingAidItemsApi,
  getHomepageNews as getHomepageNewsApi,
  getPublicFaq as getPublicFaqApi,
  getHomepageJourney as getHomepageJourneyApi,
  getServiceCategories as getServiceCategoriesApi,
  getServiceCategoryBySlug as getServiceCategoryBySlugApi,
  type ProductCategoryResponse,
  type ServiceCategoryResponse,
  type ServiceDetailResponse,
  type ProductResponse,
  type BannerResponse,
  type ServiceResponse,
  type ShowcaseResponse,
  type HearingAidItemResponse,
  type HomepageNewsItemResponse,
  type FaqResponse,
  type HomepageJourneyStepResponse,
} from './api';

// Re-export types for use in pages
export type { 
  ProductCategoryResponse, 
  ServiceCategoryResponse,
  BannerResponse,
  ServiceResponse,
  ShowcaseResponse,
  HearingAidItemResponse,
  HomepageNewsItemResponse,
  FaqResponse,
  HomepageJourneyStepResponse,
} from './api';

/**
 * Safely fetch data from API, returning fallback on any error
 * This ensures server-side rendering never crashes, even when backend is down
 */
async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T,
  errorMessage?: string,
): Promise<T> {
  try {
    const result = await apiCall();
    // If API returns null/undefined, use fallback
    if (result === null || result === undefined) {
      if (errorMessage) {
        console.warn(`[API Server] ${errorMessage}: API returned null/undefined, using fallback`);
      }
      return fallback;
    }
    return result;
  } catch (error) {
    // Log error but don't throw - always return fallback
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage) {
      console.warn(`[API Server] ${errorMessage}:`, message);
    } else {
      console.warn(`[API Server] API call failed:`, message);
    }
    return fallback;
  }
}

/**
 * Get category by slug - returns null if not found or backend is down
 * This allows pages to distinguish between "not found" and "backend down"
 */
export async function getCategoryBySlug(
  slug: string,
  locale?: string,
): Promise<ProductCategoryResponse | null> {
  return safeApiCall(
    () => getCategoryBySlugApi(slug, locale),
    null,
    `Failed to fetch category: ${slug}`,
  );
}

/**
 * Get service by slug - returns null if not found or backend is down
 */
export async function getServiceBySlug(
  slug: string,
  locale?: string,
): Promise<ServiceDetailResponse | null> {
  return safeApiCall(
    () => getServiceBySlugApi(slug, locale),
    null,
    `Failed to fetch service: ${slug}`,
  );
}

/**
 * Get product by slug - returns null if not found or backend is down
 */
export async function getProductBySlug(
  slug: string,
  locale?: string,
): Promise<ProductResponse | null> {
  return safeApiCall(
    () => getProductBySlugApi(slug, locale),
    null,
    `Failed to fetch product: ${slug}`,
  );
}

/**
 * Get products - returns empty array if backend is down
 */
export async function getProducts(
  params?: Parameters<typeof getProductsApi>[0],
  locale?: string,
): Promise<ProductResponse[]> {
  return safeApiCall(
    () => getProductsApi(params, locale),
    [],
    'Failed to fetch products',
  );
}

/**
 * Get product categories - returns empty array if backend is down
 */
export async function getProductCategories(
  locale?: string,
): Promise<ProductCategoryResponse[]> {
  return safeApiCall(
    () => getProductCategoriesApi(locale),
    [],
    'Failed to fetch product categories',
  );
}

/**
 * Get public banners - returns empty array if backend is down
 */
export async function getPublicBanners(
  locale?: string,
): Promise<BannerResponse[]> {
  return safeApiCall(
    () => getPublicBannersApi(locale),
    [],
    'Failed to fetch banners',
  );
}

/**
 * Get homepage services - returns empty array if backend is down
 */
export async function getHomepageServices(
  locale?: string,
): Promise<ServiceResponse[]> {
  return safeApiCall(
    () => getHomepageServicesApi(locale),
    [],
    'Failed to fetch homepage services',
  );
}

/**
 * Get all public services - returns empty array if backend is down
 */
export async function getServices(
  locale?: string,
): Promise<ServiceResponse[]> {
  return safeApiCall(
    () => getPublicServicesApi(locale),
    [],
    'Failed to fetch services',
  );
}

/**
 * Get showcase (Interacoustics) - returns null if backend is down
 */
export async function getShowcase(
  name: string,
  locale?: string,
): Promise<ShowcaseResponse | null> {
  return safeApiCall(
    () => getShowcaseApi(name, locale),
    null,
    `Failed to fetch showcase: ${name}`,
  );
}

/**
 * Get homepage hearing aid items (Product Catalog) - returns empty array if backend is down
 */
export async function getHomepageHearingAidItems(
  locale?: string,
): Promise<HearingAidItemResponse[]> {
  return safeApiCall(
    () => getHomepageHearingAidItemsApi(locale),
    [],
    'Failed to fetch homepage hearing aid items',
  );
}

/**
 * Get homepage news - returns empty array if backend is down
 */
export async function getHomepageNews(
  locale?: string,
): Promise<HomepageNewsItemResponse[]> {
  return safeApiCall(
    () => getHomepageNewsApi(locale),
    [],
    'Failed to fetch homepage news',
  );
}

/**
 * Get public FAQ - returns empty array if backend is down
 */
export async function getPublicFaq(
  locale?: string,
): Promise<FaqResponse[]> {
  return safeApiCall(
    () => getPublicFaqApi(locale),
    [],
    'Failed to fetch FAQ',
  );
}

/**
 * Get homepage journey steps - returns empty array if backend is down
 */
export async function getHomepageJourney(
  locale?: string,
): Promise<HomepageJourneyStepResponse[]> {
  return safeApiCall(
    () => getHomepageJourneyApi(locale),
    [],
    'Failed to fetch homepage journey',
  );
}

/**
 * Get service categories - returns empty array if backend is down
 */
export async function getServiceCategories(
  locale?: string,
): Promise<ServiceCategoryResponse[]> {
  return safeApiCall(
    () => getServiceCategoriesApi(locale),
    [],
    'Failed to fetch service categories',
  );
}

/**
 * Get service category by slug - returns null if not found or backend is down
 */
export async function getServiceCategoryBySlug(
  slug: string,
  locale?: string,
): Promise<ServiceCategoryResponse | null> {
  return safeApiCall(
    () => getServiceCategoryBySlugApi(slug, locale),
    null,
    `Failed to fetch service category: ${slug}`,
  );
}

/**
 * Check if backend is available
 * Returns true if backend responds, false otherwise
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/banners?public=true`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Short timeout to avoid blocking
        signal: AbortSignal.timeout(2000),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

