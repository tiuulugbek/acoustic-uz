interface CatalogFiltersProps {
    categorySlug: string;
    locale: 'uz' | 'ru';
    brands: Array<{
        id: string;
        name: string;
        slug: string;
        count?: number;
    }>;
    selectedBrands: string[];
    selectedBrandName?: string;
    selectedAudience: string[];
    selectedForms: string[];
    selectedPower: string[];
    selectedLoss: string[];
    audienceCounts?: Record<string, number>;
    formCounts?: Record<string, number>;
    powerCounts?: Record<string, number>;
    lossCounts?: Record<string, number>;
}
export default function CatalogFilters({ categorySlug, locale, brands, selectedBrands, selectedBrandName, selectedAudience, selectedForms, selectedPower, selectedLoss, audienceCounts, formCounts, powerCounts, lossCounts, }: CatalogFiltersProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=catalog-filters.d.ts.map