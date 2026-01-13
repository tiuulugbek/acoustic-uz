import type { Metadata } from 'next';
export declare const dynamic = "force-dynamic";
export declare const revalidate = 0;
interface CatalogCategoryPageProps {
    params: {
        slug: string;
    };
    searchParams: {
        brand?: string;
        audience?: string;
        form?: string;
        signal?: string;
        power?: string;
        loss?: string;
        sort?: string;
        page?: string;
    };
}
export declare function generateMetadata({ params }: CatalogCategoryPageProps): Promise<Metadata>;
export default function CatalogCategoryPage({ params, searchParams }: CatalogCategoryPageProps): Promise<import("react").JSX.Element>;
export {};
//# sourceMappingURL=page.d.ts.map