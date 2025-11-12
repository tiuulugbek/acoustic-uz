"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idSchema = exports.bilingualTextSchema = exports.filterSchema = exports.sortSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
});
exports.sortSchema = zod_1.z.object({
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.filterSchema = zod_1.z.object({
    status: zod_1.z.enum(['published', 'draft', 'archived']).optional(),
    search: zod_1.z.string().optional(),
});
exports.bilingualTextSchema = zod_1.z.object({
    uz: zod_1.z.string().min(1),
    ru: zod_1.z.string().min(1),
});
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
//# sourceMappingURL=common.js.map