import { z } from 'zod';

const menuEntrySchema = z.object({
  id: z.string().min(1),
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  href: z.string().min(1),
  order: z.number().int(),
});

export const menuItemSchema = menuEntrySchema.extend({
  children: z.array(menuEntrySchema).optional(),
});

export const menuItemsSchema = z.array(menuItemSchema);

export type MenuItemSchema = z.infer<typeof menuItemSchema>;
export type MenuChildSchema = z.infer<typeof menuEntrySchema>;

