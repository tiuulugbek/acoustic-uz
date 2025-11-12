import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { menuItemsSchema, DEFAULT_MENUS, type MenuItemSchema, type MenuChildSchema } from '@acoustic/shared';

type MenuItem = MenuItemSchema;
type MenuChild = MenuChildSchema;

function mergeChildren(defaultChildren: MenuChild[] | undefined, existingChildren: MenuChild[] | undefined) {
  const defaultList = defaultChildren ?? [];
  const existingList = existingChildren ?? [];

  if (!defaultList.length && !existingList.length) {
    return undefined;
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
      const mergedChildren = mergeChildren(defaultItem.children, match.children);
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
    if (normalizedDefaults.length > 0) {
      const normalizedExisting = Array.isArray(items) && items.length > 0 ? menuItemsSchema.parse(items) : [];
      const merged = mergeMenuItems(normalizedDefaults, normalizedExisting);

      const needsUpdate =
        !normalizedExisting.length ||
        JSON.stringify(merged) !== JSON.stringify(normalizedExisting);

      if (needsUpdate) {
        menu = await this.prisma.menu.update({
          where: { name },
          data: { items: merged as any },
        });
      }
    }

    return menu;
  }

  async update(name: string, items: unknown) {
    const validatedItems = menuItemsSchema.parse(items);
    return this.prisma.menu.upsert({
      where: { name },
      update: { items: validatedItems as any },
      create: { name, items: validatedItems as any },
    });
  }
}

