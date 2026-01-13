import type { SettingsResponse, BrandResponse } from '@/lib/api';
interface SidebarProps {
    locale: 'uz' | 'ru';
    settingsData?: SettingsResponse | null;
    brandsData?: BrandResponse[] | null;
    pageType?: 'catalog' | 'products' | 'services' | 'posts';
}
export default function Sidebar({ locale, settingsData, brandsData, pageType }: SidebarProps): Promise<import("react").JSX.Element>;
export {};
//# sourceMappingURL=sidebar.d.ts.map