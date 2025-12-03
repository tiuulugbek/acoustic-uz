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
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {isRu ? 'Результаты теста' : 'Test natijalari'}
        </h2>
        <p className="text-gray-600">
          {isRu
            ? 'Этот тест не заменяет профессиональную диагностику'
            : 'Bu test professional diagnostikani almashtirmaydi'}
        </p>
      </div>

      {/* Overall Score */}
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">{isRu ? 'Общий результат' : 'Umumiy natija'}</p>
          <div className="text-5xl font-bold text-brand-primary mb-2">
            {result.overallScore ?? 'N/A'}%
          </div>
          <div className={`inline-block px-4 py-2 rounded-full ${getLevelColor(result.leftEarLevel)}`}>
            <span className="font-semibold">
              {result.leftEarLevel
                ? levelNames[result.leftEarLevel]?.[locale] || result.leftEarLevel
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Left Ear */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isRu ? 'Левое ухо' : 'Chap quloq'}
            </h3>
            {getScoreIcon(result.leftEarScore)}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{isRu ? 'Результат' : 'Natija'}</span>
              <span className="text-2xl font-bold text-gray-900">
                {result.leftEarScore ?? 'N/A'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{isRu ? 'Уровень' : 'Daraja'}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(result.leftEarLevel)}`}>
                {result.leftEarLevel
                  ? levelNames[result.leftEarLevel]?.[locale] || result.leftEarLevel
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Ear */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isRu ? 'Правое ухо' : 'O\'ng quloq'}
            </h3>
            {getScoreIcon(result.rightEarScore)}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{isRu ? 'Результат' : 'Natija'}</span>
              <span className="text-2xl font-bold text-gray-900">
                {result.rightEarScore ?? 'N/A'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{isRu ? 'Уровень' : 'Daraja'}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(result.rightEarLevel)}`}>
                {result.rightEarLevel
                  ? levelNames[result.rightEarLevel]?.[locale] || result.rightEarLevel
                  : 'N/A'}
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
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onContact}
          className="px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors shadow-lg"
        >
          {isRu ? 'Связаться с нами' : 'Biz bilan bog\'lanish'}
        </button>
        <button
          onClick={onRestart}
          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          {isRu ? 'Повторить тест' : 'Testni takrorlash'}
        </button>
      </div>
    </div>
  );
}

