import type { Metadata } from 'next';
export declare const dynamic = "force-dynamic";
export declare const revalidate = 0;
interface DoctorPageProps {
    params: {
        slug: string;
    };
}
export declare function generateMetadata({ params }: DoctorPageProps): Promise<Metadata>;
export default function DoctorSlugPage({ params }: DoctorPageProps): Promise<import("react").JSX.Element>;
export {};
//# sourceMappingURL=page.d.ts.map