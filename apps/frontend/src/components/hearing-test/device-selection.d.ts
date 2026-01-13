import type { Locale } from '@/lib/locale';
interface DeviceSelectionProps {
    locale: Locale;
    onSelect: (device: 'speaker' | 'headphone') => void;
    onBack: () => void;
}
export default function DeviceSelection({ locale, onSelect, onBack }: DeviceSelectionProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=device-selection.d.ts.map