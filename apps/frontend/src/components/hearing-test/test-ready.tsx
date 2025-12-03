'use client';

import type { Locale } from '@/lib/locale';

interface TestReadyProps {
  locale: Locale;
  ear: 'left' | 'right';
  onContinue: () => void;
  onBack: () => void;
}

export default function TestReady({ locale, ear, onContinue, onBack }: TestReadyProps) {
  const isRu = locale === 'ru';

  return (
    <div className="space-y-12 max-w-3xl mx-auto text-center min-h-[60vh] flex flex-col justify-center">
      {/* Ear Icon - ReSound style */}
      <div className="flex justify-center py-8">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="text-brand-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {/* Ear outline */}
          <path
            d="M100 40 C80 40, 60 50, 50 70 C50 90, 60 110, 70 130 C80 150, 90 160, 100 160 C110 160, 120 150, 130 130 C140 110, 150 90, 150 70 C140 50, 120 40, 100 40 Z"
          />
          {/* Inner ear details */}
          <path
            d="M100 60 C85 60, 70 70, 65 85 C65 100, 70 115, 80 130 C85 140, 90 145, 100 145 C110 145, 115 140, 120 130 C130 115, 135 100, 135 85 C130 70, 115 60, 100 60 Z"
            fill="currentColor"
            fillOpacity="0.1"
          />
        </svg>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          {isRu ? 'Назад' : 'Orqaga'}
        </button>
        <button
          onClick={onContinue}
          className="px-10 py-3 bg-brand-primary text-white rounded-xl font-bold text-lg hover:bg-brand-primary/90 transition-all transform hover:scale-105 shadow-lg"
        >
          {isRu ? 'Продолжить' : 'Davom etish'}
        </button>
      </div>
    </div>
  );
}

