import type { Metadata } from 'next';
import './globals.css';
export declare const dynamic = "force-dynamic";
export declare const revalidate = 0;
export declare function generateMetadata(): Promise<Metadata>;
export default function RootLayout({ children, }: {
    children: React.ReactNode;
}): Promise<import("react").JSX.Element>;
//# sourceMappingURL=layout.d.ts.map