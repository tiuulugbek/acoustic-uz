"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@acoustic/shared");
function mergeChildren(defaultChildren, existingChildren, itemId) {
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
function mergeMenuItems(defaults, existing) {
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
let MenusService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MenusService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MenusService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findOne(name) {
            let menu = await this.prisma.menu.findUnique({
                where: { name },
            });
            const defaultItems = shared_1.DEFAULT_MENUS[name];
            const normalizedDefaults = defaultItems ? shared_1.menuItemsSchema.parse(defaultItems) : [];
            if (!menu) {
                menu = await this.prisma.menu.create({
                    data: { name, items: normalizedDefaults },
                });
                return menu;
            }
            const items = Array.isArray(menu.items) ? (shared_1.menuItemsSchema.safeParse(menu.items).success ? menu.items : []) : [];
            // Get default catalog item directly from DEFAULT_MENUS
            const defaultItemsRaw = shared_1.DEFAULT_MENUS[name];
            const defaultCatalogRaw = defaultItemsRaw?.find((item) => item.id === 'menu-catalog');
            if (normalizedDefaults.length > 0) {
                const normalizedExisting = Array.isArray(items) && items.length > 0 ? shared_1.menuItemsSchema.parse(items) : [];
                // If catalog exists in defaults, ALWAYS use default children
                if (defaultCatalogRaw && 'children' in defaultCatalogRaw && Array.isArray(defaultCatalogRaw.children) && defaultCatalogRaw.children.length > 0) {
                    // Parse the default catalog item
                    const parsedCatalog = shared_1.menuItemsSchema.parse([defaultCatalogRaw])[0];
                    // Remove catalog from existing before merge
                    const withoutCatalog = normalizedExisting.filter(item => item.id !== 'menu-catalog');
                    // Merge other items (excluding catalog)
                    const otherMerged = mergeMenuItems(normalizedDefaults.filter(item => item.id !== 'menu-catalog'), withoutCatalog);
                    // Add catalog with default children (always use parsed default)
                    const finalItems = [...otherMerged, parsedCatalog].sort((a, b) => a.order - b.order);
                    // Update database
                    menu = await this.prisma.menu.update({
                        where: { name },
                        data: { items: finalItems },
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
                        data: { items: updatedMerged },
                    });
                }
            }
            // Final safety check: always return default children for catalog in response
            if (defaultCatalogRaw && 'children' in defaultCatalogRaw && Array.isArray(defaultCatalogRaw.children) && defaultCatalogRaw.children.length > 0 && Array.isArray(menu.items)) {
                const itemsArray = menu.items;
                const catalogIndex = itemsArray.findIndex(item => item.id === 'menu-catalog');
                if (catalogIndex >= 0) {
                    // Parse default children to ensure correct format
                    const parsedCatalog = shared_1.menuItemsSchema.parse([defaultCatalogRaw])[0];
                    itemsArray[catalogIndex] = {
                        ...itemsArray[catalogIndex],
                        children: parsedCatalog.children
                    };
                    menu.items = itemsArray;
                }
            }
            // Final safety check: ensure titles match defaults
            if (Array.isArray(menu.items)) {
                const itemsArray = menu.items;
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
                    menu.items = itemsArray;
                }
            }
            return menu;
        }
        async update(name, items) {
            const validatedItems = shared_1.menuItemsSchema.parse(items);
            return this.prisma.menu.upsert({
                where: { name },
                update: { items: validatedItems },
                create: { name, items: validatedItems },
            });
        }
    };
    return MenusService = _classThis;
})();
exports.MenusService = MenusService;
//# sourceMappingURL=menus.service.js.map