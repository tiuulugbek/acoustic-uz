/**
 * Utility functions for normalizing image URLs
 * Converts relative URLs to absolute URLs using the API base URL
 */

/**
 * Normalize image URL for display in frontend
 * Converts relative URLs (/uploads/...) to absolute URLs (https://a.acoustic.uz/uploads/...)
 * Also handles filename encoding for URLs with spaces
 * Ensures all image URLs point to https://a.acoustic.uz/uploads/
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  // Early return for empty/null/undefined URLs
  if (!url || url.trim() === '') {
    return '';
  }
  
  // Trim whitespace
  url = url.trim();
  
  // If already absolute URL, ensure pathname is properly encoded and fix domain
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      
      // Fix empty or incorrect hostname
      if (!urlObj.hostname || urlObj.hostname === '' || urlObj.hostname.startsWith('.')) {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.protocol = 'https:';
      }
      
      // OPTIMIZED: Fix incorrect domain: acoustic.uz -> a.acoustic.uz
      // Force fix: ANY acoustic.uz domain (except a.acoustic.uz) should be a.acoustic.uz
      // This is the PRIMARY and MOST IMPORTANT fix - must catch ALL variants
      if (urlObj.hostname && urlObj.hostname !== 'a.acoustic.uz' && urlObj.hostname.includes('acoustic.uz')) {
        // Catch ALL acoustic.uz variants: acoustic.uz, www.acoustic.uz, api.acoustic.uz, subdomain.acoustic.uz, etc.
        // Only exclude a.acoustic.uz (already checked above)
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.protocol = 'https:';
      }
      
      // Always use production URL in server-side rendering or production build
      // In production or server-side rendering, always use production URL
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
        const isServerSide = typeof window === 'undefined';
        const isProduction = process.env.NODE_ENV === 'production';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        // Always fix localhost in production build, server-side rendering, or if API URL points to production
        if (isServerSide || isProduction || apiUrl.includes('a.acoustic.uz') || apiUrl.includes('acoustic.uz')) {
          urlObj.hostname = 'a.acoustic.uz';
          urlObj.port = '';
          urlObj.protocol = 'https:';
        }
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
      
      // Ensure pathname starts with /uploads/ for upload files
      if (!urlObj.pathname.startsWith('/uploads/') && urlObj.pathname.includes('/uploads/')) {
        // Extract path after /uploads/
        const uploadsIndex = urlObj.pathname.indexOf('/uploads/');
        urlObj.pathname = urlObj.pathname.substring(uploadsIndex);
      }
      
      // Don't encode the filename - keep it as is for better compatibility
      // Most web servers handle filenames correctly without encoding
      // Only encode if there are actual spaces or special characters that need encoding
      const pathParts = urlObj.pathname.split('/');
      const filename = pathParts.pop();
      if (filename) {
        // Check if filename needs encoding (has spaces or special chars)
        if (filename.includes(' ') || filename.includes('%')) {
          // Only encode if necessary
          const encodedFilename = encodeURIComponent(filename);
          urlObj.pathname = [...pathParts, encodedFilename].join('/');
        }
        // Otherwise keep filename as is
      }
      
      const finalUrl = urlObj.toString();
      return finalUrl;
    } catch {
      // If URL parsing fails, try simple string replacement as fallback
      let fixedUrl = url;
      
      // Fix empty hostname (.acoustic.uz -> a.acoustic.uz)
      fixedUrl = fixedUrl.replace(/https?:\/\/\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      
      // Fix acoustic.uz/uploads/ -> a.acoustic.uz/uploads/
      fixedUrl = fixedUrl.replace(/https?:\/\/acoustic\.uz\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/https?:\/\/www\.acoustic\.uz\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      
      // OPTIMIZED: Fix ANY acoustic.uz domain to a.acoustic.uz (comprehensive regex)
      // This catches ALL variants: acoustic.uz, www.acoustic.uz, api.acoustic.uz, subdomain.acoustic.uz, etc.
      // Single regex to catch all subdomains and main domain
      fixedUrl = fixedUrl.replace(/https?:\/\/([^\/]*\.)?acoustic\.uz(\/|$)/g, 'https://a.acoustic.uz$2');
      
      // Final safety check: if URL still contains acoustic.uz (not a.acoustic.uz), force fix it
      if (fixedUrl.includes('acoustic.uz') && !fixedUrl.includes('a.acoustic.uz')) {
        fixedUrl = fixedUrl.replace(/https?:\/\/[^\/]*acoustic\.uz(\/|$)/g, 'https://a.acoustic.uz$1');
      }
      
      // Fix acoustic.uz/api/uploads/ -> a.acoustic.uz/uploads/
      fixedUrl = fixedUrl.replace(/https?:\/\/acoustic\.uz\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/https?:\/\/www\.acoustic\.uz\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      
      // Fix localhost:3001 -> a.acoustic.uz (always in production or server-side)
      // Always convert localhost URLs during server-side rendering to prevent hydration mismatch
      const isServerSide = typeof window === 'undefined';
      const isProduction = process.env.NODE_ENV === 'production';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (isServerSide || isProduction || apiUrl.includes('a.acoustic.uz') || apiUrl.includes('acoustic.uz')) {
        fixedUrl = fixedUrl.replace(/http:\/\/localhost:3001\//g, 'https://a.acoustic.uz/');
        fixedUrl = fixedUrl.replace(/http:\/\/localhost:3001\/uploads\//g, 'https://a.acoustic.uz/uploads/');
        fixedUrl = fixedUrl.replace(/http:\/\/localhost:3001\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
        fixedUrl = fixedUrl.replace(/http:\/\/127\.0\.0\.1:3001\//g, 'https://a.acoustic.uz/');
        fixedUrl = fixedUrl.replace(/http:\/\/127\.0\.0\.1:3001\/uploads\//g, 'https://a.acoustic.uz/uploads/');
        fixedUrl = fixedUrl.replace(/http:\/\/127\.0\.0\.1:3001\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      }
      
      // Fix api.acoustic.uz -> a.acoustic.uz (old API domain)
      fixedUrl = fixedUrl.replace(/https?:\/\/api\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      fixedUrl = fixedUrl.replace(/https?:\/\/api\.acoustic\.uz\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      
      return fixedUrl;
    }
  }
  
  // If relative URL starting with /uploads/, make it absolute
  // Always use production URL during server-side rendering to prevent hydration mismatch
  if (url.startsWith('/uploads/')) {
    // Determine base URL based on environment
    let baseUrl: string;
    
    const isServerSide = typeof window === 'undefined';
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    
    // Check if we're in browser and on localhost (client-side)
    if (!isServerSide) {
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('localhost');
      if (isLocalhost && !isProduction && !apiUrl.includes('a.acoustic.uz')) {
        baseUrl = 'http://localhost:3001';
      } else {
        baseUrl = 'https://a.acoustic.uz';
      }
    } else {
      // Server-side: always use production URL for images to avoid hydration mismatch
      // This ensures server and client render the same URLs
      // Always use production URL in production or if API URL points to production
      if (isProduction || apiUrl.includes('a.acoustic.uz') || apiUrl.includes('acoustic.uz')) {
        baseUrl = 'https://a.acoustic.uz';
      } else {
        // Even in development, use production URL during SSR to prevent hydration mismatch
        baseUrl = 'https://a.acoustic.uz';
      }
    }
    
    // Don't encode filename unless necessary (has spaces or special chars)
    const pathParts = url.split('/');
    const filename = pathParts.pop();
    if (filename) {
      // Only encode if filename has spaces or special characters
      if (filename.includes(' ') || filename.includes('%')) {
        const encodedFilename = encodeURIComponent(filename);
        return `${baseUrl}${pathParts.join('/')}/${encodedFilename}`;
      }
      // Otherwise keep filename as is
      return `${baseUrl}${pathParts.join('/')}/${filename}`;
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

