/**
 * Utility functions for normalizing image URLs
 * Converts relative URLs to absolute URLs using the API base URL
 */

/**
 * Normalize image URL for display in frontend
 * Converts relative URLs (/uploads/...) to absolute URLs (https://a.acoustic.uz/uploads/...)
 * Also handles filename encoding for URLs with spaces
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If already absolute URL, ensure pathname is properly encoded and fix domain
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      
      // Fix empty or incorrect hostname
      if (!urlObj.hostname || urlObj.hostname === '' || urlObj.hostname.startsWith('.')) {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.protocol = 'https:';
      }
      
      // Fix incorrect domain: acoustic.uz -> a.acoustic.uz
      if (urlObj.hostname === 'acoustic.uz' || urlObj.hostname === 'www.acoustic.uz') {
        urlObj.hostname = 'a.acoustic.uz';
      }
      
      // Fix incorrect domain: localhost:3001 -> a.acoustic.uz (in production)
      if (urlObj.hostname === 'localhost' && urlObj.port === '3001') {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.port = '';
        urlObj.protocol = 'https:';
      }
      
      // Fix api.acoustic.uz -> a.acoustic.uz (old API domain)
      if (urlObj.hostname === 'api.acoustic.uz') {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.protocol = 'https:';
      }
      
      // Remove /api from pathname if present (uploads should be directly under domain)
      // This must happen AFTER domain fix, so we check the full URL
      if (urlObj.pathname.startsWith('/api/uploads/')) {
        urlObj.pathname = urlObj.pathname.replace('/api/uploads/', '/uploads/');
      } else if (urlObj.pathname.startsWith('/api/') && urlObj.pathname.includes('/uploads/')) {
        // Handle cases like /api/something/uploads/...
        urlObj.pathname = urlObj.pathname.replace(/\/api\//, '/');
      }
      
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
      // If URL parsing fails, try simple string replacement as fallback
      let fixedUrl = url;
      
      // Fix empty hostname (.acoustic.uz -> a.acoustic.uz)
      fixedUrl = fixedUrl.replace(/https?:\/\/\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      
      // Fix acoustic.uz/api/uploads/ -> a.acoustic.uz/uploads/
      fixedUrl = fixedUrl.replace(/https?:\/\/acoustic\.uz\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/https?:\/\/www\.acoustic\.uz\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      
      // Fix localhost:3001 -> a.acoustic.uz
      fixedUrl = fixedUrl.replace(/http:\/\/localhost:3001\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/http:\/\/localhost:3001\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      
      // Fix api.acoustic.uz -> a.acoustic.uz (old API domain)
      fixedUrl = fixedUrl.replace(/https?:\/\/api\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      
      return fixedUrl;
    }
  }
  
  // If relative URL starting with /uploads/, make it absolute
  if (url.startsWith('/uploads/')) {
    // In Next.js, NEXT_PUBLIC_* vars are inlined at build time
    // If not set during build, fallback to production URL
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://a.acoustic.uz/api';
    
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

