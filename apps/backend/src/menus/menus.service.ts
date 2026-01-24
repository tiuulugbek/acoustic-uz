import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { menuItemsSchema, DEFAULT_MENUS, type MenuItemSchema, type MenuChildSchema } from '@acoustic/shared';
import * as fs from 'fs';
import * as path from 'path';

type MenuItem = MenuItemSchema;
type MenuChild = MenuChildSchema;

function mergeChildren(defaultChildren: MenuChild[] | undefined, existingChildren: MenuChild[] | undefined, itemId?: string) {
  const defaultList = defaultChildren ?? [];
  const existingList = existingChildren ?? [];

  if (!defaultList.length && !existingList.length) {
    return undefined;
  }

  // For "menu-catalog", always use default children to match frontend structure
  // This ensures old submenus are replaced with new frontend-aligned structure
  if (itemId === 'menu-catalog' && defaultList.length > 0) {
    return defaultList;
  }

  const mergedChildren = defaultList.map((defaultChild) => {
    const match = existingList.find((child) => child.id === defaultChild.id);
    if (match) {
      return {
        ...defaultChild,
        ...match,
      };
    }
    return defaultChild;
  });

  const additional = existingList.filter((child) => !defaultList.some((def) => def.id === child.id));

  return [...mergedChildren, ...additional].sort((a, b) => a.order - b.order);
}

function mergeMenuItems(defaults: MenuItem[], existing: MenuItem[]): MenuItem[] {
  const merged = defaults.map((defaultItem) => {
    const match = existing.find((item) => item.id === defaultItem.id);
    if (match) {
      const mergedChildren = mergeChildren(defaultItem.children, match.children, defaultItem.id);
      // For "menu-catalog", always use default children (ignore match.children)
      if (defaultItem.id === 'menu-catalog' && defaultItem.children && defaultItem.children.length > 0) {
        return {
          ...defaultItem,
          ...match,
          children: defaultItem.children, // Force use default children
        };
      }
      return {
        ...defaultItem,
        ...match,
        ...(mergedChildren ? { children: mergedChildren } : {}),
      };
    }
    return defaultItem;
  });

  const additional = existing.filter((item) => !defaults.some((def) => def.id === item.id));

  return [...merged, ...additional].sort((a, b) => a.order - b.order);
}

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async findOne(name: string) {
    let menu = await this.prisma.menu.findUnique({
      where: { name },
    });

    const defaultItems = DEFAULT_MENUS[name as keyof typeof DEFAULT_MENUS];
    const normalizedDefaults = defaultItems ? menuItemsSchema.parse(defaultItems) : [];

    if (!menu) {
      menu = await this.prisma.menu.create({
        data: { name, items: normalizedDefaults as any },
      });
      return menu;
    }

    const items = Array.isArray(menu.items) ? (menuItemsSchema.safeParse(menu.items).success ? menu.items : []) : [];

    // Get default catalog item directly from DEFAULT_MENUS
    const defaultItemsRaw = DEFAULT_MENUS[name as keyof typeof DEFAULT_MENUS];
    const defaultCatalogRaw = defaultItemsRaw?.find((item: any) => item.id === 'menu-catalog') as any;

    if (normalizedDefaults.length > 0) {
      const normalizedExisting = Array.isArray(items) && items.length > 0 ? menuItemsSchema.parse(items) : [];

      // If catalog exists in defaults, ALWAYS use default children
      if (defaultCatalogRaw && 'children' in defaultCatalogRaw && Array.isArray(defaultCatalogRaw.children) && defaultCatalogRaw.children.length > 0) {
        // Parse the default catalog item
        const parsedCatalog = menuItemsSchema.parse([defaultCatalogRaw])[0];

        // Remove catalog from existing before merge
        const withoutCatalog = normalizedExisting.filter(item => item.id !== 'menu-catalog');

        // Merge other items (excluding catalog)
        const otherMerged = mergeMenuItems(
          normalizedDefaults.filter(item => item.id !== 'menu-catalog'),
          withoutCatalog
        );

        // Add catalog with default children (always use parsed default)
        const finalItems = [...otherMerged, parsedCatalog].sort((a, b) => a.order - b.order);

        // Update database
        menu = await this.prisma.menu.update({
          where: { name },
          data: { items: finalItems as any },
        });

        return menu;
      }

      // Normal merge for other cases - but update titles if they differ from defaults
      const merged = mergeMenuItems(normalizedDefaults, normalizedExisting);

      // Check if any item titles need updating from defaults
      let needsUpdate = !normalizedExisting.length || JSON.stringify(merged) !== JSON.stringify(normalizedExisting);
      
      // Also check if titles match defaults (for menu-doctors, etc.)
      for (const defaultItem of normalizedDefaults) {
        const existingItem = normalizedExisting.find(item => item.id === defaultItem.id);
        if (existingItem && (existingItem.title_uz !== defaultItem.title_uz || existingItem.title_ru !== defaultItem.title_ru)) {
          needsUpdate = true;
          break;
        }
      }

      if (needsUpdate) {
        // Update titles from defaults
        const updatedMerged = merged.map(item => {
          const defaultItem = normalizedDefaults.find(def => def.id === item.id);
          if (defaultItem) {
            return {
              ...item,
              title_uz: defaultItem.title_uz,
              title_ru: defaultItem.title_ru,
            };
          }
          return item;
        });

        menu = await this.prisma.menu.update({
          where: { name },
          data: { items: updatedMerged as any },
        });
      }
    }

    // Final safety check: always return default children for catalog in response
    if (defaultCatalogRaw && 'children' in defaultCatalogRaw && Array.isArray(defaultCatalogRaw.children) && defaultCatalogRaw.children.length > 0 && Array.isArray(menu.items)) {
      const itemsArray = menu.items as MenuItem[];
      const catalogIndex = itemsArray.findIndex(item => item.id === 'menu-catalog');
      if (catalogIndex >= 0) {
        // Parse default children to ensure correct format
        const parsedCatalog = menuItemsSchema.parse([defaultCatalogRaw])[0];
        itemsArray[catalogIndex] = {
          ...itemsArray[catalogIndex],
          children: parsedCatalog.children
        };
        (menu as any).items = itemsArray;
      }
    }

    // Final safety check: ensure titles match defaults
    if (Array.isArray(menu.items)) {
      const itemsArray = menu.items as MenuItem[];
      let titlesUpdated = false;
      for (let i = 0; i < itemsArray.length; i++) {
        const item = itemsArray[i];
        const defaultItem = normalizedDefaults.find(def => def.id === item.id);
        if (defaultItem && (item.title_uz !== defaultItem.title_uz || item.title_ru !== defaultItem.title_ru)) {
          itemsArray[i] = {
            ...item,
            title_uz: defaultItem.title_uz,
            title_ru: defaultItem.title_ru,
          };
          titlesUpdated = true;
        }
      }
      if (titlesUpdated) {
        (menu as any).items = itemsArray;
      }
    }

    return menu;
  }

  /**
   * Update menu in database and sync to JSON file
   */
  async update(name: string, items: unknown) {
    const validatedItems = menuItemsSchema.parse(items);
    const menu = await this.prisma.menu.upsert({
      where: { name },
      update: { items: validatedItems as any },
      create: { name, items: validatedItems as any },
    });

    // Sync to JSON file if it's header menu
    if (name === 'header') {
      await this.syncMenuToJson(name, validatedItems);
    }

    return menu;
  }

  /**
   * Sync menu data to JSON file for frontend
   * Converts database format to JSON format (header.uz, header.ru)
   */
  private async syncMenuToJson(menuName: string, items: MenuItem[]): Promise<void> {
    try {
      // Get the correct path - handle both dev (apps/backend) and production (dist) cases
      let basePath = process.cwd();
      
      // If we're in apps/backend, go up two levels to root
      if (basePath.includes('apps/backend')) {
        basePath = path.join(basePath, '..', '..');
      }
      // If we're in dist, go up to root
      else if (basePath.includes('dist')) {
        basePath = path.join(basePath, '..', '..', '..');
      }
      
      const menuJsonPath = path.join(
        basePath,
        'apps',
        'frontend',
        'src',
        'data',
        'menu.json'
      );

      // Read existing menu.json
      let menuData: any = {};
      if (fs.existsSync(menuJsonPath)) {
        const existingContent = fs.readFileSync(menuJsonPath, 'utf-8');
        menuData = JSON.parse(existingContent);
      }

      // Convert database format to JSON format
      // Database format: [{ id, title_uz, title_ru, href, order, children }]
      // JSON format: { header: { uz: [...], ru: [...] } }
      const convertItem = (item: MenuItem): any => {
        const jsonItem: any = {
          id: item.id,
          title_uz: item.title_uz,
          title_ru: item.title_ru,
          href: item.href,
          order: item.order,
        };
        // Add children if they exist
        if (item.children && item.children.length > 0) {
          jsonItem.children = item.children.map((child) => ({
            id: child.id,
            title_uz: child.title_uz,
            title_ru: child.title_ru,
            href: child.href,
            order: child.order,
          }));
        }
        return jsonItem;
      };

      const uzItems = items.map(convertItem);
      const ruItems = items.map(convertItem);

      // Update menu.json
      menuData[menuName] = {
        uz: uzItems,
        ru: ruItems,
      };

      // Write to file with pretty formatting
      fs.writeFileSync(menuJsonPath, JSON.stringify(menuData, null, 2), 'utf-8');

      console.log(`✅ [MenusService] Synced ${menuName} menu to JSON file`);
    } catch (error) {
      // Log error but don't fail the update
      console.error(`❌ [MenusService] Failed to sync menu to JSON:`, error);
    }
  }
}

