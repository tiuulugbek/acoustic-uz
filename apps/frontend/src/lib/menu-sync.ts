/**
 * Menu synchronization utilities
 * Handles syncing menu data from backend API to JSON file
 * This is used by admin panel to update menu.json when menu is changed
 */

import type { MenuItemResponse } from '@/lib/api';
import type { Locale } from '@/lib/locale';

export interface MenuSyncResult {
  success: boolean;
  message: string;
  updatedItems?: number;
}

/**
 * Sync menu from API to JSON file
 * This function should be called from admin panel when menu is updated
 * 
 * Note: This is a client-side function that updates the JSON file
 * For production, this should be handled by backend API endpoint
 * that writes directly to the JSON file on the server
 */
export async function syncMenuFromAPI(locale: Locale): Promise<MenuSyncResult> {
  try {
    // In production, this should call a backend API endpoint
    // that updates the JSON file directly on the server
    // For now, this is a placeholder for the sync mechanism
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[MenuSync] Syncing menu from API for locale:', locale);
    }
    
    // TODO: Implement backend API endpoint that:
    // 1. Receives menu data from admin panel
    // 2. Updates src/data/menu.json file
    // 3. Triggers frontend rebuild or hot reload
    
    return {
      success: false,
      message: 'Menu sync not implemented yet. Please update menu.json manually and rebuild frontend.',
    };
  } catch (error) {
    console.error('[MenuSync] Error syncing menu:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Format menu items for JSON storage
 */
export function formatMenuForJSON(items: MenuItemResponse[]): any[] {
  return items.map(item => ({
    id: item.id,
    title_uz: item.title_uz,
    title_ru: item.title_ru,
    href: item.href,
    order: item.order,
    children: item.children ? formatMenuForJSON(item.children) : [],
  }));
}

/**
 * Generate complete menu JSON structure
 */
export function generateMenuJSON(
  uzItems: MenuItemResponse[],
  ruItems: MenuItemResponse[]
): string {
  const menuJSON = {
    header: {
      uz: formatMenuForJSON(uzItems),
      ru: formatMenuForJSON(ruItems),
    },
    catalog: {
      uz: [], // Catalog items are usually static
      ru: [],
    },
  };
  
  return JSON.stringify(menuJSON, null, 2);
}
