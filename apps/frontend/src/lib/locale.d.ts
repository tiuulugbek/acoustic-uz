export type Locale = 'uz' | 'ru';
export declare const DEFAULT_LOCALE: Locale;
export declare const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
export declare const LOCALE_COOKIE_MAX_AGE: number;
/**
 * Get bilingual text with fallback
 */
export declare function getBilingualText(textUz: string | null | undefined, textRu: string | null | undefined, locale: Locale): string;
/**
 * Language labels in their own language
 */
export declare const LOCALE_LABELS: Record<Locale, string>;
export declare const LOCALE_CODES: Record<Locale, string>;
//# sourceMappingURL=locale.d.ts.map