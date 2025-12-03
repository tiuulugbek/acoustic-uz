'use client';

import { useState } from 'react';
import { Volume2, Play, Square } from 'lucide-react';
import type { Locale } from '@/lib/locale';

interface VolumeCalibrationProps {
  locale: Locale;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onContinue: (volume: number) => void;
  onBack: () => void;
  playTone: (options: { frequency: number; volume: number; duration?: number; onEnd?: () => void }) => void;
  stopTone: () => void;
  isPlaying: boolean;
}

export default function VolumeCalibration({
  locale,
  volume,
  onVolumeChange,
  onContinue,
  onBack,
  playTone,
  stopTone,
  isPlaying,
}: VolumeCalibrationProps) {
  const isRu = locale === 'ru';
  const [hasPlayed, setHasPlayed] = useState(false);

  const handlePlayTest = () => {
    playTone({
      frequency: 1000,
      volume: volume,
      duration: 2000,
      onEnd: () => setHasPlayed(true),
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isRu ? 'Настройте громкость' : 'Ovozni sozlang'}
        </h2>
        <p className="text-gray-600">
          {isRu
            ? 'Установите максимальную громкость и прослушайте тестовый звук'
            : 'Maksimal ovozni o\'rnating va test ovozini tinglang'}
        </p>
      </div>

      {/* Volume Slider */}
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{isRu ? 'Тихий' : 'Past'}</span>
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-semibold text-gray-900">{Math.round(volume * 100)}%</span>
          </div>
          <span className="text-sm text-gray-600">{isRu ? 'Громко' : 'Baland'}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
        />
      </div>

      {/* Test Button */}
      <div className="flex justify-center py-8">
        <button
          onClick={isPlaying ? stopTone : handlePlayTest}
          className={`w-40 h-40 rounded-full flex items-center justify-center text-white transition-all transform ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 scale-105'
              : 'bg-brand-primary hover:bg-brand-primary/90 hover:scale-105'
          } shadow-2xl`}
        >
          {isPlaying ? (
            <Square className="w-16 h-16" />
          ) : (
            <Play className="w-16 h-16 ml-2" />
          )}
        </button>
      </div>

      {/* Instructions */}
      {hasPlayed && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-800 text-center">
            {isRu
              ? 'Если вы четко слышите звук, можете продолжить. Если нет, увеличьте громкость.'
              : 'Agar ovozni aniq eshitsangiz, davom etishingiz mumkin. Agar yo\'q bo\'lsa, ovozni oshiring.'}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          {isRu ? '← Назад' : '← Orqaga'}
        </button>
        <button
          onClick={() => onContinue(volume)}
          disabled={!hasPlayed}
          className="px-10 py-3 bg-brand-primary text-white rounded-xl font-bold text-lg hover:bg-brand-primary/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isRu ? 'Продолжить →' : 'Davom etish →'}
        </button>
      </div>
    </div>
  );
}

