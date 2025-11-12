import { z } from 'zod';
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page?: number;
    limit?: number;
}, {
    page?: number;
    limit?: number;
}>;
export declare const sortSchema: z.ZodObject<{
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}, {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}>;
export declare const filterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["published", "draft", "archived"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "published" | "draft" | "archived";
    search?: string;
}, {
    status?: "published" | "draft" | "archived";
    search?: string;
}>;
export declare const bilingualTextSchema: z.ZodObject<{
    uz: z.ZodString;
    ru: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uz?: string;
    ru?: string;
}, {
    uz?: string;
    ru?: string;
}>;
export declare const idSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
//# sourceMappingURL=common.d.ts.map