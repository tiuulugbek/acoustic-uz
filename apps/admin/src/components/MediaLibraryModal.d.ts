import { type MediaDto } from '../lib/api';
type FileType = 'all' | 'image' | 'other';
interface MediaLibraryModalProps {
    open: boolean;
    onCancel: () => void;
    onSelect: (media: MediaDto) => void;
    multiple?: boolean;
    fileType?: FileType;
    selectedMediaIds?: string[];
    onConfirm?: (selectedMediaIds: string[]) => void;
}
export default function MediaLibraryModal({ open, onCancel, onSelect, multiple, fileType, selectedMediaIds, onConfirm, }: MediaLibraryModalProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=MediaLibraryModal.d.ts.map