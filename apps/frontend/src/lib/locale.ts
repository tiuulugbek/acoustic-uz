export type Locale = 'uz' | 'ru';

export const DEFAULT_LOCALE: Locale = 'uz';
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Get bilingual text with fallback
 */
export function getBilingualText(textUz: string | null | undefined, textRu: string | null | undefined, locale: Locale): string {
  if (locale === 'ru') {
    return textRu || textUz || '';
  }
  return textUz || textRu || '';
}

/**
 * Language labels in their own language
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: 'Русский',
};

export const LOCALE_CODES: Record<Locale, string> = {
  uz: 'UZ',
  ru: 'RU',
};
