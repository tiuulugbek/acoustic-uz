interface ServiceContentProps {
    content: string;
    locale: 'uz' | 'ru';
}
/**
 * Renders service body content with support for:
 * - HTML content (from RichTextEditor)
 * - Markdown-style **bold** text
 * - Numbered and bullet lists
 * - Headings (##, ###)
 * - Paragraphs
 */
export default function ServiceContent({ content, locale }: ServiceContentProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=service-content.d.ts.map