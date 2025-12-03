'use client';

import { useState } from 'react';
import { Volume2, Play, Square, Headphones } from 'lucide-react';
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

      {/* Instructions */}
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg">
            1
          </div>
          <div className="flex-1 flex items-center justify-between">
            <p className="text-lg text-gray-800">
              {isRu
                ? 'Установите наушники и устройство на максимальную громкость'
                : 'Quloqchinlar va qurilma ovozini maksimal darajaga o\'rnating'}
            </p>
            <Volume2 className="w-8 h-8 text-gray-400 flex-shrink-0 ml-4" />
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg">
            2
          </div>
          <div className="flex-1 flex items-center justify-between">
            <p className="text-lg text-gray-800">
              {isRu
                ? 'Нажмите кнопку воспроизведения и прослушайте тестовый звук'
                : 'Ijro etish tugmasini bosing va test ovozini tinglang'}
            </p>
            <Headphones className="w-8 h-8 text-gray-400 flex-shrink-0 ml-4" />
          </div>
        </div>
      </div>

      {/* Test Button */}
      <div className="flex justify-center py-12">
        <button
          onClick={isPlaying ? stopTone : handlePlayTest}
          className={`w-48 h-48 rounded-full flex items-center justify-center text-white transition-all transform ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 scale-105'
              : 'bg-brand-primary hover:bg-brand-primary/90 hover:scale-105'
          } shadow-2xl`}
        >
          {isPlaying ? (
            <Square className="w-20 h-20" />
          ) : (
            <Play className="w-20 h-20 ml-3" />
          )}
        </button>
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

