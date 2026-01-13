import type { BannerResponse } from '@/lib/api';
import type { Locale } from '@/lib/locale';
interface HeroSliderProps {
    banners: BannerResponse[];
    locale: Locale;
    apiBaseUrl: string;
    phoneNumber?: string;
    phoneLink?: string;
}
export default function HeroSlider({ banners, locale, apiBaseUrl, phoneNumber, phoneLink }: HeroSliderProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=hero-slider.d.ts.map