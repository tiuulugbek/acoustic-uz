import type { Locale } from '@/lib/locale';
interface TestReadyProps {
    locale: Locale;
    ear: 'left' | 'right';
    onContinue: () => void;
    onBack: () => void;
}
export default function TestReady({ locale, ear, onContinue, onBack }: TestReadyProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=test-ready.d.ts.map