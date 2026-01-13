/**
 * Processes HTML content to add support for:
 * - Tooltips: [tooltips keyword="..." content="..."]
 * - Table positions: [table position="left|center|right|full"]...[/table]
 * - Image layouts: [images layout="grid-2|grid-3|left-right|right-left"]...[/images]
 */
export declare function processContentShortcodes(content: string): string;
/**
 * Component that renders processed HTML content with tooltip support
 */
export declare function ProcessedContent({ html }: {
    html: string;
}): import("react").JSX.Element;
//# sourceMappingURL=content-processor.d.ts.map