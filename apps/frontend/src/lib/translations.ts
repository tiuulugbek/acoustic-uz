import type { Locale } from './locale';
import uzTranslations from '../locales/uz.json';
import ruTranslations from '../locales/ru.json';

type TranslationKey = 
  | 'common.readMore'
  | 'common.back'
  | 'common.home'
  | 'common.catalog'
  | 'common.services'
  | 'common.products'
  | 'common.posts'
  | 'common.search'
  | 'common.all'
  | 'common.loading'
  | 'common.error'
  | 'common.notFound'
  | 'common.empty'
  | 'common.resetFilters'
  | 'homepage.title'
  | 'homepage.description'
  | 'homepage.services.title'
  | 'homepage.services.empty'
  | 'homepage.hearingAids.title'
  | 'homepage.hearingAids.subtitle'
  | 'homepage.hearingAids.description'
  | 'homepage.hearingAids.empty'
  | 'homepage.interacoustics.title'
  | 'homepage.interacoustics.description'
  | 'homepage.interacoustics.fullCatalog'
  | 'homepage.journey.title'
  | 'homepage.journey.subtitle'
  | 'homepage.news.title'
  | 'homepage.news.empty'
  | 'catalog.title'
  | 'catalog.notFound'
  | 'catalog.allProducts'
  | 'catalog.allProductsDescription'
  | 'catalog.brandProductsDescription'
  | 'catalog.foundProducts'
  | 'catalog.productsNotFound'
  | 'catalog.productsNotFoundDescription'
  | 'catalog.empty'
  | 'catalog.resetFilters'
  | 'products.title'
  | 'products.notFound'
  | 'products.notFoundDescription'
  | 'products.backToCatalog'
  | 'products.usefulArticles'
  | 'products.tabs.description'
  | 'products.tabs.tech'
  | 'products.tabs.fitting'
  | 'services.title'
  | 'services.notFound'
  | 'services.backToServices'
  | 'services.bookConsultation'
  | 'services.usefulArticles'
  | 'search.title'
  | 'search.titleWithQuery'
  | 'search.description'
  | 'search.enterQuery'
  | 'search.searching'
  | 'search.error'
  | 'search.nothingFound'
  | 'search.nothingFoundWithQuery'
  | 'search.resultsFound'
  | 'search.products'
  | 'search.services'
  | 'search.posts'
  | 'sidebar.otherSections'
  | 'sidebar.brands'
  | 'breadcrumbs.home'
  | 'breadcrumbs.catalog'
  | 'breadcrumbs.services'
  | 'breadcrumbs.search'
  | 'posts.backToPosts'
  | 'posts.postType.news'
  | 'posts.postType.article'
  | 'posts.tags'
  | 'posts.share'
  | 'posts.bookConsultation'
  | 'posts.bookConsultationDescription'
  | 'posts.relatedPosts'
  | 'posts.notFound'
  | 'posts.notFoundTitle'
  | 'availability.inStock'
  | 'availability.preorder'
  | 'availability.outOfStock';

type Translations = typeof uzTranslations;

const translations: Record<Locale, Translations> = {
  uz: uzTranslations,
  ru: ruTranslations,
};

/**
 * Get translation by key for a specific locale
 * Supports nested keys like 'homepage.services.title'
 * Supports interpolation with {key} syntax
 */
export function t(key: TranslationKey, locale: Locale, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to Uzbek if key not found
      value = translations['uz'];
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key; // Return key itself if not found
        }
      }
      break;
    }
  }
  
  if (typeof value === 'string') {
    // Replace interpolation placeholders
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    return value;
  }
  
  console.warn(`Translation value is not a string for key: ${key}`);
  return key;
}

/**
 * Hook for client components (uses locale from context/cookie)
 */
export function useTranslation(locale: Locale) {
  return (key: TranslationKey, params?: Record<string, string | number>): string => {
    return t(key, locale, params);
  };
}

/**
 * Server-side translation function
 */
export function getTranslation(locale: Locale) {
  return (key: TranslationKey, params?: Record<string, string | number>): string => {
    return t(key, locale, params);
  };
}

