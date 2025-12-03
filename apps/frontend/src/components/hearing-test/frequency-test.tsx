'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Square, Minus, Plus, Volume2 } from 'lucide-react';
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
    
    // ReSound kabi: yangi chastota'ga o'tganda avtomatik ovoz ijro etish
    const timer = setTimeout(() => {
      playTone({
        frequency: currentFrequency,
        volume: 1.0, // Maksimal volume bilan boshlash
        // duration yo'q - doim ijro etadi
      });
      setHasPlayed(true);
    }, 300); // 300ms kechikishdan keyin avtomatik ijro etish
    
    return () => clearTimeout(timer);
  }, [currentFrequency, stopTone, playTone]);

  const handlePlay = () => {
    if (isPlaying) {
      stopTone();
      setHasPlayed(false);
    } else {
      // ReSound kabi: doim ijro etish (duration yo'q)
      playTone({
        frequency: currentFrequency,
        volume: currentVolume,
        // duration yo'q - doim ijro etadi
      });
      setHasPlayed(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setCurrentVolume(clampedVolume);
    
    // ReSound kabi: agar ovoz ijro etilayotgan bo'lsa, volume'ni real-time o'zgartirish
    if (isPlaying) {
      updateVolume(clampedVolume);
    }
  };

  const handleContinue = () => {
    // Save current volume level (0-1 range)
    const newResults = {
      ...results,
      [currentFrequency.toString()]: currentVolume, // Store volume level (0-1)
    };
    setResults(newResults);
    setHasPlayed(false);
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

      {/* Instructions - ReSound style */}
      <div className="text-center space-y-3">
        <p className="text-xl md:text-2xl text-gray-900 font-medium">
          <span className="font-bold text-brand-primary">
            {isRu ? 'Перетащите' : 'Surib'} {isRu ? 'или используйте' : 'yoki ishlating'}
          </span>
          {' '}
          <span className="text-gray-900">
            {isRu ? '+ - для регулировки громкости тона, пока вы едва его не услышите' : '+ - ovozni sozlash uchun, ovozni zo\'rg\'a eshitguncha'}
          </span>
        </p>
        <p className="text-base text-gray-600">
          {isRu
            ? 'Держите наушники и устройство на максимальной громкости'
            : 'Quloqchinlar va qurilma ovozini maksimal darajada saqlang'}
        </p>
      </div>

      {/* Volume Control - ReSound style */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Volume Slider */}
        <div className="flex items-center gap-6 px-4">
          {/* Minus Button - ReSound style (larger, darker) */}
          <button
            onClick={() => handleVolumeChange(currentVolume - 0.05)}
            disabled={isSubmitting || currentVolume <= 0}
            className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          >
            <Minus className="w-6 h-6" />
          </button>

          {/* Slider */}
          <div className="flex-1 relative py-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              style={{
                background: `linear-gradient(to right, #F07E22 0%, #F07E22 ${currentVolume * 100}%, #e5e7eb ${currentVolume * 100}%, #e5e7eb 100%)`
              }}
              disabled={isSubmitting}
            />
            {/* Volume value display on slider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2">
              <div className="bg-white border-2 border-gray-300 rounded-full px-4 py-1 shadow-lg">
                <span className="text-lg font-bold text-gray-900">{Math.round(currentVolume * 100)}</span>
              </div>
            </div>
          </div>

          {/* Plus Button - ReSound style (larger, darker) */}
          <button
            onClick={() => handleVolumeChange(currentVolume + 0.05)}
            disabled={isSubmitting || currentVolume >= 1}
            className="w-16 h-16 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          >
            <Plus className="w-6 h-6" />
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

