interface AudioTestOptions {
    frequency: number;
    volume: number;
    duration?: number;
    onEnd?: () => void;
}
/**
 * ReSound-style professional audio generation
 * Uses equal loudness compensation and smooth audio processing
 */
export declare function useAudioTest(): {
    playTone: ({ frequency, volume, duration, onEnd }: AudioTestOptions) => void;
    stopTone: () => void;
    updateVolume: (newVolume: number) => void;
    cleanup: () => void;
    isPlaying: boolean;
    currentFrequency: number | null;
};
export {};
//# sourceMappingURL=useAudioTest.d.ts.map