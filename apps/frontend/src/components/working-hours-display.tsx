'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import type { Locale } from '@/lib/locale';

interface WorkingHoursDisplayProps {
  lines: string[];
  locale: Locale;
}

export default function WorkingHoursDisplay({ lines, locale }: WorkingHoursDisplayProps) {
  // Compute current day client-side only to prevent hydration mismatch
  const currentDayLine = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Day names mapping
    const dayNames: Record<string, Record<string, number>> = {
      uz: {
        'yakshanba': 0,
        'dushanba': 1,
        'seshanba': 2,
        'chorshanba': 3,
        'payshanba': 4,
        'juma': 5,
        'shanba': 6,
      },
      ru: {
        'воскресенье': 0,
        'понедельник': 1,
        'вторник': 2,
        'среда': 3,
        'четверг': 4,
        'пятница': 5,
        'суббота': 6,
      },
    };
    
    const dayMap = dayNames[locale];
    let foundLine: number | null = null;
    
    // Find current day line
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      
      // Check if line contains current day name
      for (const [dayName, dayNumber] of Object.entries(dayMap)) {
        if (dayNumber === today && lowerLine.includes(dayName)) {
          foundLine = index;
          break;
        }
      }
      
      // Also check for day ranges
      if (foundLine === null) {
        const rangePatterns: Record<string, Array<[number, number]>> = {
          uz: [
            [1, 5], // Dushanba - Juma
            [5, 6], // Juma - Shanba
            [6, 0], // Shanba - Yakshanba
          ],
          ru: [
            [1, 5], // Понедельник - Пятница
            [5, 6], // Пятница - Суббота
            [6, 0], // Суббота - Воскресенье
          ],
        };
        
        const ranges = rangePatterns[locale];
        for (const [startDay, endDay] of ranges) {
          const startDayName = Object.entries(dayMap).find(([_, num]) => num === startDay)?.[0];
          const endDayName = Object.entries(dayMap).find(([_, num]) => num === endDay)?.[0];
          
          if (startDayName && endDayName && lowerLine.includes(startDayName) && lowerLine.includes(endDayName)) {
            if (startDay <= endDay) {
              if (today >= startDay && today <= endDay) {
                foundLine = index;
                break;
              }
            } else {
              if (today >= startDay || today <= endDay) {
                foundLine = index;
                break;
              }
            }
          }
        }
      }
    });
    
    return foundLine;
  }, [lines, locale]);

  return (
    <div>
      <h3 className="mb-2 text-xs sm:text-sm font-semibold text-foreground uppercase" suppressHydrationWarning>
        {locale === 'ru' ? 'Время работы' : 'Ish vaqti'}
      </h3>
      <div className="space-y-1.5 text-xs sm:text-sm">
        {lines.map((line, idx) => {
          const isCurrentDay = idx === currentDayLine;
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-2 rounded-md px-2 py-1.5 transition-colors ${
                isCurrentDay 
                  ? 'bg-brand-primary text-white shadow-sm' 
                  : 'text-muted-foreground hover:bg-gray-50'
              }`}
            >
              <Clock className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5 ${
                isCurrentDay ? 'text-white' : 'text-brand-primary'
              }`} />
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

