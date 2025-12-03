'use client';

import { useState } from 'react';
import { Volume2, Play, Square, Headphones, VolumeX } from 'lucide-react';
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

  // ReSound kabi: test ovozini doim maksimal balandlikda ijro etish
  // Foydalanuvchi qurilma ovozini sozlaydi (browser/system volume)
  const handlePlayTest = () => {
    // Test ovozini maksimal balandlikda ijro etish (1.0)
    // Foydalanuvchi qurilma ovozini sozlaydi
    playTone({
      frequency: 1000,
      volume: 1.0, // Doim maksimal
      duration: 3000, // ReSound kabi uzoqroq
      onEnd: () => setHasPlayed(true),
    });
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          {isRu ? 'Проверьте наушники' : 'Quloqchinlarni tekshiring'}
        </h2>
        <p className="text-xl text-gray-600">
          {isRu
            ? 'Убедитесь, что наушники работают правильно'
            : 'Quloqchinlar to\'g\'ri ishlayotganini tekshiring'}
        </p>
      </div>

      {/* Instructions - ReSound style */}
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xl">
            1
          </div>
          <div className="flex-1 flex items-center justify-between pt-1">
            <p className="text-lg text-gray-800">
              {isRu
                ? 'Найдите тихое место с минимальным шумом'
                : 'Juda kam shovqin bo\'lgan sokin joy toping'}
            </p>
            <VolumeX className="w-8 h-8 text-gray-400 flex-shrink-0 ml-4" />
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xl">
            2
          </div>
          <div className="flex-1 flex items-center justify-between pt-1">
            <p className="text-lg text-gray-800">
              {isRu
                ? 'Установите наушники и устройство на максимальную громкость'
                : 'Quloqchinlar va qurilma ovozini maksimal darajaga o\'rnating'}
            </p>
            <Volume2 className="w-8 h-8 text-gray-400 flex-shrink-0 ml-4" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xl">
            3
          </div>
          <div className="flex-1 flex items-center justify-between pt-1">
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900 mb-1">
                {isRu
                  ? 'Проверьте наушники'
                  : 'Quloqchinlarni tekshiring'}
              </p>
              <p className="text-lg text-gray-800">
                {isRu
                  ? 'чтобы убедиться, что они работают правильно'
                  : 'to\'g\'ri ishlayotganini tekshiring'}
              </p>
            </div>
            <Headphones className="w-8 h-8 text-gray-400 flex-shrink-0 ml-4" />
          </div>
        </div>
      </div>

      {/* Test Button - ReSound style */}
      <div className="flex items-center justify-center gap-4 py-8">
        <button
          onClick={isPlaying ? stopTone : handlePlayTest}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all transform ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 scale-105'
              : 'bg-gray-800 hover:bg-gray-900 hover:scale-105'
          } shadow-lg`}
        >
          {isPlaying ? (
            <Square className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>
        <span className="text-lg font-medium text-gray-900">
          {isRu ? 'Воспроизвести звук' : 'Ovozni ijro etish'}
        </span>
      </div>

      {/* Instructions after playing */}
      {hasPlayed && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
          <p className="text-base text-blue-800 text-center font-medium">
            {isRu
              ? '✅ Если вы четко слышите звук, можете продолжить. Если нет, увеличьте громкость устройства и попробуйте снова.'
              : '✅ Agar ovozni aniq eshitsangiz, davom etishingiz mumkin. Agar yo\'q bo\'lsa, qurilma ovozini oshiring va qayta urinib ko\'ring.'}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-center gap-4 pt-6">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          {isRu ? '← Назад' : '← Orqaga'}
        </button>
        <button
          onClick={() => onContinue(1.0)} // Maksimal volume
          disabled={!hasPlayed}
          className="px-10 py-3 bg-brand-primary text-white rounded-xl font-bold text-lg hover:bg-brand-primary/90 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isRu ? 'Продолжить →' : 'Davom etish →'}
        </button>
      </div>
    </div>
  );
}

