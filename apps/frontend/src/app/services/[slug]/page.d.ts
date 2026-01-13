import type { Metadata } from 'next';
export declare const revalidate = 300;
interface ServicePageProps {
    params: {
        slug: string;
    };
}
export declare function generateMetadata({ params }: ServicePageProps): Promise<Metadata>;
export default function ServiceSlugPage({ params }: ServicePageProps): Promise<import("react").JSX.Element>;
export {};
//# sourceMappingURL=page.d.ts.map