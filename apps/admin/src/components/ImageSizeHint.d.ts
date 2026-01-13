export type ImageSizeType = 'banner' | 'product' | 'product-gallery' | 'service' | 'catalog' | 'doctor' | 'branch' | 'post' | 'logo';
interface ImageSizeHintProps {
    type: ImageSizeType;
    showAsAlert?: boolean;
}
export default function ImageSizeHint({ type, showAsAlert }: ImageSizeHintProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=ImageSizeHint.d.ts.map