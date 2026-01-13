interface TableOfContentsItem {
    id: string;
    title: string;
    level: number;
}
interface ServiceTableOfContentsProps {
    items: TableOfContentsItem[];
    locale: 'uz' | 'ru';
}
export default function ServiceTableOfContents({ items, locale }: ServiceTableOfContentsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=service-table-of-contents.d.ts.map