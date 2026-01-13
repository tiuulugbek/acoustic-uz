'use client';

import { useState, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { Locale } from '@/lib/locale';

interface FrequencyTestProps {
  locale: Locale;
  ear: 'left' | 'right';
  frequencies: number[];
  onComplete: (results: Record<string, number>) => void;
  onBack: () => void;
  playTone: (options: { frequency: number; volume: number; duration?: number; onEnd?: () => void }) => void;
  stopTone: () => void;
  updateVolume: (volume: number) => void;
  isPlaying: boolean;
  volume: number;
  isSubmitting?: boolean;
}

export default function FrequencyTest({
  locale,
  ear,
  frequencies,
  onComplete,
  onBack,
  playTone,
  stopTone,
  updateVolume,
  isPlaying,
  volume,
  isSubmitting = false,
}: FrequencyTestProps) {
  const isRu = locale === 'ru';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<string, number>>({}); // Store volume levels instead of boolean
  const [currentVolume, setCurrentVolume] = useState(0.0); // Start at 0% volume
  const autoContinueTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentFrequency = frequencies[currentIndex];
  const isLast = currentIndex === frequencies.length - 1;
  const allAnswered = Object.keys(results).length === frequencies.length;

  useEffect(() => {
    // Reset when component mounts or ear changes
    setCurrentIndex(0);
    setResults({});
    setCurrentVolume(0.0);
    stopTone();
  }, [ear, stopTone]);

  useEffect(() => {
    // Reset volume when frequency changes
    setCurrentVolume(0.0);
    stopTone();
    // Clear auto-continue timer
    if (autoContinueTimerRef.current) {
      clearTimeout(autoContinueTimerRef.current);
      autoContinueTimerRef.current = null;
    }
  }, [currentFrequency, stopTone]);

  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setCurrentVolume(clampedVolume);
    
    // Clear existing auto-continue timer
    if (autoContinueTimerRef.current) {
      clearTimeout(autoContinueTimerRef.current);
      autoContinueTimerRef.current = null;
    }
    
    // ReSound kabi: slider'ni surganda real-time ovoz ijro etish (instant response)
    if (clampedVolume > 0) {
      // Agar ovoz ijro etilayotgan bo'lsa va to'g'ri chastota bo'lsa, volume'ni yangilash
      if (isPlaying && currentFrequency === frequencies[currentIndex]) {
        // Real-time volume update (ReSound style - instant)
        updateVolume(clampedVolume);
      } else {
        // Yangi ovozni boshlash (ReSound kabi - darhol)
        playTone({
          frequency: currentFrequency,
          volume: clampedVolume,
          // duration yo'q - doim ijro etadi
        });
      }
      
      // ReSound kabi: agar volume > 0 bo'lsa, 2 sekunddan keyin avtomatik keyingi chastota'ga o'tish
      // Bu foydalanuvchiga ovozni eshitish va tasdiqlash uchun vaqt beradi
      autoContinueTimerRef.current = setTimeout(() => {
        handleContinue();
      }, 2000);
    } else {
      // Volume 0 bo'lsa, ovozni to'xtatish (ReSound kabi - darhol)
      stopTone();
    }
  };

  const handleContinue = () => {
    // Save current volume level (0-1 range)
    const newResults = {
      ...results,
      [currentFrequency.toString()]: currentVolume, // Store volume level (0-1)
    };
    setResults(newResults);
    stopTone();

    if (isLast) {
      // Send volume levels directly
      setTimeout(() => {
        onComplete(newResults);
      }, 300);
    } else {
      // Move to next frequency
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setCurrentVolume(0.0);
      }, 300);
    }
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      {/* Header - Mobile optimized */}
      <div className="text-center space-y-3 px-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-2xl md:text-3xl font-bold text-gray-900">
            {isRu ? `${currentFrequency} Гц` : `${currentFrequency} Hz`}
          </span>
          <span className="text-sm md:text-base text-gray-500">
            ({currentIndex + 1}/{frequencies.length})
          </span>
        </div>
        <p className="text-sm md:text-base text-gray-600 max-w-md mx-auto">
          {isRu
            ? 'Переместите ползунок, пока не услышите звук'
            : 'Ovozni zo\'rg\'a eshitguncha slider\'ni suring'}
        </p>
      </div>

      {/* Volume Control - Mobile optimized */}
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Volume Slider - Mobile friendly */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Minus Button - Mobile optimized */}
          <button
            onClick={() => handleVolumeChange(currentVolume - 0.05)}
            disabled={isSubmitting || currentVolume <= 0}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg touch-manipulation"
          >
            <Minus className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Slider - Mobile optimized (ReSound style) */}
          <div className="flex-1 relative py-6 md:py-8">
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={currentVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              onInput={(e) => handleVolumeChange(parseFloat((e.target as HTMLInputElement).value))}
              className="hearing-test-slider w-full h-3 md:h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary touch-manipulation"
              style={{
                background: `linear-gradient(to right, #F07E22 0%, #F07E22 ${currentVolume * 100}%, #e5e7eb ${currentVolume * 100}%, #e5e7eb 100%)`,
              }}
              disabled={isSubmitting}
            />
            {/* Volume value display */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1">
              <div className="bg-white border-2 border-gray-300 rounded-full px-3 md:px-4 py-1 shadow-lg">
                <span className="text-base md:text-lg font-bold text-gray-900">{Math.round(currentVolume * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Plus Button - Mobile optimized */}
          <button
            onClick={() => handleVolumeChange(currentVolume + 0.05)}
            disabled={isSubmitting || currentVolume >= 1}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg touch-manipulation"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Back button only - Mobile optimized */}
      <div className="flex justify-center pt-4 px-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 md:px-8 py-2.5 md:py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm md:text-base"
        >
          {isRu ? '← Назад' : '← Orqaga'}
        </button>
      </div>

      {/* Loading */}
      {isSubmitting && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          <p className="mt-2 text-gray-600">{isRu ? 'Обработка результатов...' : 'Natijalar qayta ishlanmoqda...'}</p>
        </div>
      )}
    </div>
  );
}

