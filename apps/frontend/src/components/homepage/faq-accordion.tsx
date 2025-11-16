'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqResponse } from '@/lib/api';
import type { Locale } from '@/lib/locale';

interface FAQAccordionProps {
  faqs: FaqResponse[];
  locale: Locale;
}

export default function FAQAccordion({ faqs, locale }: FAQAccordionProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Transform FAQs with proper IDs
  const faqItems = faqs.slice(0, 10).map((item, index) => {
    const question = locale === 'ru' ? (item.question_ru || '') : (item.question_uz || '');
    const answer = locale === 'ru' ? (item.answer_ru || '') : (item.answer_uz || '');
    const uniqueId = item.id || `faq-${index}`;
    return {
      id: uniqueId,
      question: question || '',
      answer: answer || '',
    };
  });

  return (
    <section className="border-t bg-white py-12">
      <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-brand-primary md:text-3xl" suppressHydrationWarning>
            {locale === 'ru' ? 'Часто задаваемые вопросы' : 'Tez-tez beriladigan savollar'}
          </h2>
          <div className="h-px w-20 bg-border"></div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.length > 0 ? (
            faqItems.map((item) => {
              const isOpen = openFaqId === item.id;
              const answerId = `faq-answer-${item.id}`;
              const buttonId = `faq-button-${item.id}`;
              return (
                <div
                  key={item.id}
                  className="group rounded-lg border border-border/60 bg-muted/30 p-4 transition hover:border-brand-primary/50 hover:shadow-sm"
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => {
                      setOpenFaqId(isOpen ? null : item.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenFaqId(isOpen ? null : item.id);
                      }
                    }}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded text-left focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                  >
                    <span className="flex-1 text-sm font-medium text-foreground" suppressHydrationWarning>
                      {item.question}
                    </span>
                    <ChevronDown 
                      aria-hidden="true"
                      className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {isOpen && (
                    <div 
                      id={answerId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="mt-3 text-sm text-muted-foreground leading-relaxed" 
                      suppressHydrationWarning
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground" suppressHydrationWarning>
                {locale === 'ru' 
                  ? 'Вопросов пока нет.' 
                  : 'Hozircha savollar yo\'q.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

