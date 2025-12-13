/**
 * Server-side API utilities
 * These functions wrap the regular API calls with error handling
 * to ensure the UI always renders, even when the backend is down.
 */

import {
  getCategoryBySlug as getCategoryBySlugApi,
  getCatalogBySlug as getCatalogBySlugApi,
  getCatalogs as getCatalogsApi,
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
  getPosts as getPostsApi,
  getPostBySlug as getPostBySlugApi,
  getPostCategories as getPostCategoriesApi,
  getPostCategoryBySlug as getPostCategoryBySlugApi,
  getPublicFaq as getPublicFaqApi,
  getHomepageJourney as getHomepageJourneyApi,
  getServiceCategories as getServiceCategoriesApi,
  getServiceCategoryBySlug as getServiceCategoryBySlugApi,
  getBrands as getBrandsApi,
  getBranches as getBranchesApi,
  getDoctors as getDoctorsApi,
  getDoctorBySlug as getDoctorBySlugApi,
  type ProductCategoryResponse,
  type CatalogResponse,
  type ServiceCategoryResponse,
  type ServiceDetailResponse,
  type ProductResponse,
  type ProductListResponse,
  type BannerResponse,
  type ServiceResponse,
  type ShowcaseResponse,
  type HearingAidItemResponse,
  type HomepageNewsItemResponse,
  type PostResponse,
  type PostCategoryResponse,
  type FaqResponse,
  type HomepageJourneyStepResponse,
  type BrandResponse,
  type BranchResponse,
  type DoctorResponse,
  getBranchBySlug as getBranchBySlugApi,
  getPageBySlug as getPageBySlugApi,
  type PageResponse,
  getSettings as getSettingsApi,
  type SettingsResponse,
} from './api';

// Re-export types for use in pages
export type { 
  ProductCategoryResponse,
  CatalogResponse,
  ServiceCategoryResponse,
  ProductResponse,
  ProductListResponse,
  BannerResponse,
  ServiceResponse,
  ShowcaseResponse,
  HearingAidItemResponse,
  HomepageNewsItemResponse,
  PostResponse,
  PostCategoryResponse,
  FaqResponse,
  HomepageJourneyStepResponse,
  BrandResponse,
  PageResponse,
  SettingsResponse,
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
 * Get all catalogs - returns empty array if backend is down
 */
export async function getCatalogs(locale?: string): Promise<CatalogResponse[]> {
  return safeApiCall(
    () => getCatalogsApi(locale),
    [],
    'Failed to fetch catalogs',
  );
}

/**
 * Get catalog by slug - returns null if not found or backend is down
 * This allows pages to distinguish between "not found" and "backend down"
 */
export async function getCatalogBySlug(
  slug: string,
  locale?: string,
): Promise<CatalogResponse | null> {
  return safeApiCall(
    () => getCatalogBySlugApi(slug, locale),
    null,
    `Failed to fetch catalog: ${slug}`,
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
 * Get products - returns paginated response, or empty response if backend is down
 */
export async function getProducts(
  params?: Parameters<typeof getProductsApi>[0],
  locale?: string,
): Promise<ProductListResponse> {
  return safeApiCall(
    () => getProductsApi(params, locale),
    { items: [], total: 0, page: 1, pageSize: 12 },
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
 * Get post categories - returns empty array if backend is down
 */
export async function getPostCategories(
  locale?: string,
  section?: string,
): Promise<PostCategoryResponse[]> {
  return safeApiCall(
    () => getPostCategoriesApi(locale, section),
    [],
    'Failed to fetch post categories',
  );
}

/**
 * Get post category by slug - returns null if not found or backend is down
 */
export async function getPostCategoryBySlug(
  slug: string,
  locale?: string,
): Promise<PostCategoryResponse | null> {
  return safeApiCall(
    () => getPostCategoryBySlugApi(slug, locale),
    null,
    `Failed to fetch post category: ${slug}`,
  );
}

/**
 * Get posts - returns empty array if backend is down
 */
export async function getPosts(
  locale?: string,
  publicOnly = true,
  categoryId?: string,
  postType?: string,
): Promise<PostResponse[]> {
  return safeApiCall(
    () => getPostsApi(locale, publicOnly, categoryId, postType),
    [],
    'Failed to fetch posts',
  );
}

/**
 * Get post by slug - returns null if not found or backend is down
 */
export async function getPostBySlug(
  slug: string,
  locale?: string,
): Promise<PostResponse | null> {
  return safeApiCall(
    () => getPostBySlugApi(slug, locale),
    null,
    `Failed to fetch post: ${slug}`,
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
 * Get brands - returns empty array if backend is down
 */
export async function getBrands(
  locale?: string,
): Promise<BrandResponse[]> {
  return safeApiCall(
    () => getBrandsApi(locale),
    [],
    'Failed to fetch brands',
  );
}

/**
 * Get all branches - returns empty array if backend is down
 */
export async function getBranches(
  locale?: string,
): Promise<BranchResponse[]> {
  return safeApiCall(
    () => getBranchesApi(locale),
    [],
    'Failed to fetch branches',
  );
}

/**
 * Get branch by slug - returns null if not found or backend is down
 */
export async function getBranchBySlug(
  slug: string,
  locale?: string,
): Promise<BranchResponse | null> {
  return safeApiCall(
    () => getBranchBySlugApi(slug, locale),
    null,
    'Failed to fetch branch',
  );
}

/**
 * Get all doctors - returns empty array if backend is down
 */
export async function getDoctors(
  locale?: string,
): Promise<DoctorResponse[]> {
  return safeApiCall(
    () => getDoctorsApi(locale),
    [],
    'Failed to fetch doctors',
  );
}

/**
 * Get doctor by slug - returns null if backend is down or not found
 */
export async function getDoctorBySlug(
  slug: string,
  locale?: string,
): Promise<DoctorResponse | null> {
  return safeApiCall(
    () => getDoctorBySlugApi(slug, locale),
    null,
    `Failed to fetch doctor: ${slug}`,
  );
}

/**
 * Get page by slug - returns null if not found or backend is down
 */
export async function getPageBySlug(
  slug: string,
  locale?: string,
): Promise<PageResponse | null> {
  return safeApiCall(
    () => getPageBySlugApi(slug, locale),
    null,
    `Failed to fetch page: ${slug}`,
  );
}

/**
 * Get settings - returns default settings if backend is down
 */
export async function getSettings(
  locale?: string,
): Promise<SettingsResponse> {
  return safeApiCall(
    () => getSettingsApi(locale),
    {
      id: 'singleton',
      phonePrimary: '1385',
      phoneSecondary: '+998 71 202 14 41',
      brandPrimary: '#F07E22',
      brandAccent: '#3F3091',
      catalogHeroImageId: null,
      catalogHeroImage: null,
      logoId: null,
      logo: null,
      updatedAt: new Date().toISOString(),
    },
    'Failed to fetch settings',
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

