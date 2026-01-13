import type { Metadata } from 'next';
export declare const revalidate = 1800;
export declare function generateMetadata(): Promise<Metadata>;
export default function CatalogPage({ searchParams, }: {
    searchParams: {
        category?: string;
        productType?: string;
        filter?: string;
        brandId?: string;
        sort?: string;
        audience?: string;
        formFactor?: string;
        signalProcessing?: string;
        powerLevel?: string;
        hearingLossLevel?: string;
        smartphoneCompatibility?: string;
        page?: string;
    };
}): Promise<import("react").JSX.Element>;
//# sourceMappingURL=page.d.ts.map