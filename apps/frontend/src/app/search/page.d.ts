import { Metadata } from 'next';
export declare const dynamic = "force-dynamic";
export declare const revalidate = 0;
interface SearchPageProps {
    searchParams: {
        q?: string;
    };
}
export declare function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata>;
export default function SearchPage({ searchParams }: SearchPageProps): Promise<import("react").JSX.Element>;
export {};
//# sourceMappingURL=page.d.ts.map