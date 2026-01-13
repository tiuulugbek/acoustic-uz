import type { Locale } from '@/lib/locale';
interface VolumeCalibrationProps {
    locale: Locale;
    volume: number;
    onVolumeChange: (volume: number) => void;
    onContinue: (volume: number) => void;
    onBack: () => void;
    playTone: (options: {
        frequency: number;
        volume: number;
        duration?: number;
        onEnd?: () => void;
    }) => void;
    stopTone: () => void;
    isPlaying: boolean;
}
export default function VolumeCalibration({ locale, volume, onVolumeChange, onContinue, onBack, playTone, stopTone, isPlaying, }: VolumeCalibrationProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=volume-calibration.d.ts.map