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
    <div className="space-y-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          {isRu
            ? ear === 'left' ? 'Тест левого уха' : 'Тест правого уха'
            : ear === 'left' ? 'Chap quloq testi' : 'O\'ng quloq testi'}
        </h2>
        <p className="text-xl text-gray-600 font-medium">
          {isRu
            ? `${currentFrequency} Гц`
            : `${currentFrequency} Hz`}
        </p>
        <div className="mt-2">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 rounded-full">
            <span className="text-base font-semibold text-gray-700">
              {currentIndex + 1} / {frequencies.length}
            </span>
          </div>
        </div>
      </div>

      {/* Test Area */}
      <div className="space-y-8">
        {/* Play Button */}
        <div className="flex justify-center py-8">
          <button
            onClick={isPlaying ? stopTone : handlePlay}
            disabled={isSubmitting}
            className={`w-40 h-40 rounded-full flex items-center justify-center text-white transition-all transform ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 scale-105'
                : 'bg-brand-primary hover:bg-brand-primary/90 hover:scale-105'
            } shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100`}
          >
            {isPlaying ? (
              <Square className="w-16 h-16" />
            ) : (
              <Play className="w-16 h-16 ml-2" />
            )}
          </button>
        </div>

        {/* Answer Buttons */}
        {hasPlayed && !results[currentFrequency.toString()] && (
          <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
            <button
              onClick={() => handleAnswer(true)}
              disabled={isSubmitting}
              className="px-8 py-6 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <Check className="w-6 h-6" />
              {isRu ? 'Слышу' : 'Eshitdim'}
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={isSubmitting}
              className="px-8 py-6 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <X className="w-6 h-6" />
              {isRu ? 'Не слышу' : 'Eshitmadim'}
            </button>
          </div>
        )}

        {/* Result Display */}
        {results[currentFrequency.toString()] !== undefined && (
          <div className="text-center py-4">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-bold ${
              results[currentFrequency.toString()]
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {results[currentFrequency.toString()] ? (
                <>
                  <Check className="w-6 h-6" />
                  <span>{isRu ? 'Слышу' : 'Eshitdim'}</span>
                </>
              ) : (
                <>
                  <X className="w-6 h-6" />
                  <span>{isRu ? 'Не слышу' : 'Eshitmadim'}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Next Button */}
        {results[currentFrequency.toString()] !== undefined && !isLast && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-10 py-4 bg-brand-primary text-white rounded-xl font-bold text-lg hover:bg-brand-primary/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isRu ? 'Следующая частота →' : 'Keyingi chastota →'}
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

