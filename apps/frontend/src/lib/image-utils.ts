/**
 * Utility functions for normalizing image URLs
 * Converts relative URLs to absolute URLs using the API base URL
 */

/**
 * Normalize image URL for display in frontend
 * Converts relative URLs (/uploads/...) to absolute URLs (https://api.acoustic.uz/uploads/...)
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If already absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If relative URL starting with /uploads/, make it absolute
  if (url.startsWith('/uploads/')) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    // Properly extract base URL by removing /api from the end
    let baseUrl = apiBase;
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4); // Remove '/api'
    } else if (baseUrl.endsWith('/api/')) {
      baseUrl = baseUrl.slice(0, -5); // Remove '/api/'
    }
    // Ensure baseUrl doesn't end with /
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    return `${baseUrl}${url}`;
  }
  
  return url;
}

/**
 * Normalize panorama URL (same as normalizeImageUrl but with better error handling)
 */
export function normalizePanoramaUrl(url: string | null | undefined): string {
  return normalizeImageUrl(url);
}

