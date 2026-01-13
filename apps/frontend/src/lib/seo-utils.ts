/**
 * SEO utility functions for optimizing meta descriptions and titles
 */

/**
 * Truncates text to optimal length for meta descriptions (150-160 characters)
 * Ensures description ends at a word boundary
 */
export function optimizeMetaDescription(text: string | null | undefined, maxLength: number = 160): string | undefined {
  if (!text) return undefined;
  
  // Remove HTML tags and clean up whitespace
  const cleanText = text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Truncate at word boundary
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    // If we can find a space reasonably close to the end, use it
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Optimizes title for SEO (50-60 characters optimal)
 * Ensures title includes brand name and is properly formatted
 */
export function optimizeTitle(title: string, brandName: string = 'Acoustic.uz', maxLength: number = 60): string {
  const fullTitle = `${title} — ${brandName}`;
  
  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }
  
  // If title is too long, truncate the main title part
  const availableLength = maxLength - brandName.length - 3; // 3 for " — "
  if (availableLength < 10) {
    // If brand name is too long, just return brand name
    return brandName;
  }
  
  const truncatedTitle = title.substring(0, availableLength);
  const lastSpace = truncatedTitle.lastIndexOf(' ');
  
  if (lastSpace > availableLength * 0.7) {
    return `${truncatedTitle.substring(0, lastSpace)}... — ${brandName}`;
  }
  
  return `${truncatedTitle}... — ${brandName}`;
}

/**
 * Generates SEO-friendly description with keywords
 */
export function generateSeoDescription(
  baseText: string | null | undefined,
  keywords: string[] = [],
  locale: 'uz' | 'ru' = 'uz',
  maxLength: number = 160
): string | undefined {
  if (!baseText) {
    // Generate fallback description with keywords
    if (keywords.length > 0) {
      const keywordText = keywords.join(', ');
      const fallback = locale === 'ru'
        ? `Услуги и решения для слуха: ${keywordText}. Профессиональная диагностика и подбор слуховых аппаратов.`
        : `Eshitish xizmatlari va yechimlari: ${keywordText}. Professional diagnostika va eshitish moslamalari tanlash.`;
      
      return optimizeMetaDescription(fallback, maxLength);
    }
    
    return locale === 'ru'
      ? 'Профессиональные услуги по диагностике и подбору слуховых аппаратов в Узбекистане.'
      : "O'zbekistonda professional eshitish diagnostikasi va apparatlarni tanlash xizmatlari.";
  }
  
  return optimizeMetaDescription(baseText, maxLength);
}

