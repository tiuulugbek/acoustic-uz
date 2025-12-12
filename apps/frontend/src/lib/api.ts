// Get API base URL - use env var if set, otherwise detect from hostname
// This function is called at runtime to ensure correct URL detection
function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Runtime detection: if running on localhost, use localhost API, otherwise use production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
  }
  
  // Default to production API URL (for SSR and production)
  return 'https://a.acoustic.uz/api';
}

// Use a getter function instead of a constant to ensure runtime detection
const getApiBaseUrl = () => getApiBase();

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
 * Uses appropriate cache strategy based on environment:
 * - Server-side: Uses revalidate for ISR (Incremental Static Regeneration)
 * - Client-side: Uses no-store to prevent stale data
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
    // Then properly append to API base URL
    const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    // Get API base URL at runtime to ensure correct detection
    const apiBase = getApiBaseUrl();
    // Ensure API base URL ends with / for proper URL construction
    const baseUrl = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
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
      // Add cache-busting timestamp for all homepage endpoints, menu endpoints, and products to ensure fresh data
      const isHomepageEndpoint = path.includes('/homepage/') || 
                                  path.includes('/banners') ||
                                  path.includes('/faq') ||
                                  path.includes('/showcases');
      const isMenuEndpoint = path.includes('/menus/');
      const isCategoryEndpoint = path.includes('/product-categories');
      const isProductEndpoint = path.includes('/products');
      let finalUrl = url.toString();
      if (isHomepageEndpoint || isMenuEndpoint || isCategoryEndpoint || isProductEndpoint) {
        // Add cache-busting query parameter
        const separator = url.search ? '&' : '?';
        finalUrl = `${finalUrl}${separator}_t=${Date.now()}`;
      }
      
      // Determine cache strategy based on environment
      // Server-side: Use revalidate for ISR (works with static generation)
      // Client-side: Use no-store to prevent stale data
      const isServer = typeof window === 'undefined';
      const cacheOptions = isServer 
        ? { next: { revalidate: 300 } } // 5 minutes revalidation for ISR to ensure updates are reflected quickly
        : { cache: 'no-store' as RequestCache }; // No cache for client-side
      
      const response = await fetch(finalUrl, {
        ...init,
        headers,
        ...cacheOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Throw errors when backend is unavailable - frontend depends fully on backend
        throw new ApiFetchError(response.status, `Request failed: ${response.status} ${response.statusText} for ${path}`);
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
    // Re-throw all errors - frontend depends fully on backend
    // If backend is down, let React Query handle the error state
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    // Enhanced error logging for debugging
    const apiBase = getApiBaseUrl();
    console.error(`[API] ❌ Failed to fetch ${path}:`, {
      error: errorMessage,
      errorType: errorName,
      apiBase: apiBase,
      fullUrl: `${apiBase}/${path}`,
      locale: locale || 'not provided',
    });
    
    // Check if it's a network error (backend not running)
    if (errorName === 'AbortError' || errorMessage.includes('timeout') || errorMessage.includes('Failed to fetch')) {
      console.error(`[API] ⚠️ Backend appears to be unavailable or unreachable at ${apiBase}`);
      throw new Error(`Backend unavailable: ${errorMessage}`);
    }
    
    // Re-throw the error
    throw error;
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

export interface CatalogResponse {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz?: string | null;
  description_ru?: string | null;
  icon?: string | null;
  image?: MediaResponse | null;
  order: number;
  status: string;
  showOnHomepage?: boolean;
}

export const getCatalogs = (locale?: string, showOnHomepage?: boolean) => {
  const params = new URLSearchParams();
  params.append('public', 'true');
  if (showOnHomepage !== undefined) {
    params.append('showOnHomepage', showOnHomepage.toString());
  }
  return fetchJson<CatalogResponse[]>(`/catalogs?${params.toString()}`, locale);
};

export const getCatalogBySlug = async (slug: string, locale?: string): Promise<CatalogResponse | null> => {
  try {
    // First try direct API endpoint
    const directResult = await fetchJson<CatalogResponse>(`/catalogs/slug/${slug}?public=true`, locale);
    if (directResult) {
      return directResult;
    }
  } catch {
    // Fallback to searching all catalogs
  }
  
  // Fallback: get all catalogs and find by slug
  const catalogs = await getCatalogs(locale);
  if (!catalogs || catalogs.length === 0) {
    return null;
  }
  return catalogs.find((cat) => cat.slug === slug) ?? null;
};

export interface ServiceCategoryResponse {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz?: string | null;
  description_ru?: string | null;
  icon?: string | null;
  image?: MediaResponse | null;
  parentId?: string | null;
  parent?: ServiceCategoryResponse | null;
  children?: ServiceCategoryResponse[] | null;
  services?: ServiceResponse[] | null;
  order: number;
  status: string;
}

export interface ServiceCategoriesListResponse {
  items: ServiceCategoryResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export const getServiceCategories = async (
  locale?: string,
  limit?: number,
  offset?: number,
): Promise<ServiceCategoryResponse[]> => {
  const queryParams = new URLSearchParams({ public: 'true' });
  if (limit !== undefined) queryParams.set('limit', limit.toString());
  if (offset !== undefined) queryParams.set('offset', offset.toString());
  
  const response = await fetchJson<ServiceCategoriesListResponse | ServiceCategoryResponse[]>(
    `/service-categories?${queryParams.toString()}`,
    locale,
  );
  
  // Handle both paginated and non-paginated responses for backward compatibility
  if (Array.isArray(response)) {
    return response;
  }
  return response.items;
};

export const getServiceCategoryBySlug = async (slug: string, locale?: string): Promise<ServiceCategoryResponse | null> => {
  try {
    // First try direct API endpoint (if backend supports it)
    const directResult = await fetchJson<ServiceCategoryResponse>(`/service-categories/slug/${slug}?public=true`, locale);
    if (directResult) {
      return directResult;
    }
  } catch (error) {
    // Fallback to fetching all and finding by slug
  }
  // Fallback: fetch all categories and find by slug
  const categories = await getServiceCategories(locale);
  if (!categories || categories.length === 0) {
    return null;
  }
  return categories.find((cat) => cat.slug === slug) ?? null;
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
  catalogId?: string;
  productType?: string;
  search?: string;
  audience?: string;
  formFactor?: string;
  signalProcessing?: string;
  powerLevel?: string;
  hearingLossLevel?: string;
  smartphoneCompatibility?: string;
  paymentOption?: string;
  availabilityStatus?: string;
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}

export interface ProductListResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export const getProducts = (params?: ProductListParams, locale?: string): Promise<ProductListResponse> => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.brandId) query.set('brandId', params.brandId);
  if (params?.categoryId) query.set('categoryId', params.categoryId);
  if (params?.catalogId) query.set('catalogId', params.catalogId);
  if (params?.productType) query.set('productType', params.productType);
  if (params?.search) query.set('search', params.search);
  if (params?.audience) query.set('audience', params.audience);
  if (params?.formFactor) query.set('formFactor', params.formFactor);
  if (params?.signalProcessing) query.set('signalProcessing', params.signalProcessing);
  if (params?.powerLevel) query.set('powerLevel', params.powerLevel);
  if (params?.hearingLossLevel) query.set('hearingLossLevel', params.hearingLossLevel);
  if (params?.smartphoneCompatibility) query.set('smartphoneCompatibility', params.smartphoneCompatibility);
  if (params?.paymentOption) query.set('paymentOption', params.paymentOption);
  if (params?.availabilityStatus) query.set('availabilityStatus', params.availabilityStatus);
  if (params?.limit !== undefined) query.set('limit', params.limit.toString());
  if (params?.offset !== undefined) query.set('offset', params.offset.toString());
  if (params?.sort) query.set('sort', params.sort);

  const queryString = query.toString();
  const path = queryString ? `/products?${queryString}` : '/products';
  return fetchJson<ProductListResponse>(path, locale);
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

export interface DoctorResponse {
  id: string;
  name_uz: string;
  name_ru: string;
  position_uz?: string | null;
  position_ru?: string | null;
  experience_uz?: string | null;
  experience_ru?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  slug: string;
  image?: MediaResponse | null;
  imageId?: string | null;
  branchIds?: string[];
  patientTypes?: string[];
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostResponse {
  id: string;
  title_uz: string;
  title_ru: string;
  body_uz: string;
  body_ru: string;
  slug: string;
  category?: PostCategoryResponse | null;
  categoryId?: string | null;
  author?: DoctorResponse | null;
  authorId?: string | null;
  excerpt_uz?: string | null;
  excerpt_ru?: string | null;
  cover?: MediaResponse | null;
  coverId?: string | null;
  postType?: 'article' | 'news';
  tags: string[];
  status: string;
  publishAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostCategoryResponse {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz?: string | null;
  description_ru?: string | null;
  section?: string | null; // "patients" or "children"
  imageId?: string | null;
  image?: MediaResponse | null;
  order?: number;
  status?: string;
}

export const getPostCategories = (locale?: string, section?: string) => {
  const params = new URLSearchParams();
  if (section) params.append('section', section);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchJson<PostCategoryResponse[]>(`/post-categories${query}`, locale);
};

export const getPosts = (locale?: string, publicOnly = true, categoryId?: string, postType?: string) => {
  const params = new URLSearchParams();
  if (publicOnly) params.append('public', 'true');
  if (categoryId) params.append('categoryId', categoryId);
  if (postType) params.append('postType', postType);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchJson<PostResponse[]>(`/posts${query}`, locale);
};

export const getPostBySlug = (slug: string, locale?: string, publicOnly = true) => {
  const params = new URLSearchParams();
  if (publicOnly) params.append('public', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchJson<PostResponse>(`/posts/slug/${slug}${query}`, locale);
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

export interface SidebarSection {
  id: string;
  title_uz: string;
  title_ru: string;
  link: string;
  icon?: string;
  imageId?: string | null;
  order: number;
}

export interface SettingsResponse {
  id: string;
  phonePrimary?: string | null;
  phoneSecondary?: string | null;
  email?: string | null;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  telegramButtonBotToken?: string | null;
  telegramButtonBotUsername?: string | null;
  telegramButtonMessage_uz?: string | null;
  telegramButtonMessage_ru?: string | null;
  brandPrimary?: string | null;
  brandAccent?: string | null;
  featureFlags?: unknown;
  socialLinks?: unknown;
  catalogHeroImageId?: string | null;
  catalogHeroImage?: MediaResponse | null;
  logoId?: string | null;
  logo?: MediaResponse | null;
  faviconId?: string | null;
  favicon?: MediaResponse | null;
  sidebarSections?: SidebarSection[] | null;
  sidebarBrandIds?: string[];
  sidebarConfigs?: {
    catalog?: { sections?: SidebarSection[]; brandIds?: string[] };
    products?: { sections?: SidebarSection[]; brandIds?: string[] };
    services?: { sections?: SidebarSection[]; brandIds?: string[] };
    posts?: { sections?: SidebarSection[]; brandIds?: string[] };
  } | null;
  updatedAt: string;
}

export const getSettings = (locale?: string) => {
  return fetchJson<SettingsResponse>('/settings', locale);
};

export interface BranchResponse {
  id: string;
  name_uz: string;
  name_ru: string;
  slug?: string | null;
  address_uz: string;
  address_ru: string;
  phone: string;
  phones: string[];
  image?: MediaResponse | null;
  map_iframe?: string | null;
  tour3d_iframe?: string | null;
  tour3d_config?: any | null; // Pannellum tour configuration (JSON)
  latitude?: number | null;
  longitude?: number | null;
  workingHours_uz?: string | null;
  workingHours_ru?: string | null;
  serviceIds?: string[];
  order: number;
}

export const getBranches = (locale?: string) => {
  return fetchJson<BranchResponse[]>('/branches', locale);
};

export const getBranchBySlug = (slug: string, locale?: string) => {
  return fetchJson<BranchResponse>(`/branches/slug/${slug}`, locale);
};

export interface DoctorResponse {
  id: string;
  name_uz: string;
  name_ru: string;
  position_uz?: string | null;
  position_ru?: string | null;
  experience_uz?: string | null;
  experience_ru?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  slug: string;
  image?: MediaResponse | null;
  order: number;
  status: string;
}

export const getDoctors = (locale?: string) => {
  return fetchJson<DoctorResponse[]>('/doctors?public=true', locale);
};

export const getDoctorBySlug = (slug: string, locale?: string) => {
  return fetchJson<DoctorResponse>(`/doctors/slug/${slug}?public=true`, locale);
};

export interface PageResponse {
  id: string;
  slug: string;
  title_uz: string;
  title_ru: string;
  body_uz?: string | null;
  body_ru?: string | null;
  metaTitle_uz?: string | null;
  metaTitle_ru?: string | null;
  metaDescription_uz?: string | null;
  metaDescription_ru?: string | null;
  galleryIds?: string[];
  gallery?: MediaResponse[];
  videoUrl?: string | null;
  usefulArticleSlugs?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const getPageBySlug = (slug: string, locale?: string): Promise<PageResponse | null> => {
  return fetchJson<PageResponse | null>(`/pages/slug/${slug}`, locale);
};

export interface SearchResponse {
  products: ProductResponse[];
  services: ServiceResponse[];
  posts: PostResponse[];
}

export const search = (query: string, locale?: string): Promise<SearchResponse> => {
  const params = new URLSearchParams();
  params.append('q', query);
  return fetchJson<SearchResponse>(`/search?${params.toString()}`, locale);
};

export interface CreateLeadRequest {
  name: string;
  phone: string;
  email?: string | null;
  source?: string;
  message?: string;
  productId?: string | null;
}

export interface LeadResponse {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  source?: string | null;
  message?: string | null;
  productId?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const createLead = async (data: CreateLeadRequest, locale?: string): Promise<LeadResponse> => {
  const response = await fetch(`${getApiBaseUrl()}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(locale ? { 'X-Locale': locale } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiFetchError(response.status, errorText || 'Failed to create lead');
  }

  return response.json();
};

export interface HearingTestRequest {
  name?: string;
  phone?: string;
  email?: string;
  deviceType: 'speaker' | 'headphone';
  volumeLevel?: number;
  leftEarResults: Record<string, boolean>;
  rightEarResults: Record<string, boolean>;
}

export interface HearingTestResponse {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  deviceType: string;
  volumeLevel?: number | null;
  leftEarResults: Record<string, boolean>;
  rightEarResults: Record<string, boolean>;
  leftEarScore?: number | null;
  rightEarScore?: number | null;
  overallScore?: number | null;
  leftEarLevel?: string | null;
  rightEarLevel?: string | null;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const submitHearingTest = async (data: HearingTestRequest, locale?: string): Promise<HearingTestResponse> => {
  const response = await fetch(`${getApiBaseUrl()}/hearing-test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(locale ? { 'X-Locale': locale } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiFetchError(response.status, errorText || 'Failed to submit hearing test');
  }

  return response.json();
};
