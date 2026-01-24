/**
 * Menu data utilities
 * Reads menu data from JSON file for better performance and reliability
 */

import menuData from '@/data/menu.json';
import type { Locale } from '@/lib/locale';

export interface MenuItem {
  id: string;
  title_uz: string;
  title_ru: string;
  href: string;
  order: number;
  children?: MenuItem[];
}

export interface CatalogMenuItem {
  href: string;
  label: string;
}

/**
 * Get header menu items from JSON
 * Falls back to empty array if locale not found
 */
export function getHeaderMenuFromJSON(locale: Locale): MenuItem[] {
  try {
    const localeKey = locale === 'ru' ? 'ru' : 'uz';
    const items = menuData.header[localeKey] || menuData.header.uz;
    
    // Convert to MenuItem format
    return items.map((item: any) => ({
      id: item.id,
      title_uz: item.title_uz,
      title_ru: item.title_ru,
      href: item.href,
      order: item.order || 999,
      children: item.children || [],
    })).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('[getHeaderMenuFromJSON] Error reading menu data:', error);
    return [];
  }
}

/**
 * Get catalog menu items from JSON
 * Falls back to empty array if locale not found
 */
export function getCatalogMenuFromJSON(locale: Locale): CatalogMenuItem[] {
  try {
    const localeKey = locale === 'ru' ? 'ru' : 'uz';
    const items = menuData.catalog[localeKey] || menuData.catalog.uz;
    
    return items.map((item: any) => ({
      href: item.href,
      label: item.label,
    }));
  } catch (error) {
    console.error('[getCatalogMenuFromJSON] Error reading catalog menu data:', error);
    return [];
  }
}

/**
 * Check if menu data is available
 */
export function hasMenuData(): boolean {
  try {
    return !!menuData && !!menuData.header && !!menuData.catalog;
  } catch {
    return false;
  }
}
