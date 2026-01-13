interface MobileFilterDrawerProps {
    locale: 'uz' | 'ru';
    brandTabs: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    searchParams: {
        productType?: string;
        brandId?: string;
        sort?: string;
        audience?: string;
        formFactor?: string;
        signalProcessing?: string;
        powerLevel?: string;
        hearingLossLevel?: string;
        smartphoneCompatibility?: string;
    };
}
export default function MobileFilterDrawer({ locale, brandTabs, searchParams }: MobileFilterDrawerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=mobile-filter-drawer.d.ts.map