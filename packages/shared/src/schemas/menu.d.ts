import { z } from 'zod';
declare const menuEntrySchema: z.ZodObject<{
    id: z.ZodString;
    title_uz: z.ZodString;
    title_ru: z.ZodString;
    href: z.ZodString;
    order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id?: string;
    title_uz?: string;
    title_ru?: string;
    href?: string;
    order?: number;
}, {
    id?: string;
    title_uz?: string;
    title_ru?: string;
    href?: string;
    order?: number;
}>;
export declare const menuItemSchema: z.ZodObject<{
    id: z.ZodString;
    title_uz: z.ZodString;
    title_ru: z.ZodString;
    href: z.ZodString;
    order: z.ZodNumber;
} & {
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title_uz: z.ZodString;
        title_ru: z.ZodString;
        href: z.ZodString;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        title_uz?: string;
        title_ru?: string;
        href?: string;
        order?: number;
    }, {
        id?: string;
        title_uz?: string;
        title_ru?: string;
        href?: string;
        order?: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    title_uz?: string;
    title_ru?: string;
    href?: string;
    order?: number;
    children?: {
        id?: string;
        title_uz?: string;
        title_ru?: string;
        href?: string;
        order?: number;
    }[];
}, {
    id?: string;
    title_uz?: string;
    title_ru?: string;
    href?: string;
    order?: number;
    children?: {
        id?: string;
        title_uz?: string;
        title_ru?: string;
        href?: string;
        order?: number;
    }[];
}>;
export declare const menuItemsSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    title_uz: z.ZodString;
    title_ru: z.ZodString;
    href: z.ZodString;
    order: z.ZodNumber;
} & {
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title_uz: z.ZodString;
        title_ru: z.ZodString;
        href: z.ZodString;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id?: string;
        title_uz?: string;
        title_ru?: string;
        href?: string;
        order?: number;
    }, {
        id?: string;
        title_uz?: string;
        title_ru?: string;
        href?: string;
        order?: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    title_uz?: string;
    title_ru?: string;
    href?: string;
    order?: number;
    children?: {
        id?: string;
        title_uz?: string;
        title_ru?: string;
        href?: string;
        order?: number;
    }[];
}, {
    id?: string;
    title_uz?: string;
    title_ru?: string;
    href?: string;
    order?: number;
    children?: {
        id?: string;
        title_uz?: string;
        title_ru?: string;
        href?: string;
        order?: number;
    }[];
}>, "many">;
export type MenuItemSchema = z.infer<typeof menuItemSchema>;
export type MenuChildSchema = z.infer<typeof menuEntrySchema>;
export {};
//# sourceMappingURL=menu.d.ts.map