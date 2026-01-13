"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CatalogBrandChips;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const image_1 = __importDefault(require("next/image"));
function buildFilterUrl(slug, currentParams, updates) {
    const params = new URLSearchParams(currentParams);
    // Remove page when brand filter changes
    params.delete('page');
    Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== '') {
            params.set(key, value);
        }
        else {
            params.delete(key);
        }
    });
    const queryString = params.toString();
    return `/catalog/${slug}${queryString ? `?${queryString}` : ''}`;
}
function CatalogBrandChips({ categorySlug, locale, brands, selectedBrands }) {
    const searchParams = (0, navigation_1.useSearchParams)();
    if (brands.length === 0)
        return null;
    const allBrandsUrl = buildFilterUrl(categorySlug, searchParams, { brand: undefined });
    const isAllSelected = selectedBrands.length === 0;
    return (<div className="flex flex-wrap items-center gap-3 border-b border-border/40 pb-4">
      <link_1.default href={allBrandsUrl} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${isAllSelected
            ? 'border-brand-primary bg-brand-primary text-white'
            : 'border-border/60 bg-white text-brand-accent hover:border-brand-primary/50 hover:bg-brand-primary/5'}`}>
        {locale === 'ru' ? 'Все' : 'Barchasi'}
      </link_1.default>
      {brands.map((brand) => {
            const isSelected = selectedBrands.includes(brand.slug);
            const newBrands = isSelected ? selectedBrands.filter((b) => b !== brand.slug) : [...selectedBrands, brand.slug];
            const url = buildFilterUrl(categorySlug, searchParams, { brand: newBrands.length > 0 ? newBrands.join(',') : undefined });
            return (<link_1.default key={brand.id} href={url} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${isSelected
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-border/60 bg-white text-brand-accent hover:border-brand-primary/50 hover:bg-brand-primary/5'}`}>
            {brand.logo?.url && (<image_1.default src={brand.logo.url} alt={brand.name} width={20} height={20} className="h-5 w-5 object-contain" unoptimized/>)}
            <span>{brand.name}</span>
          </link_1.default>);
        })}
    </div>);
}
//# sourceMappingURL=catalog-brand-chips.js.map