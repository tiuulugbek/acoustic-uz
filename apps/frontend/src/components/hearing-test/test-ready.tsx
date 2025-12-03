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
    <div className="space-y-10 max-w-3xl mx-auto text-center">
      <div className="space-y-4">
        <p className="text-xl md:text-2xl text-gray-600 font-medium">
          {isRu ? 'Вы готовы к тесту!' : 'Testga tayyorsiz!'}
        </p>
        <div className="space-y-2">
          <p className="text-3xl md:text-4xl font-bold text-gray-900">
            {isRu ? 'Начнем с' : 'Boshlaymiz'}
          </p>
          <p className="text-3xl md:text-4xl font-bold">
            <span className="text-gray-400">{isRu ? 'левого' : 'chap'}</span>
            <span className="text-brand-primary mx-2">
              {ear === 'left' ? (isRu ? 'уха' : 'quloq') : (isRu ? 'уха' : 'quloq')}
            </span>
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 pt-8">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          {isRu ? '← Назад' : '← Orqaga'}
        </button>
        <button
          onClick={onContinue}
          className="px-10 py-3 bg-brand-primary text-white rounded-xl font-bold text-lg hover:bg-brand-primary/90 transition-all transform hover:scale-105 shadow-lg"
        >
          {isRu ? 'Продолжить →' : 'Davom etish →'}
        </button>
      </div>
    </div>
  );
}

