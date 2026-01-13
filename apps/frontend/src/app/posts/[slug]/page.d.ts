import type { Metadata } from 'next';
export declare const revalidate = 7200;
interface PostPageProps {
    params: {
        slug: string;
    };
}
export declare function generateMetadata({ params }: PostPageProps): Promise<Metadata>;
export default function PostPage({ params }: PostPageProps): Promise<import("react").JSX.Element>;
export {};
//# sourceMappingURL=page.d.ts.map