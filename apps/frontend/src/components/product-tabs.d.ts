interface ProductTabItem {
    key: string;
    title: string;
    primary?: string | null;
    secondary?: string | null;
}
interface ProductTabsProps {
    tabs: ProductTabItem[];
}
export default function ProductTabs({ tabs }: ProductTabsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=product-tabs.d.ts.map