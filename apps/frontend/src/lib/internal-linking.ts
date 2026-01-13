/**
 * Internal linking utilities for SEO optimization
 * Automatically converts product names, service names, and post titles to internal links
 */

import type { ProductResponse, ServiceResponse, PostResponse } from './api';

interface InternalLinkConfig {
  products?: ProductResponse[];
  services?: ServiceResponse[];
  posts?: PostResponse[];
  locale?: 'uz' | 'ru';
}

/**
 * Processes HTML content to add internal links for products, services, and posts
 * This improves SEO by creating contextual internal links within content
 */
export function addInternalLinks(
  content: string,
  config: InternalLinkConfig
): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let processed = content;
  const { products = [], services = [], posts = [], locale = 'uz' } = config;

  // Helper function to get bilingual text
  const getText = (uz: string, ru: string) => {
    return locale === 'ru' ? ru : uz;
  };

  // Process products - convert product names to links
  // Only process if product name is not already inside a link
  products.forEach((product) => {
    const productName = getText(product.name_uz, product.name_ru);
    if (!productName || !product.slug) return;

    // Create regex that matches product name but not if it's already inside a link
    // Match product name as whole word, case-insensitive, but not inside <a> tags
    const regex = new RegExp(
      `(?<!<a[^>]*>)(?<!href=["'][^"']*)\\b(${escapeRegex(productName)})\\b(?![^<]*</a>)`,
      'gi'
    );

    processed = processed.replace(regex, (match) => {
      // Check if this match is already inside a link tag
      const beforeMatch = processed.substring(0, processed.indexOf(match));
      const lastLinkOpen = beforeMatch.lastIndexOf('<a');
      const lastLinkClose = beforeMatch.lastIndexOf('</a>');
      
      // If there's an open link tag and no closing tag after it, skip this match
      if (lastLinkOpen > lastLinkClose) {
        return match;
      }

      return `<a href="/products/${product.slug}" class="text-brand-primary hover:text-brand-accent hover:underline font-medium" title="${productName}">${match}</a>`;
    });
  });

  // Process services - convert service titles to links
  services.forEach((service) => {
    const serviceTitle = getText(service.title_uz, service.title_ru);
    if (!serviceTitle || !service.slug) return;

    const regex = new RegExp(
      `(?<!<a[^>]*>)(?<!href=["'][^"']*)\\b(${escapeRegex(serviceTitle)})\\b(?![^<]*</a>)`,
      'gi'
    );

    processed = processed.replace(regex, (match) => {
      const beforeMatch = processed.substring(0, processed.indexOf(match));
      const lastLinkOpen = beforeMatch.lastIndexOf('<a');
      const lastLinkClose = beforeMatch.lastIndexOf('</a>');
      
      if (lastLinkOpen > lastLinkClose) {
        return match;
      }

      return `<a href="/services/${service.slug}" class="text-brand-primary hover:text-brand-accent hover:underline font-medium" title="${serviceTitle}">${match}</a>`;
    });
  });

  // Process posts - convert post titles to links (only first occurrence per paragraph)
  posts.forEach((post) => {
    const postTitle = getText(post.title_uz, post.title_ru);
    if (!postTitle || !post.slug) return;

    // Determine correct post URL based on post type and category section
    let postUrl = `/posts/${post.slug}`;
    if (post.postType === 'news') {
      postUrl = `/news/${post.slug}`;
    } else if (post.categoryId) {
      // Note: We'd need category data to determine section, but for now use default
      // This can be enhanced later if needed
    }

    // Only match post title if it's at least 3 words (to avoid false positives)
    const words = postTitle.split(/\s+/);
    if (words.length < 3) return;

    // Match post title, but only if it appears as a phrase (not individual words)
    const regex = new RegExp(
      `(?<!<a[^>]*>)(?<!href=["'][^"']*)\\b(${escapeRegex(postTitle)})\\b(?![^<]*</a>)`,
      'gi'
    );

    processed = processed.replace(regex, (match) => {
      const beforeMatch = processed.substring(0, processed.indexOf(match));
      const lastLinkOpen = beforeMatch.lastIndexOf('<a');
      const lastLinkClose = beforeMatch.lastIndexOf('</a>');
      
      if (lastLinkOpen > lastLinkClose) {
        return match;
      }

      return `<a href="${postUrl}" class="text-brand-primary hover:text-brand-accent hover:underline font-medium" title="${postTitle}">${match}</a>`;
    });
  });

  return processed;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Limits internal linking to avoid over-optimization
 * Only processes first N occurrences of each entity type
 */
export function addInternalLinksLimited(
  content: string,
  config: InternalLinkConfig,
  maxLinksPerType: number = 3
): string {
  if (!content || typeof content !== 'string') {
    return content;
  }

  let processed = content;
  const { products = [], services = [], posts = [], locale = 'uz' } = config;

  // Limit products, services, and posts to maxLinksPerType
  const limitedProducts = products.slice(0, maxLinksPerType);
  const limitedServices = services.slice(0, maxLinksPerType);
  const limitedPosts = posts.slice(0, maxLinksPerType);

  return addInternalLinks(processed, {
    products: limitedProducts,
    services: limitedServices,
    posts: limitedPosts,
    locale,
  });
}

