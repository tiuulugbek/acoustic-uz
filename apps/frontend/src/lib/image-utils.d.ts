/**
 * Utility functions for normalizing image URLs
 * Converts relative URLs to absolute URLs using the API base URL
 */
/**
 * Normalize image URL for display in frontend
 * Converts relative URLs (/uploads/...) to absolute URLs (https://a.acoustic.uz/uploads/...)
 * Also handles filename encoding for URLs with spaces
 */
export declare function normalizeImageUrl(url: string | null | undefined): string;
/**
 * Normalize panorama URL (same as normalizeImageUrl but with better error handling)
 */
export declare function normalizePanoramaUrl(url: string | null | undefined): string;
//# sourceMappingURL=image-utils.d.ts.map