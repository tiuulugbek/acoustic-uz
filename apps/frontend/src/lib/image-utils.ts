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
  if (!url) return '';
  
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
      
      // Fix incorrect domain: acoustic.uz -> a.acoustic.uz
      if (urlObj.hostname === 'acoustic.uz' || urlObj.hostname === 'www.acoustic.uz') {
        urlObj.hostname = 'a.acoustic.uz';
        urlObj.protocol = 'https:';
      }
      
      // Fix incorrect domain: localhost:3001 -> a.acoustic.uz (in production)
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
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
      
      return urlObj.toString();
    } catch {
      // If URL parsing fails, try simple string replacement as fallback
      let fixedUrl = url;
      
      // Fix empty hostname (.acoustic.uz -> a.acoustic.uz)
      fixedUrl = fixedUrl.replace(/https?:\/\/\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      
      // Fix acoustic.uz/uploads/ -> a.acoustic.uz/uploads/
      fixedUrl = fixedUrl.replace(/https?:\/\/acoustic\.uz\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/https?:\/\/www\.acoustic\.uz\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      
      // Fix acoustic.uz/api/uploads/ -> a.acoustic.uz/uploads/
      fixedUrl = fixedUrl.replace(/https?:\/\/acoustic\.uz\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/https?:\/\/www\.acoustic\.uz\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      
      // Fix localhost:3001 -> a.acoustic.uz
      fixedUrl = fixedUrl.replace(/http:\/\/localhost:3001\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/http:\/\/localhost:3001\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/http:\/\/127\.0\.0\.1:3001\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      fixedUrl = fixedUrl.replace(/http:\/\/127\.0\.0\.1:3001\/api\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      
      // Fix api.acoustic.uz -> a.acoustic.uz (old API domain)
      fixedUrl = fixedUrl.replace(/https?:\/\/api\.acoustic\.uz\//g, 'https://a.acoustic.uz/');
      fixedUrl = fixedUrl.replace(/https?:\/\/api\.acoustic\.uz\/uploads\//g, 'https://a.acoustic.uz/uploads/');
      
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

