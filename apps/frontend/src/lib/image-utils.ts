/**
 * Utility functions for normalizing image URLs
 * Converts relative URLs to absolute URLs using the API base URL
 */

/**
 * Normalize image URL for display in frontend
 * Converts relative URLs (/uploads/...) to absolute URLs (https://api.acoustic.uz/uploads/...)
 * Also handles filename encoding for URLs with spaces
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If already absolute URL, ensure pathname is properly encoded
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      // Only encode the filename part, not the entire path
      const pathParts = urlObj.pathname.split('/');
      const filename = pathParts.pop();
      if (filename) {
        // Encode only the filename to handle spaces
        const encodedFilename = encodeURIComponent(filename);
        urlObj.pathname = [...pathParts, encodedFilename].join('/');
      }
      return urlObj.toString();
    } catch {
      // If URL parsing fails, return as is (Next.js Image will handle it)
      return url;
    }
  }
  
  // If relative URL starting with /uploads/, make it absolute
  if (url.startsWith('/uploads/')) {
    // In Next.js, NEXT_PUBLIC_* vars are inlined at build time
    // If not set during build, fallback to production URL
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.acoustic.uz/api';
    
    // Properly extract base URL by removing /api from the end
    let baseUrl = finalApiBase;
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4); // Remove '/api'
    } else if (baseUrl.endsWith('/api/')) {
      baseUrl = baseUrl.slice(0, -5); // Remove '/api/'
    }
    // Ensure baseUrl doesn't end with /
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    // Encode only the filename part
    const pathParts = url.split('/');
    const filename = pathParts.pop();
    if (filename) {
      const encodedFilename = encodeURIComponent(filename);
      return `${baseUrl}${pathParts.join('/')}/${encodedFilename}`;
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

