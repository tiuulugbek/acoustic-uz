"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitHearingTest = exports.createLead = exports.search = exports.getPageBySlug = exports.getDoctorBySlug = exports.getDoctors = exports.getBranchBySlug = exports.getBranches = exports.getSettings = exports.getBrands = exports.getHomepageJourney = exports.getPublicFaq = exports.getPostBySlug = exports.getPosts = exports.getPostCategories = exports.getHomepageNews = exports.getHomepageHearingAidItems = exports.getProducts = exports.getProductBySlug = exports.getShowcase = exports.getServiceBySlug = exports.getMenu = exports.getCategoryBySlug = exports.getServiceCategoryBySlug = exports.getServiceCategories = exports.getCatalogBySlug = exports.getCatalogs = exports.getProductCategories = exports.getHomepageServices = exports.getPublicServices = exports.getPublicBanners = exports.ApiFetchError = void 0;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
class ApiFetchError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.ApiFetchError = ApiFetchError;
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
async function fetchJson(path, locale, init) {
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
        const headers = {
            'Content-Type': 'application/json',
        };
        // Merge existing headers from init
        if (init?.headers) {
            if (init.headers instanceof Headers) {
                init.headers.forEach((value, key) => {
                    headers[key] = value;
                });
            }
            else if (Array.isArray(init.headers)) {
                init.headers.forEach(([key, value]) => {
                    headers[key] = value;
                });
            }
            else {
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
                : { cache: 'no-store' }; // No cache for client-side
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
                return undefined;
            }
            return response.json();
        }
        catch (fetchError) {
            clearTimeout(timeoutId);
            // Re-throw AbortError as network error
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw fetchError;
        }
    }
    catch (error) {
        // Re-throw all errors - frontend depends fully on backend
        // If backend is down, let React Query handle the error state
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorName = error instanceof Error ? error.name : 'Unknown';
        // Enhanced error logging for debugging
        console.error(`[API] ❌ Failed to fetch ${path}:`, {
            error: errorMessage,
            errorType: errorName,
            apiBase: API_BASE,
            fullUrl: `${API_BASE}/${path}`,
            locale: locale || 'not provided',
        });
        // Check if it's a network error (backend not running)
        if (errorName === 'AbortError' || errorMessage.includes('timeout') || errorMessage.includes('Failed to fetch')) {
            console.error(`[API] ⚠️ Backend appears to be unavailable or unreachable at ${API_BASE}`);
            throw new Error(`Backend unavailable: ${errorMessage}`);
        }
        // Re-throw the error
        throw error;
    }
}
const getPublicBanners = (locale) => {
    const url = '/banners?public=true';
    return fetchJson(url, locale);
};
exports.getPublicBanners = getPublicBanners;
const getPublicServices = (locale) => {
    const url = '/services?public=true';
    return fetchJson(url, locale);
};
exports.getPublicServices = getPublicServices;
const getHomepageServices = (locale) => {
    const url = '/homepage/services';
    return fetchJson(url, locale);
};
exports.getHomepageServices = getHomepageServices;
const getProductCategories = (locale) => {
    return fetchJson('/product-categories', locale);
};
exports.getProductCategories = getProductCategories;
const getCatalogs = (locale, showOnHomepage) => {
    const params = new URLSearchParams();
    params.append('public', 'true');
    if (showOnHomepage !== undefined) {
        params.append('showOnHomepage', showOnHomepage.toString());
    }
    return fetchJson(`/catalogs?${params.toString()}`, locale);
};
exports.getCatalogs = getCatalogs;
const getCatalogBySlug = async (slug, locale) => {
    try {
        // First try direct API endpoint
        const directResult = await fetchJson(`/catalogs/slug/${slug}?public=true`, locale);
        if (directResult) {
            return directResult;
        }
    }
    catch {
        // Fallback to searching all catalogs
    }
    // Fallback: get all catalogs and find by slug
    const catalogs = await (0, exports.getCatalogs)(locale);
    if (!catalogs || catalogs.length === 0) {
        return null;
    }
    return catalogs.find((cat) => cat.slug === slug) ?? null;
};
exports.getCatalogBySlug = getCatalogBySlug;
const getServiceCategories = async (locale, limit, offset) => {
    const queryParams = new URLSearchParams({ public: 'true' });
    if (limit !== undefined)
        queryParams.set('limit', limit.toString());
    if (offset !== undefined)
        queryParams.set('offset', offset.toString());
    const response = await fetchJson(`/service-categories?${queryParams.toString()}`, locale);
    // Handle both paginated and non-paginated responses for backward compatibility
    if (Array.isArray(response)) {
        return response;
    }
    return response.items;
};
exports.getServiceCategories = getServiceCategories;
const getServiceCategoryBySlug = async (slug, locale) => {
    try {
        // First try direct API endpoint (if backend supports it)
        const directResult = await fetchJson(`/service-categories/slug/${slug}?public=true`, locale);
        if (directResult) {
            return directResult;
        }
    }
    catch (error) {
        // Fallback to fetching all and finding by slug
    }
    // Fallback: fetch all categories and find by slug
    const categories = await (0, exports.getServiceCategories)(locale);
    if (!categories || categories.length === 0) {
        return null;
    }
    return categories.find((cat) => cat.slug === slug) ?? null;
};
exports.getServiceCategoryBySlug = getServiceCategoryBySlug;
const getCategoryBySlug = async (slug, locale) => {
    try {
        // First try direct API endpoint (if backend supports it)
        const directResult = await fetchJson(`/product-categories/slug/${slug}`, locale);
        if (directResult) {
            return directResult;
        }
    }
    catch {
        // Fallback to searching all categories
    }
    // Fallback: get all categories and find by slug
    const categories = await (0, exports.getProductCategories)(locale);
    if (!categories || categories.length === 0) {
        return null;
    }
    return categories.find((cat) => cat.slug === slug) ?? null;
};
exports.getCategoryBySlug = getCategoryBySlug;
const getMenu = (name, locale) => {
    return fetchJson(`/menus/${name}`, locale);
};
exports.getMenu = getMenu;
const getServiceBySlug = async (slug, locale) => {
    // fetchJson already handles errors gracefully and returns null for object endpoints
    return await fetchJson(`/services/slug/${slug}`, locale);
};
exports.getServiceBySlug = getServiceBySlug;
const getShowcase = (type, locale) => {
    // fetchJson already handles errors gracefully and returns null for object endpoints
    return fetchJson(`/showcases/${type}`, locale);
};
exports.getShowcase = getShowcase;
const getProductBySlug = (slug, locale) => {
    // fetchJson already handles errors gracefully and returns null for object endpoints
    return fetchJson(`/products/slug/${slug}`, locale);
};
exports.getProductBySlug = getProductBySlug;
const getProducts = (params, locale) => {
    const query = new URLSearchParams();
    if (params?.status)
        query.set('status', params.status);
    if (params?.brandId)
        query.set('brandId', params.brandId);
    if (params?.categoryId)
        query.set('categoryId', params.categoryId);
    if (params?.catalogId)
        query.set('catalogId', params.catalogId);
    if (params?.productType)
        query.set('productType', params.productType);
    if (params?.search)
        query.set('search', params.search);
    if (params?.audience)
        query.set('audience', params.audience);
    if (params?.formFactor)
        query.set('formFactor', params.formFactor);
    if (params?.signalProcessing)
        query.set('signalProcessing', params.signalProcessing);
    if (params?.powerLevel)
        query.set('powerLevel', params.powerLevel);
    if (params?.hearingLossLevel)
        query.set('hearingLossLevel', params.hearingLossLevel);
    if (params?.smartphoneCompatibility)
        query.set('smartphoneCompatibility', params.smartphoneCompatibility);
    if (params?.paymentOption)
        query.set('paymentOption', params.paymentOption);
    if (params?.availabilityStatus)
        query.set('availabilityStatus', params.availabilityStatus);
    if (params?.limit !== undefined)
        query.set('limit', params.limit.toString());
    if (params?.offset !== undefined)
        query.set('offset', params.offset.toString());
    if (params?.sort)
        query.set('sort', params.sort);
    const queryString = query.toString();
    const path = queryString ? `/products?${queryString}` : '/products';
    return fetchJson(path, locale);
};
exports.getProducts = getProducts;
const getHomepageHearingAidItems = (locale) => {
    return fetchJson('/homepage/hearing-aids', locale);
};
exports.getHomepageHearingAidItems = getHomepageHearingAidItems;
const getHomepageNews = (locale) => {
    return fetchJson('/homepage/news', locale);
};
exports.getHomepageNews = getHomepageNews;
const getPostCategories = (locale, section) => {
    const params = new URLSearchParams();
    if (section)
        params.append('section', section);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson(`/post-categories${query}`, locale);
};
exports.getPostCategories = getPostCategories;
const getPosts = (locale, publicOnly = true, categoryId, postType) => {
    const params = new URLSearchParams();
    if (publicOnly)
        params.append('public', 'true');
    if (categoryId)
        params.append('categoryId', categoryId);
    if (postType)
        params.append('postType', postType);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson(`/posts${query}`, locale);
};
exports.getPosts = getPosts;
const getPostBySlug = (slug, locale, publicOnly = true) => {
    const params = new URLSearchParams();
    if (publicOnly)
        params.append('public', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson(`/posts/slug/${slug}${query}`, locale);
};
exports.getPostBySlug = getPostBySlug;
const getPublicFaq = (locale) => {
    const url = '/faq?public=true';
    return fetchJson(url, locale);
};
exports.getPublicFaq = getPublicFaq;
const getHomepageJourney = (locale) => {
    return fetchJson('/homepage/journey', locale);
};
exports.getHomepageJourney = getHomepageJourney;
const getBrands = (locale) => {
    return fetchJson('/brands', locale);
};
exports.getBrands = getBrands;
const getSettings = (locale) => {
    return fetchJson('/settings', locale);
};
exports.getSettings = getSettings;
const getBranches = (locale) => {
    return fetchJson('/branches', locale);
};
exports.getBranches = getBranches;
const getBranchBySlug = (slug, locale) => {
    return fetchJson(`/branches/slug/${slug}`, locale);
};
exports.getBranchBySlug = getBranchBySlug;
const getDoctors = (locale) => {
    return fetchJson('/doctors?public=true', locale);
};
exports.getDoctors = getDoctors;
const getDoctorBySlug = (slug, locale) => {
    return fetchJson(`/doctors/slug/${slug}?public=true`, locale);
};
exports.getDoctorBySlug = getDoctorBySlug;
const getPageBySlug = (slug, locale) => {
    return fetchJson(`/pages/slug/${slug}`, locale);
};
exports.getPageBySlug = getPageBySlug;
const search = (query, locale) => {
    const params = new URLSearchParams();
    params.append('q', query);
    return fetchJson(`/search?${params.toString()}`, locale);
};
exports.search = search;
const createLead = async (data, locale) => {
    const response = await fetch(`${API_BASE}/leads`, {
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
exports.createLead = createLead;
const submitHearingTest = async (data, locale) => {
    const response = await fetch(`${API_BASE}/hearing-test`, {
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
exports.submitHearingTest = submitHearingTest;
//# sourceMappingURL=api.js.map