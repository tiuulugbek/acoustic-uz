/**
 * Server-side API utilities
 * These functions wrap the regular API calls with error handling
 * to ensure the UI always renders, even when the backend is down.
 */
import { getProducts as getProductsApi, type ProductCategoryResponse, type CatalogResponse, type ServiceCategoryResponse, type ServiceDetailResponse, type ProductResponse, type ProductListResponse, type BannerResponse, type ServiceResponse, type ShowcaseResponse, type HearingAidItemResponse, type HomepageNewsItemResponse, type PostResponse, type PostCategoryResponse, type FaqResponse, type HomepageJourneyStepResponse, type BrandResponse, type BranchResponse, type DoctorResponse, type PageResponse, type SettingsResponse } from './api';
export type { ProductCategoryResponse, CatalogResponse, ServiceCategoryResponse, ProductResponse, ProductListResponse, BannerResponse, ServiceResponse, ShowcaseResponse, HearingAidItemResponse, HomepageNewsItemResponse, PostResponse, PostCategoryResponse, FaqResponse, HomepageJourneyStepResponse, BrandResponse, PageResponse, SettingsResponse, } from './api';
/**
 * Get category by slug - returns null if not found or backend is down
 * This allows pages to distinguish between "not found" and "backend down"
 */
export declare function getCategoryBySlug(slug: string, locale?: string): Promise<ProductCategoryResponse | null>;
/**
 * Get all catalogs - returns empty array if backend is down
 */
export declare function getCatalogs(locale?: string): Promise<CatalogResponse[]>;
/**
 * Get catalog by slug - returns null if not found or backend is down
 * This allows pages to distinguish between "not found" and "backend down"
 */
export declare function getCatalogBySlug(slug: string, locale?: string): Promise<CatalogResponse | null>;
/**
 * Get service by slug - returns null if not found or backend is down
 */
export declare function getServiceBySlug(slug: string, locale?: string): Promise<ServiceDetailResponse | null>;
/**
 * Get product by slug - returns null if not found or backend is down
 */
export declare function getProductBySlug(slug: string, locale?: string): Promise<ProductResponse | null>;
/**
 * Get products - returns paginated response, or empty response if backend is down
 */
export declare function getProducts(params?: Parameters<typeof getProductsApi>[0], locale?: string): Promise<ProductListResponse>;
/**
 * Get product categories - returns empty array if backend is down
 */
export declare function getProductCategories(locale?: string): Promise<ProductCategoryResponse[]>;
/**
 * Get public banners - returns empty array if backend is down
 */
export declare function getPublicBanners(locale?: string): Promise<BannerResponse[]>;
/**
 * Get homepage services - returns empty array if backend is down
 */
export declare function getHomepageServices(locale?: string): Promise<ServiceResponse[]>;
/**
 * Get all public services - returns empty array if backend is down
 */
export declare function getServices(locale?: string): Promise<ServiceResponse[]>;
/**
 * Get showcase (Interacoustics) - returns null if backend is down
 */
export declare function getShowcase(name: string, locale?: string): Promise<ShowcaseResponse | null>;
/**
 * Get homepage hearing aid items (Product Catalog) - returns empty array if backend is down
 */
export declare function getHomepageHearingAidItems(locale?: string): Promise<HearingAidItemResponse[]>;
/**
 * Get homepage news - returns empty array if backend is down
 */
export declare function getHomepageNews(locale?: string): Promise<HomepageNewsItemResponse[]>;
/**
 * Get post categories - returns empty array if backend is down
 */
export declare function getPostCategories(locale?: string, section?: string): Promise<PostCategoryResponse[]>;
/**
 * Get posts - returns empty array if backend is down
 */
export declare function getPosts(locale?: string, publicOnly?: boolean, categoryId?: string, postType?: string): Promise<PostResponse[]>;
/**
 * Get post by slug - returns null if not found or backend is down
 */
export declare function getPostBySlug(slug: string, locale?: string): Promise<PostResponse | null>;
/**
 * Get public FAQ - returns empty array if backend is down
 */
export declare function getPublicFaq(locale?: string): Promise<FaqResponse[]>;
/**
 * Get homepage journey steps - returns empty array if backend is down
 */
export declare function getHomepageJourney(locale?: string): Promise<HomepageJourneyStepResponse[]>;
/**
 * Get service categories - returns empty array if backend is down
 */
export declare function getServiceCategories(locale?: string): Promise<ServiceCategoryResponse[]>;
/**
 * Get service category by slug - returns null if not found or backend is down
 */
export declare function getServiceCategoryBySlug(slug: string, locale?: string): Promise<ServiceCategoryResponse | null>;
/**
 * Get brands - returns empty array if backend is down
 */
export declare function getBrands(locale?: string): Promise<BrandResponse[]>;
/**
 * Get all branches - returns empty array if backend is down
 */
export declare function getBranches(locale?: string): Promise<BranchResponse[]>;
/**
 * Get branch by slug - returns null if not found or backend is down
 */
export declare function getBranchBySlug(slug: string, locale?: string): Promise<BranchResponse | null>;
/**
 * Get all doctors - returns empty array if backend is down
 */
export declare function getDoctors(locale?: string): Promise<DoctorResponse[]>;
/**
 * Get doctor by slug - returns null if backend is down or not found
 */
export declare function getDoctorBySlug(slug: string, locale?: string): Promise<DoctorResponse | null>;
/**
 * Get page by slug - returns null if not found or backend is down
 */
export declare function getPageBySlug(slug: string, locale?: string): Promise<PageResponse | null>;
/**
 * Get settings - returns default settings if backend is down
 */
export declare function getSettings(locale?: string): Promise<SettingsResponse>;
/**
 * Check if backend is available
 * Returns true if backend responds, false otherwise
 */
export declare function isBackendAvailable(): Promise<boolean>;
//# sourceMappingURL=api-server.d.ts.map