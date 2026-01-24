'use client';

import { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import type { Locale } from '@/lib/locale';
import { AdaptiveTestAlgorithm } from '@/utils/adaptive-test';
import { SpeechInNoiseAudioService } from '@/services/audio-sin-service';

interface DigitsInNoiseTestProps {
  locale: Locale;
  ear: 'left' | 'right';
  onComplete: (results: {
    srt50: number;
    reversals: number[];
    trialCount: number;
    responses: Array<{
      trial: number;
      presented: string[];
      response: string[];
      correct: boolean;
      snr: number;
    }>;
  }) => void;
  onBack: () => void;
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function DigitsInNoiseTest({
  locale,
  ear,
  onComplete,
  onBack,
}: DigitsInNoiseTestProps) {
  const isRu = locale === 'ru';
  const [adaptive] = useState(() => new AdaptiveTestAlgorithm(0, 2));
  const [audioService] = useState(() => new SpeechInNoiseAudioService());
  
  const [currentTriplet, setCurrentTriplet] = useState<string[]>([]);
  const [selectedDigits, setSelectedDigits] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canReplay, setCanReplay] = useState(true);
  const [trialNumber, setTrialNumber] = useState(0);
  const [responses, setResponses] = useState<Array<{
    trial: number;
    presented: string[];
    response: string[];
    correct: boolean;
    snr: number;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize audio service
  useEffect(() => {
    audioService.initialize();
    audioService.loadSpeechFiles(locale);
    audioService.generateNoise(10);
    
    // Start first trial
    startNewTrial();
    
    return () => {
      audioService.cleanup();
    };
  }, [locale]);

  /**
   * Generate random triplet of digits
   */
  const generateRandomTriplet = (): string[] => {
    const triplet: string[] = [];
    for (let i = 0; i < 3; i++) {
      const digit = DIGITS[Math.floor(Math.random() * DIGITS.length)];
      triplet.push(digit);
    }
    return triplet;
  };

  /**
   * Start new trial
   */
  const startNewTrial = async () => {
    if (adaptive.shouldStop()) {
      // Test complete
      handleTestComplete();
      return;
    }

    const triplet = generateRandomTriplet();
    setCurrentTriplet(triplet);
    setSelectedDigits([]);
    setCanReplay(true);
    setTrialNumber(trialNumber + 1);

    // Play audio at current SNR
    await playAudio(triplet);
  };

  /**
   * Play audio triplet
   */
  const playAudio = async (triplet: string[]) => {
    setIsPlaying(true);
    const snr = adaptive.getCurrentSNR();
    
    try {
      await audioService.playTriplet(triplet, snr, ear);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  /**
   * Handle replay button
   */
  const handleReplay = async () => {
    if (canReplay && !isPlaying && currentTriplet.length > 0) {
      setCanReplay(false);
      await playAudio(currentTriplet);
    }
  };

  /**
   * Handle digit selection
   */
  const handleDigitSelect = (digit: string) => {
    if (selectedDigits.length < 3) {
      setSelectedDigits([...selectedDigits, digit]);
    }
  };

  /**
   * Handle clear selection
   */
  const handleClear = () => {
    setSelectedDigits([]);
  };

  /**
   * Handle submit response
   */
  const handleSubmit = () => {
    if (selectedDigits.length !== 3) return;

    const correct = JSON.stringify(currentTriplet) === JSON.stringify(selectedDigits);
    const currentSNR = adaptive.getCurrentSNR();
    
    // Update adaptive algorithm
    const newSNR = adaptive.updateSNR(correct);
    
    // Store response
    const response = {
      trial: trialNumber,
      presented: currentTriplet,
      response: selectedDigits,
      correct,
      snr: currentSNR,
    };
    
    setResponses([...responses, response]);

    // Continue to next trial
    setTimeout(() => {
      startNewTrial();
    }, 500);
  };

  /**
   * Handle test completion
   */
  const handleTestComplete = () => {
    const srt50 = adaptive.getSRT50();
    const state = adaptive.getState();
    
    onComplete({
      srt50: srt50 || 0,
      reversals: state.reversals,
      trialCount: state.trialCount,
      responses,
    });
  };

  const progress = adaptive.getReversalsCount();
  const maxProgress = 8;

  return (
    <div className="space-y-8 max-w-3xl mx-auto px-4">
      {/* Progress Indicator */}
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-600">
          {isRu ? 'Прогресс теста' : 'Test jarayoni'}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress / maxProgress) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500">
          {isRu 
            ? `Обращений: ${progress} / ${maxProgress}`
            : `O'zgarishlar: ${progress} / ${maxProgress}`
          }
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          {isRu
            ? 'Прослушайте три цифры'
            : 'Uchta raqamni eshiting'
          }
        </h2>
        <p className="text-gray-600">
          {isRu
            ? 'Вы услышите три цифры в шуме. Выберите услышанные цифры ниже.'
            : 'Shovqin muhitida uchta raqam eshitiladi. Eshitgan raqamlaringizni tanlang.'
          }
        </p>
      </div>

      {/* Replay Button */}
      <div className="flex justify-center">
        <button
          onClick={handleReplay}
          disabled={!canReplay || isPlaying}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{isRu ? 'Воспроизведение...' : 'Ijro etilmoqda...'}</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-5 h-5" />
              <span>{isRu ? 'Повторить' : 'Qayta eshitish'}</span>
            </>
          )}
        </button>
      </div>

      {/* Selected Digits Display */}
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-2">
          {isRu ? 'Выбранные цифры:' : 'Tanlangan raqamlar:'}
        </div>
        <div className="flex justify-center gap-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-gray-300 flex items-center justify-center text-2xl md:text-3xl font-bold text-gray-400 bg-gray-50"
            >
              {selectedDigits[index] || '_'}
            </div>
          ))}
        </div>
      </div>

      {/* Digit Selection Grid */}
      <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
        {DIGITS.map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigitSelect(digit)}
            disabled={selectedDigits.length >= 3 || isSubmitting}
            className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-gray-300 bg-white text-2xl md:text-3xl font-bold text-gray-900 hover:border-brand-primary hover:bg-brand-primary/5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {digit}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleClear}
          disabled={selectedDigits.length === 0 || isSubmitting}
          className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRu ? 'Очистить' : 'Tozalash'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedDigits.length !== 3 || isSubmitting}
          className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRu ? 'Далее' : 'Keyingi'}
        </button>
      </div>

      {/* Back Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRu ? '← Назад' : '← Orqaga'}
        </button>
      </div>

      {/* Loading */}
      {isSubmitting && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          <p className="mt-2 text-gray-600">
            {isRu ? 'Обработка результатов...' : 'Natijalar qayta ishlanmoqda...'}
          </p>
        </div>
      )}
    </div>
  );
}
