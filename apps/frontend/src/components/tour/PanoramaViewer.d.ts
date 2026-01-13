import type { TourConfig } from '@/types/tour';
declare global {
    interface Window {
        pannellum: any;
    }
}
interface PanoramaViewerProps {
    config: TourConfig;
    locale?: 'uz' | 'ru';
    className?: string;
    onThumbnailsChange?: (show: boolean) => void;
    showThumbnailsExternal?: boolean;
}
export default function PanoramaViewer({ config, locale, className, onThumbnailsChange, showThumbnailsExternal }: PanoramaViewerProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PanoramaViewer.d.ts.map