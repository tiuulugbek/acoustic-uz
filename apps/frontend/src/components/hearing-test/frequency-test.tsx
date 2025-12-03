'use client';

import { useState, useEffect } from 'react';
import { Play, Square, Minus, Plus, Volume2 } from 'lucide-react';
import type { Locale } from '@/lib/locale';

interface FrequencyTestProps {
  locale: Locale;
  ear: 'left' | 'right';
  frequencies: number[];
  onComplete: (results: Record<string, boolean>) => void;
  onBack: () => void;
  playTone: (options: { frequency: number; volume: number; duration?: number; onEnd?: () => void }) => void;
  stopTone: () => void;
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
  isPlaying,
  volume,
  isSubmitting = false,
}: FrequencyTestProps) {
  const isRu = locale === 'ru';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<string, number>>({}); // Store volume levels instead of boolean
  const [currentVolume, setCurrentVolume] = useState(1.0); // Start at max volume
  const [hasPlayed, setHasPlayed] = useState(false);

  const currentFrequency = frequencies[currentIndex];
  const isLast = currentIndex === frequencies.length - 1;
  const allAnswered = Object.keys(results).length === frequencies.length;

  useEffect(() => {
    // Reset when component mounts or ear changes
    setCurrentIndex(0);
    setResults({});
    setCurrentVolume(1.0);
    setHasPlayed(false);
    stopTone();
  }, [ear, stopTone]);

  useEffect(() => {
    // Reset volume when frequency changes
    setCurrentVolume(1.0);
    setHasPlayed(false);
    stopTone();
  }, [currentFrequency, stopTone]);

  const handlePlay = () => {
    playTone({
      frequency: currentFrequency,
      volume: currentVolume,
      duration: 2000,
      onEnd: () => setHasPlayed(true),
    });
  };

  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setCurrentVolume(clampedVolume);
    if (isPlaying) {
      stopTone();
      setTimeout(() => {
        playTone({
          frequency: currentFrequency,
          volume: clampedVolume,
          duration: 2000,
          onEnd: () => setHasPlayed(true),
        });
      }, 100);
    }
  };

  const handleContinue = () => {
    // Save current volume level (if > 0, means heard; if 0, means not heard)
    const newResults = {
      ...results,
      [currentFrequency.toString()]: currentVolume > 0 ? 1 : 0, // Store as 1 (heard) or 0 (not heard)
    };
    setResults(newResults);
    setHasPlayed(false);
    stopTone();

    if (isLast) {
      // Convert to boolean results for compatibility
      const booleanResults: Record<string, boolean> = {};
      Object.keys(newResults).forEach((freq) => {
        booleanResults[freq] = newResults[freq] > 0;
      });
      setTimeout(() => {
        onComplete(booleanResults);
      }, 300);
    } else {
      // Move to next frequency
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setCurrentVolume(1.0);
      }, 300);
    }
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          {isRu
            ? ear === 'left' ? 'Левое ухо' : 'Правое ухо'
            : ear === 'left' ? 'Chap quloq' : 'O\'ng quloq'}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl text-gray-600 font-medium">
            {isRu ? `${currentFrequency} Гц` : `${currentFrequency} Hz`}
          </span>
          <button className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
            <span className="text-xs text-gray-600">?</span>
          </button>
        </div>
        <div className="mt-2">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 rounded-full">
            <span className="text-base font-semibold text-gray-700">
              {currentIndex + 1} / {frequencies.length}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-lg text-gray-800">
          <span className="font-bold text-brand-primary">
            {isRu ? 'Перетащите' : 'Surib'} {isRu ? 'или используйте' : 'yoki ishlating'}
          </span>
          {' '}
          {isRu ? '+ - для регулировки громкости тона, пока вы едва его не услышите' : '+ - ovozni sozlash uchun, ovozni zo\'rg\'a eshitguncha'}
        </p>
        <p className="text-sm text-gray-600">
          {isRu
            ? 'Держите наушники и устройство на максимальной громкости'
            : 'Quloqchinlar va qurilma ovozini maksimal darajada saqlang'}
        </p>
      </div>

      {/* Volume Control - ReSound style */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Volume Slider */}
        <div className="flex items-center gap-4">
          {/* Minus Button */}
          <button
            onClick={() => handleVolumeChange(currentVolume - 0.05)}
            disabled={isSubmitting || currentVolume <= 0}
            className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-5 h-5 text-gray-700" />
          </button>

          {/* Slider */}
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              disabled={isSubmitting}
            />
            <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-1">
              <span>{isRu ? 'Тихий' : 'Past'}</span>
              <span>{isRu ? 'Громко' : 'Baland'}</span>
            </div>
          </div>

          {/* Plus Button */}
          <button
            onClick={() => handleVolumeChange(currentVolume + 0.05)}
            disabled={isSubmitting || currentVolume >= 1}
            className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Play Button */}
        <div className="flex justify-center py-6">
          <button
            onClick={isPlaying ? stopTone : handlePlay}
            disabled={isSubmitting}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all transform ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 scale-105'
                : 'bg-gray-800 hover:bg-gray-900 hover:scale-105'
            } shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100`}
          >
            {isPlaying ? (
              <Square className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 pt-6">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRu ? '← Назад' : '← Orqaga'}
        </button>
        <button
          onClick={handleContinue}
          disabled={isSubmitting || !hasPlayed}
          className="px-10 py-3 bg-brand-primary text-white rounded-xl font-bold text-lg hover:bg-brand-primary/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isRu 
            ? (isLast ? 'Завершить →' : 'Следующая частота →')
            : (isLast ? 'Yakunlash →' : 'Keyingi chastota →')}
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

