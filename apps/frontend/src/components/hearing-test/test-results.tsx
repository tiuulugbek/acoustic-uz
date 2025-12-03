'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Locale } from '@/lib/locale';

interface TestResultsProps {
  locale: Locale;
  result: {
    leftEarScore?: number | null;
    rightEarScore?: number | null;
    overallScore?: number | null;
    leftEarLevel?: string | null;
    rightEarLevel?: string | null;
  };
  onContact: () => void;
  onRestart: () => void;
}

const levelNames: Record<string, { uz: string; ru: string }> = {
  normal: { uz: 'Normal', ru: 'Нормальный' },
  mild: { uz: 'Yengil', ru: 'Легкая' },
  moderate: { uz: "O'rtacha", ru: 'Умеренная' },
  severe: { uz: "Og'ir", ru: 'Тяжелая' },
  profound: { uz: "Juda og'ir", ru: 'Глубокая' },
};

export default function TestResults({ locale, result, onContact, onRestart }: TestResultsProps) {
  const isRu = locale === 'ru';

  const getLevelColor = (level?: string | null) => {
    switch (level) {
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'mild':
        return 'text-yellow-600 bg-yellow-50';
      case 'moderate':
        return 'text-orange-600 bg-orange-50';
      case 'severe':
      case 'profound':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreIcon = (score?: number | null) => {
    if (!score) return <Minus className="w-5 h-5" />;
    if (score >= 80) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (score >= 50) return <Minus className="w-5 h-5 text-yellow-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-10 max-w-3xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
          {isRu ? 'Результаты теста' : 'Test natijalari'}
        </h2>
        <p className="text-xl text-gray-600">
          {isRu
            ? 'Этот тест не заменяет профессиональную диагностику'
            : 'Bu test professional diagnostikani almashtirmaydi'}
        </p>
      </div>

      {/* Overall Score */}
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-2xl p-8 text-center border-2 border-brand-primary/20">
          <p className="text-lg text-gray-600 mb-3 font-medium">{isRu ? 'Общий результат' : 'Umumiy natija'}</p>
          <div className="text-7xl font-bold text-brand-primary mb-4">
            {result.overallScore ?? 0}%
          </div>
          <div className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${getLevelColor(result.leftEarLevel)}`}>
            <span>
              {result.leftEarLevel
                ? levelNames[result.leftEarLevel]?.[locale] || result.leftEarLevel
                : 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Left Ear */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {isRu ? 'Левое ухо' : 'Chap quloq'}
            </h3>
            {getScoreIcon(result.leftEarScore)}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600 font-medium">{isRu ? 'Результат' : 'Natija'}</span>
              <span className="text-4xl font-bold text-gray-900">
                {result.leftEarScore ?? 0}%
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-base text-gray-600 font-medium">{isRu ? 'Уровень' : 'Daraja'}</span>
              <span className={`px-4 py-2 rounded-full text-base font-bold ${getLevelColor(result.leftEarLevel)}`}>
                {result.leftEarLevel
                  ? levelNames[result.leftEarLevel]?.[locale] || result.leftEarLevel
                  : 'Normal'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Ear */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {isRu ? 'Правое ухо' : 'O\'ng quloq'}
            </h3>
            {getScoreIcon(result.rightEarScore)}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600 font-medium">{isRu ? 'Результат' : 'Natija'}</span>
              <span className="text-4xl font-bold text-gray-900">
                {result.rightEarScore ?? 0}%
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-base text-gray-600 font-medium">{isRu ? 'Уровень' : 'Daraja'}</span>
              <span className={`px-4 py-2 rounded-full text-base font-bold ${getLevelColor(result.rightEarLevel)}`}>
                {result.rightEarLevel
                  ? levelNames[result.rightEarLevel]?.[locale] || result.rightEarLevel
                  : 'Normal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-blue-900 mb-2">
          {isRu ? 'Рекомендация' : 'Tavsiya'}
        </h3>
        <p className="text-sm text-blue-800">
          {isRu
            ? 'Для получения точного диагноза и профессиональной консультации обратитесь к специалисту по слуху. Мы рекомендуем записаться на прием для полного обследования.'
            : 'Aniq tashxis va professional maslahat olish uchun surdolog mutaxassisiga murojaat qiling. To\'liq tekshiruv uchun qabulga yozilishni tavsiya qilamiz.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <button
          onClick={onContact}
          className="px-10 py-4 bg-brand-primary text-white rounded-xl font-bold text-lg hover:bg-brand-primary/90 transition-all transform hover:scale-105 shadow-lg"
        >
          {isRu ? 'Связаться с нами →' : 'Biz bilan bog\'lanish →'}
        </button>
        <button
          onClick={onRestart}
          className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all transform hover:scale-105"
        >
          {isRu ? 'Повторить тест' : 'Testni takrorlash'}
        </button>
      </div>
    </div>
  );
}

