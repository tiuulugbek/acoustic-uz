interface CatalogPaginationProps {
    categorySlug: string;
    locale: 'uz' | 'ru';
    currentPage: number;
    totalPages: number;
    totalItems: number;
}
export default function CatalogPagination({ categorySlug, locale, currentPage, totalPages, totalItems }: CatalogPaginationProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=catalog-pagination.d.ts.map