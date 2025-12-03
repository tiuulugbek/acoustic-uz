'use client';

import { useState, useEffect } from 'react';
import { Play, Square, Check, X } from 'lucide-react';
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
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [hasPlayed, setHasPlayed] = useState(false);

  const currentFrequency = frequencies[currentIndex];
  const isLast = currentIndex === frequencies.length - 1;
  const allAnswered = Object.keys(results).length === frequencies.length;

  useEffect(() => {
    // Reset when component mounts or ear changes
    setCurrentIndex(0);
    setResults({});
    setHasPlayed(false);
    stopTone();
  }, [ear, stopTone]);

  const handlePlay = () => {
    playTone({
      frequency: currentFrequency,
      volume: volume,
      duration: 2000,
      onEnd: () => setHasPlayed(true),
    });
  };

  const handleAnswer = (heard: boolean) => {
    const newResults = {
      ...results,
      [currentFrequency.toString()]: heard,
    };
    setResults(newResults);
    setHasPlayed(false);
    stopTone();

    if (isLast) {
      // All frequencies tested
      setTimeout(() => {
        onComplete(newResults);
      }, 300);
    } else {
      // Move to next frequency
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    }
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(results);
    } else {
      setCurrentIndex(currentIndex + 1);
      setHasPlayed(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isRu
            ? ear === 'left' ? 'Тест левого уха' : 'Тест правого уха'
            : ear === 'left' ? 'Chap quloq testi' : 'O\'ng quloq testi'}
        </h2>
        <p className="text-gray-600">
          {isRu
            ? `Частота ${currentFrequency} Гц`
            : `${currentFrequency} Hz chastota`}
        </p>
        <div className="mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-sm text-gray-600">
              {currentIndex + 1} / {frequencies.length}
            </span>
          </div>
        </div>
      </div>

      {/* Test Area */}
      <div className="max-w-md mx-auto space-y-6">
        {/* Play Button */}
        <div className="flex justify-center">
          <button
            onClick={isPlaying ? stopTone : handlePlay}
            disabled={isSubmitting}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-brand-primary hover:bg-brand-primary/90'
            } shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPlaying ? (
              <Square className="w-12 h-12" />
            ) : (
              <Play className="w-12 h-12 ml-1" />
            )}
          </button>
        </div>

        {/* Answer Buttons */}
        {hasPlayed && !results[currentFrequency.toString()] && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(true)}
              disabled={isSubmitting}
              className="px-6 py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5" />
              {isRu ? 'Слышу' : 'Eshitdim'}
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={isSubmitting}
              className="px-6 py-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
              {isRu ? 'Не слышу' : 'Eshitmadim'}
            </button>
          </div>
        )}

        {/* Result Display */}
        {results[currentFrequency.toString()] !== undefined && (
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              results[currentFrequency.toString()]
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {results[currentFrequency.toString()] ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">{isRu ? 'Слышу' : 'Eshitdim'}</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  <span className="font-semibold">{isRu ? 'Не слышу' : 'Eshitmadim'}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Next Button */}
        {results[currentFrequency.toString()] !== undefined && !isLast && (
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-8 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRu ? 'Следующая частота' : 'Keyingi chastota'}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {!allAnswered && (
        <div className="flex justify-center">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRu ? 'Назад' : 'Orqaga'}
          </button>
        </div>
      )}

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

