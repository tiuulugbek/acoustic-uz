/**
 * Normalize image URL for display in admin panel
 * Converts relative URLs to absolute URLs using the API base URL
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}${url}`;
  }
  return url;
}






