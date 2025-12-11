'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getBilingualText, type Locale } from '@/lib/locale';

interface WorkingHoursDisplayProps {
  workingHours_uz?: string | null;
  workingHours_ru?: string | null;
  locale: Locale;
}

// Helper function to parse working hours and highlight current day
function parseWorkingHoursClient(workingHours: string, locale: 'uz' | 'ru') {
  if (!workingHours) return { lines: [], currentDayLine: null };

  const lines = workingHours.split('\n').filter(line => line.trim());
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  const dayNames: Record<string, Record<string, number>> = {
    uz: {
      'yakshanba': 0, 'dushanba': 1, 'seshanba': 2, 'chorshanba': 3,
      'payshanba': 4, 'juma': 5, 'shanba': 6,
    },
    ru: {
      'воскресенье': 0, 'понедельник': 1, 'вторник': 2, 'среда': 3,
      'четверг': 4, 'пятница': 5, 'суббота': 6,
    },
  };

  const dayMap = dayNames[locale];
  let currentDayLine: number | null = null;

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    for (const [dayName, dayNumber] of Object.entries(dayMap)) {
      if (dayNumber === today && lowerLine.includes(dayName)) {
        currentDayLine = index;
        return;
      }
    }

    if (currentDayLine === null) {
      const rangePatterns: Record<string, Array<[number, number]>> = {
        uz: [[1, 5], [5, 6], [6, 0]],
        ru: [[1, 5], [5, 6], [6, 0]],
      };
      const ranges = rangePatterns[locale];
      for (const [startDay, endDay] of ranges) {
        const startDayName = Object.entries(dayMap).find(([_, num]) => num === startDay)?.[0];
        const endDayName = Object.entries(dayMap).find(([_, num]) => num === endDay)?.[0];

        if (startDayName && endDayName && lowerLine.includes(startDayName) && lowerLine.includes(endDayName)) {
          if (startDay <= endDay) {
            if (today >= startDay && today <= endDay) {
              currentDayLine = index;
              break;
            }
          } else {
            if (today >= startDay || today <= endDay) {
              currentDayLine = index;
              break;
            }
          }
        }
      }
    }
  });

  return { lines, currentDayLine };
}

export default function WorkingHoursDisplay({ workingHours_uz, workingHours_ru, locale }: WorkingHoursDisplayProps) {
  const workingHours = getBilingualText(workingHours_uz, workingHours_ru, locale) || '';
  
  // Parse lines (this is safe - no date logic)
  const lines = workingHours.split('\n').filter(line => line.trim());
  
  // Track if component is mounted (client-side) to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [currentDayLine, setCurrentDayLine] = useState<number | null>(null);
  
  useEffect(() => {
    // Mark as mounted (client-side)
    setMounted(true);
    
    // Compute current day only on client-side after hydration
    if (workingHours) {
      const result = parseWorkingHoursClient(workingHours, locale);
      setCurrentDayLine(result.currentDayLine);
    }
  }, [workingHours, locale]);

  if (!workingHours_uz && !workingHours_ru) {
    return (
      <div>
        <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
          {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
        </h3>
        <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-primary flex-shrink-0 mt-0.5" />
            <span className="break-words" suppressHydrationWarning>
              {locale === 'ru' ? 'Понедельник - Пятница' : 'Dushanba - Juma'}: 09:00-20:00
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand-primary flex-shrink-0 mt-0.5" />
            <span className="break-words" suppressHydrationWarning>
              {locale === 'ru' ? 'Суббота - Воскресенье' : 'Shanba - Yakshanba'}: 09:00-18:00
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning>
      <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
        {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
      </h3>
      <div className="space-y-1.5 text-xs sm:text-sm" suppressHydrationWarning>
        {lines.map((line, idx) => {
          // Only highlight current day after component is mounted (client-side)
          // This prevents hydration mismatch between server and client
          const isCurrentDay = mounted && idx === currentDayLine;
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors ${
                isCurrentDay 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'text-muted-foreground hover:bg-gray-50'
              }`}
              suppressHydrationWarning
            >
              <Clock className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5 ${
                isCurrentDay ? 'text-white' : 'text-brand-primary'
              }`} suppressHydrationWarning />
              <span 
                className={`break-words ${isCurrentDay ? 'font-semibold text-white' : ''}`}
                suppressHydrationWarning
              >
                {line.trim()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

