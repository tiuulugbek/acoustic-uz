import type { Locale } from '@/lib/locale';
interface FrequencyTestProps {
    locale: Locale;
    ear: 'left' | 'right';
    frequencies: number[];
    onComplete: (results: Record<string, number>) => void;
    onBack: () => void;
    playTone: (options: {
        frequency: number;
        volume: number;
        duration?: number;
        onEnd?: () => void;
    }) => void;
    stopTone: () => void;
    updateVolume: (volume: number) => void;
    isPlaying: boolean;
    volume: number;
    isSubmitting?: boolean;
}
export default function FrequencyTest({ locale, ear, frequencies, onComplete, onBack, playTone, stopTone, updateVolume, isPlaying, volume, isSubmitting, }: FrequencyTestProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=frequency-test.d.ts.map