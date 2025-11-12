import { type Locale } from '../types';
export declare function getLocalizedText(text: {
    uz: string;
    ru: string;
} | null | undefined, locale: Locale): string;
export declare function generateSlug(text: string): string;
export declare function formatPhone(phone: string): string;
export declare function isValidEmail(email: string): boolean;
export declare function truncate(text: string, length: number): string;
export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void;
//# sourceMappingURL=index.d.ts.map