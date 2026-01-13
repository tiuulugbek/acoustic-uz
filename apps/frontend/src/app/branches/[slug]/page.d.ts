import type { Metadata } from 'next';
export declare const dynamic = "force-dynamic";
export declare const revalidate = 0;
interface BranchPageProps {
    params: {
        slug: string;
    };
}
export declare function generateMetadata({ params }: BranchPageProps): Promise<Metadata>;
export default function BranchPage({ params }: BranchPageProps): Promise<import("react").JSX.Element>;
export {};
//# sourceMappingURL=page.d.ts.map