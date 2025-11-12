"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuItemsSchema = exports.menuItemSchema = void 0;
const zod_1 = require("zod");
const menuEntrySchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    title_uz: zod_1.z.string().min(1),
    title_ru: zod_1.z.string().min(1),
    href: zod_1.z.string().min(1),
    order: zod_1.z.number().int(),
});
exports.menuItemSchema = menuEntrySchema.extend({
    children: zod_1.z.array(menuEntrySchema).optional(),
});
exports.menuItemsSchema = zod_1.z.array(exports.menuItemSchema);
//# sourceMappingURL=menu.js.map