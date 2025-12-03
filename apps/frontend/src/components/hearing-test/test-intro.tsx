'use client';

import { Headphones, Volume2, VolumeX } from 'lucide-react';
import type { Locale } from '@/lib/locale';

interface TestIntroProps {
  locale: Locale;
  onContinue: () => void;
}

export default function TestIntro({ locale, onContinue }: TestIntroProps) {
  const isRu = locale === 'ru';

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      {/* Main Instruction */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          {isRu ? 'Найдите тихое место и наденьте наушники' : 'Sokin joy toping va quloqchinlarni qo\'ying'}
        </h1>
        <p className="text-xl text-gray-600">
          {isRu ? 'Рекомендуется использовать наушники для более точных результатов' : 'Aniqroq natijalar uchun quloqchinlardan foydalanish tavsiya etiladi'}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Step 1 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg">
            1
          </div>
          <div className="flex-1 flex items-center justify-between">
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
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg">
            2
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

        {/* Step 3 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-lg">
            3
          </div>
          <div className="flex-1">
            <p className="text-lg text-gray-800">
              {isRu
                ? 'Если вы используете слуховые аппараты, рекомендуется снять их перед тестом'
                : 'Agar eshitish apparatlaridan foydalanayotgan bo\'lsangiz, testdan oldin ularni olib tashlash tavsiya etiladi'}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
        <p className="text-sm text-yellow-800 text-center">
          {isRu
            ? '⚠️ Этот тест не заменяет визит к специалисту по слуху и не является медицинским диагнозом. Если вы считаете, что у вас проблемы со слухом, обратитесь к профессиональному специалисту.'
            : '⚠️ Bu test surdolog mutaxassisiga tashrifni almashtirmaydi va tibbiy tashxis emas. Agar eshitish bilan muammo bor deb o\'ylasangiz, professional mutaxassisga murojaat qiling.'}
        </p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold text-lg hover:bg-brand-primary/90 transition-colors shadow-lg"
        >
          {isRu ? 'Продолжить' : 'Davom etish'}
        </button>
      </div>
    </div>
  );
}

