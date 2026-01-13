'use client';

import { useEffect } from 'react';
import type { Locale } from '@/lib/locale';

interface TestReadyProps {
  locale: Locale;
  ear: 'left' | 'right';
  onContinue: () => void;
  onBack: () => void;
}

export default function TestReady({ locale, ear, onContinue, onBack }: TestReadyProps) {
  const isRu = locale === 'ru';

  // Avtomatik o'tish - 2 sekunddan keyin
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto text-center min-h-[60vh] flex flex-col justify-center px-4">
      {/* Ear Icon - Professional style */}
      <div className="flex justify-center py-6">
        <div className="relative w-40 h-40 md:w-56 md:h-56">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 200"
            className="text-brand-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Outer ear helix */}
            <path
              d="M100 35 C75 35, 55 50, 45 75 C40 95, 45 115, 55 135 C65 155, 80 165, 100 165 C120 165, 135 155, 145 135 C155 115, 160 95, 155 75 C145 50, 125 35, 100 35 Z"
              fill="currentColor"
              fillOpacity="0.05"
            />
            {/* Inner ear concha */}
            <path
              d="M100 55 C88 55, 78 62, 72 75 C68 88, 70 102, 78 115 C84 125, 92 130, 100 130 C108 130, 116 125, 122 115 C130 102, 132 88, 128 75 C122 62, 112 55, 100 55 Z"
              fill="currentColor"
              fillOpacity="0.1"
            />
            {/* Ear canal */}
            <ellipse
              cx="100"
              cy="100"
              rx="8"
              ry="12"
              fill="currentColor"
              fillOpacity="0.15"
            />
            {/* Ear details - folds */}
            <path
              d="M85 70 Q90 75, 95 70"
              strokeWidth="1.5"
            />
            <path
              d="M105 70 Q110 75, 115 70"
              strokeWidth="1.5"
            />
            <path
              d="M90 90 Q95 95, 100 90"
              strokeWidth="1.5"
            />
            <path
              d="M100 90 Q105 95, 110 90"
              strokeWidth="1.5"
            />
          </svg>
          {/* Ear label (L or R) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-brand-primary font-bold text-5xl md:text-6xl opacity-20">
              {ear === 'left' ? 'L' : 'R'}
            </span>
          </div>
        </div>
      </div>

      {/* Simple text */}
      <p className="text-lg md:text-xl text-gray-600">
        {isRu 
          ? `Начинаем тест ${ear === 'left' ? 'левого' : 'правого'} уха...`
          : `${ear === 'left' ? 'Chap' : 'O\'ng'} quloq testi boshlanmoqda...`}
      </p>
    </div>
  );
}

