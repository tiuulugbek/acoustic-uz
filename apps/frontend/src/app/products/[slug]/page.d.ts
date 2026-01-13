import type { Metadata } from 'next';
export declare const revalidate = 3600;
interface ProductPageProps {
    params: {
        slug: string;
    };
}
export declare function generateMetadata({ params }: ProductPageProps): Promise<Metadata>;
export default function ProductPage({ params }: ProductPageProps): Promise<import("react").JSX.Element>;
export {};
//# sourceMappingURL=page.d.ts.map