interface Brand {
    id: string;
    name: string;
    slug: string;
    logo?: {
        url: string;
    } | null;
}
interface CatalogBrandChipsProps {
    categorySlug: string;
    locale: 'uz' | 'ru';
    brands: Brand[];
    selectedBrands: string[];
}
export default function CatalogBrandChips({ categorySlug, locale, brands, selectedBrands }: CatalogBrandChipsProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=catalog-brand-chips.d.ts.map