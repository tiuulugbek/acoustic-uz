'use client';

import { Speaker, Headphones } from 'lucide-react';
import type { Locale } from '@/lib/locale';

interface DeviceSelectionProps {
  locale: Locale;
  onSelect: (device: 'speaker' | 'headphone') => void;
  onBack: () => void;
}

export default function DeviceSelection({ locale, onSelect, onBack }: DeviceSelectionProps) {
  const isRu = locale === 'ru';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isRu ? 'Выберите устройство' : 'Qurilmani tanlang'}
        </h2>
        <p className="text-gray-600">
          {isRu ? 'Какой тип устройства вы будете использовать?' : 'Qanday turdagi qurilmadan foydalanasiz?'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Headphone Option */}
        <button
          onClick={() => onSelect('headphone')}
          className="group p-8 border-2 border-gray-200 rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
              <Headphones className="w-10 h-10 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isRu ? 'Наушники' : 'Quloqchinlar'}
              </h3>
              <p className="text-sm text-gray-600">
                {isRu
                  ? 'Рекомендуется для более точных результатов. Каждое ухо тестируется отдельно.'
                  : 'Aniqroq natijalar uchun tavsiya etiladi. Har bir quloq alohida test qilinadi.'}
              </p>
            </div>
          </div>
        </button>

        {/* Speaker Option */}
        <button
          onClick={() => onSelect('speaker')}
          className="group p-8 border-2 border-gray-200 rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
              <Speaker className="w-10 h-10 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isRu ? 'Динамики' : 'Speaker'}
              </h3>
              <p className="text-sm text-gray-600">
                {isRu
                  ? 'Можно использовать динамики устройства, но результаты могут быть менее точными.'
                  : 'Qurilma speakerlaridan foydalanish mumkin, lekin natijalar kamroq aniq bo\'lishi mumkin.'}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {isRu ? 'Назад' : 'Orqaga'}
        </button>
      </div>
    </div>
  );
}

