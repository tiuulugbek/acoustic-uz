/**
 * Normalize image URL for display in admin panel
 * Converts relative URLs to absolute URLs using the API base URL
 * Also handles incorrect domain patterns like acoustic.uz/api/uploads/
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // If already absolute URL, ensure pathname is properly encoded and fix domain
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      
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
      }
      
      // Remove /api from pathname if present (uploads should be directly under domain)
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
    const apiBase = import.meta.env.VITE_API_URL || 'https://a.acoustic.uz/api';
    console.log('🔧 Normalizing relative URL:', { url, apiBase });
    
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
    
    console.log('🔧 Extracted base URL:', baseUrl);
    
    // Encode only the filename part
    const pathParts = url.split('/');
    const filename = pathParts.pop();
    if (filename) {
      const encodedFilename = encodeURIComponent(filename);
      const normalized = `${baseUrl}${pathParts.join('/')}/${encodedFilename}`;
      console.log('🔧 Normalized URL:', normalized);
      return normalized;
    }
    const normalized = `${baseUrl}${url}`;
    console.log('🔧 Normalized URL (no filename):', normalized);
    return normalized;
  }
  
  return url;
}






