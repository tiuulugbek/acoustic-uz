"use strict";
/**
 * Server-side API utilities
 * These functions wrap the regular API calls with error handling
 * to ensure the UI always renders, even when the backend is down.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryBySlug = getCategoryBySlug;
exports.getCatalogs = getCatalogs;
exports.getCatalogBySlug = getCatalogBySlug;
exports.getServiceBySlug = getServiceBySlug;
exports.getProductBySlug = getProductBySlug;
exports.getProducts = getProducts;
exports.getProductCategories = getProductCategories;
exports.getPublicBanners = getPublicBanners;
exports.getHomepageServices = getHomepageServices;
exports.getServices = getServices;
exports.getShowcase = getShowcase;
exports.getHomepageHearingAidItems = getHomepageHearingAidItems;
exports.getHomepageNews = getHomepageNews;
exports.getPostCategories = getPostCategories;
exports.getPosts = getPosts;
exports.getPostBySlug = getPostBySlug;
exports.getPublicFaq = getPublicFaq;
exports.getHomepageJourney = getHomepageJourney;
exports.getServiceCategories = getServiceCategories;
exports.getServiceCategoryBySlug = getServiceCategoryBySlug;
exports.getBrands = getBrands;
exports.getBranches = getBranches;
exports.getBranchBySlug = getBranchBySlug;
exports.getDoctors = getDoctors;
exports.getDoctorBySlug = getDoctorBySlug;
exports.getPageBySlug = getPageBySlug;
exports.getSettings = getSettings;
exports.isBackendAvailable = isBackendAvailable;
const api_1 = require("./api");
/**
 * Safely fetch data from API, returning fallback on any error
 * This ensures server-side rendering never crashes, even when backend is down
 */
async function safeApiCall(apiCall, fallback, errorMessage) {
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
    }
    catch (error) {
        // Log error but don't throw - always return fallback
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage) {
            console.warn(`[API Server] ${errorMessage}:`, message);
        }
        else {
            console.warn(`[API Server] API call failed:`, message);
        }
        return fallback;
    }
}
/**
 * Get category by slug - returns null if not found or backend is down
 * This allows pages to distinguish between "not found" and "backend down"
 */
async function getCategoryBySlug(slug, locale) {
    return safeApiCall(() => (0, api_1.getCategoryBySlug)(slug, locale), null, `Failed to fetch category: ${slug}`);
}
/**
 * Get all catalogs - returns empty array if backend is down
 */
async function getCatalogs(locale) {
    return safeApiCall(() => (0, api_1.getCatalogs)(locale), [], 'Failed to fetch catalogs');
}
/**
 * Get catalog by slug - returns null if not found or backend is down
 * This allows pages to distinguish between "not found" and "backend down"
 */
async function getCatalogBySlug(slug, locale) {
    return safeApiCall(() => (0, api_1.getCatalogBySlug)(slug, locale), null, `Failed to fetch catalog: ${slug}`);
}
/**
 * Get service by slug - returns null if not found or backend is down
 */
async function getServiceBySlug(slug, locale) {
    return safeApiCall(() => (0, api_1.getServiceBySlug)(slug, locale), null, `Failed to fetch service: ${slug}`);
}
/**
 * Get product by slug - returns null if not found or backend is down
 */
async function getProductBySlug(slug, locale) {
    return safeApiCall(() => (0, api_1.getProductBySlug)(slug, locale), null, `Failed to fetch product: ${slug}`);
}
/**
 * Get products - returns paginated response, or empty response if backend is down
 */
async function getProducts(params, locale) {
    return safeApiCall(() => (0, api_1.getProducts)(params, locale), { items: [], total: 0, page: 1, pageSize: 12 }, 'Failed to fetch products');
}
/**
 * Get product categories - returns empty array if backend is down
 */
async function getProductCategories(locale) {
    return safeApiCall(() => (0, api_1.getProductCategories)(locale), [], 'Failed to fetch product categories');
}
/**
 * Get public banners - returns empty array if backend is down
 */
async function getPublicBanners(locale) {
    return safeApiCall(() => (0, api_1.getPublicBanners)(locale), [], 'Failed to fetch banners');
}
/**
 * Get homepage services - returns empty array if backend is down
 */
async function getHomepageServices(locale) {
    return safeApiCall(() => (0, api_1.getHomepageServices)(locale), [], 'Failed to fetch homepage services');
}
/**
 * Get all public services - returns empty array if backend is down
 */
async function getServices(locale) {
    return safeApiCall(() => (0, api_1.getPublicServices)(locale), [], 'Failed to fetch services');
}
/**
 * Get showcase (Interacoustics) - returns null if backend is down
 */
async function getShowcase(name, locale) {
    return safeApiCall(() => (0, api_1.getShowcase)(name, locale), null, `Failed to fetch showcase: ${name}`);
}
/**
 * Get homepage hearing aid items (Product Catalog) - returns empty array if backend is down
 */
async function getHomepageHearingAidItems(locale) {
    return safeApiCall(() => (0, api_1.getHomepageHearingAidItems)(locale), [], 'Failed to fetch homepage hearing aid items');
}
/**
 * Get homepage news - returns empty array if backend is down
 */
async function getHomepageNews(locale) {
    return safeApiCall(() => (0, api_1.getHomepageNews)(locale), [], 'Failed to fetch homepage news');
}
/**
 * Get post categories - returns empty array if backend is down
 */
async function getPostCategories(locale, section) {
    return safeApiCall(() => (0, api_1.getPostCategories)(locale, section), [], 'Failed to fetch post categories');
}
/**
 * Get posts - returns empty array if backend is down
 */
async function getPosts(locale, publicOnly = true, categoryId, postType) {
    return safeApiCall(() => (0, api_1.getPosts)(locale, publicOnly, categoryId, postType), [], 'Failed to fetch posts');
}
/**
 * Get post by slug - returns null if not found or backend is down
 */
async function getPostBySlug(slug, locale) {
    return safeApiCall(() => (0, api_1.getPostBySlug)(slug, locale), null, `Failed to fetch post: ${slug}`);
}
/**
 * Get public FAQ - returns empty array if backend is down
 */
async function getPublicFaq(locale) {
    return safeApiCall(() => (0, api_1.getPublicFaq)(locale), [], 'Failed to fetch FAQ');
}
/**
 * Get homepage journey steps - returns empty array if backend is down
 */
async function getHomepageJourney(locale) {
    return safeApiCall(() => (0, api_1.getHomepageJourney)(locale), [], 'Failed to fetch homepage journey');
}
/**
 * Get service categories - returns empty array if backend is down
 */
async function getServiceCategories(locale) {
    return safeApiCall(() => (0, api_1.getServiceCategories)(locale), [], 'Failed to fetch service categories');
}
/**
 * Get service category by slug - returns null if not found or backend is down
 */
async function getServiceCategoryBySlug(slug, locale) {
    return safeApiCall(() => (0, api_1.getServiceCategoryBySlug)(slug, locale), null, `Failed to fetch service category: ${slug}`);
}
/**
 * Get brands - returns empty array if backend is down
 */
async function getBrands(locale) {
    return safeApiCall(() => (0, api_1.getBrands)(locale), [], 'Failed to fetch brands');
}
/**
 * Get all branches - returns empty array if backend is down
 */
async function getBranches(locale) {
    return safeApiCall(() => (0, api_1.getBranches)(locale), [], 'Failed to fetch branches');
}
/**
 * Get branch by slug - returns null if not found or backend is down
 */
async function getBranchBySlug(slug, locale) {
    return safeApiCall(() => (0, api_1.getBranchBySlug)(slug, locale), null, 'Failed to fetch branch');
}
/**
 * Get all doctors - returns empty array if backend is down
 */
async function getDoctors(locale) {
    return safeApiCall(() => (0, api_1.getDoctors)(locale), [], 'Failed to fetch doctors');
}
/**
 * Get doctor by slug - returns null if backend is down or not found
 */
async function getDoctorBySlug(slug, locale) {
    return safeApiCall(() => (0, api_1.getDoctorBySlug)(slug, locale), null, `Failed to fetch doctor: ${slug}`);
}
/**
 * Get page by slug - returns null if not found or backend is down
 */
async function getPageBySlug(slug, locale) {
    return safeApiCall(() => (0, api_1.getPageBySlug)(slug, locale), null, `Failed to fetch page: ${slug}`);
}
/**
 * Get settings - returns default settings if backend is down
 */
async function getSettings(locale) {
    return safeApiCall(() => (0, api_1.getSettings)(locale), {
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
    }, 'Failed to fetch settings');
}
/**
 * Check if backend is available
 * Returns true if backend responds, false otherwise
 */
async function isBackendAvailable() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/banners?public=true`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Short timeout to avoid blocking
            signal: AbortSignal.timeout(2000),
        });
        return response.ok;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=api-server.js.map