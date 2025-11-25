import Image from 'next/image';
import Link from 'next/link';
import { getSettings, getBrands } from '@/lib/api-server';
import type { SettingsResponse, BrandResponse, SidebarSection } from '@/lib/api';
import { detectLocale } from '@/lib/locale-server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface SidebarProps {
  locale: 'uz' | 'ru';
  settingsData?: SettingsResponse | null;
  brandsData?: BrandResponse[] | null;
  pageType?: 'catalog' | 'products' | 'services' | 'posts'; // Sahifa turi
}

export default async function Sidebar({ locale, settingsData, brandsData, pageType = 'catalog' }: SidebarProps) {
  // Get sidebar config for this page type
  const pageConfig = settingsData?.sidebarConfigs?.[pageType];
  
  // Get sidebar sections from page-specific config ONLY
  // No fallback to legacy sidebarSections - everything must come from sidebarConfigs
  const otherSections: SidebarSection[] = (pageConfig?.sections && Array.isArray(pageConfig.sections) && pageConfig.sections.length > 0)
    ? pageConfig.sections.sort((a, b) => (a.order || 0) - (b.order || 0))
    : []; // Empty array if no config - don't show sections

  // Filter brands based on page-specific config ONLY
  // No fallback to legacy sidebarBrandIds - everything must come from sidebarConfigs
  let mainBrands: BrandResponse[] = [];
  const pageBrandIds = pageConfig?.brandIds;
  if (pageBrandIds && pageBrandIds.length > 0) {
    // Use brands from page-specific config
    mainBrands = brandsData?.filter((brand) => 
      pageBrandIds.includes(brand.id)
    ) || [];
  }
  
  // Sort brands: maintain order from page-specific config
  const sortedBrands = pageBrandIds && pageBrandIds.length > 0
    ? [...mainBrands].sort((a, b) => {
        const aIndex = pageBrandIds.indexOf(a.id);
        const bIndex = pageBrandIds.indexOf(b.id);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      })
    : [];

  // Don't render sidebar if there's no content
  if (otherSections.length === 0 && sortedBrands.length === 0) {
    return null;
  }

  return (
    <aside className="lg:col-span-1 space-y-8">
      {/* Other Sections - Only show if sections exist */}
      {otherSections.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4" suppressHydrationWarning>
            {locale === 'ru' ? 'Другие разделы' : 'Boshqa bo\'limlar'}
          </h3>
          <nav className="space-y-2">
            {otherSections.map((section) => {
            const title = locale === 'ru' ? section.title_ru : section.title_uz;
            // Build image URL if section has imageId
            let sectionImageUrl = '';
            if (section.imageId) {
              // Note: In a full implementation, you'd fetch media by ID or include it in settings
              // For now, we'll just show icon
            }
            return (
              <Link
                key={section.id}
                href={section.link}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors group"
              >
                {section.icon && <span className="text-xl">{section.icon}</span>}
                <span className="text-sm font-medium text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                  {title}
                </span>
              </Link>
            );
            })}
          </nav>
        </div>
      )}

      {/* Brands Section */}
      {sortedBrands.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4" suppressHydrationWarning>
            {locale === 'ru' ? 'Бренды' : 'Brendlar'}
          </h3>
          <div className="space-y-4">
            {sortedBrands.map((brand) => {
              const brandName = brand.name || '';
              const brandSlug = brand.slug || '';
              const brandLogo = brand.logo?.url || '';
              let logoUrl = brandLogo;
              if (logoUrl && logoUrl.startsWith('/') && !logoUrl.startsWith('//')) {
                const baseUrl = API_BASE_URL.replace('/api', '');
                logoUrl = `${baseUrl}${logoUrl}`;
              }
              const brandLink = brandSlug ? `/catalog/${brandSlug}` : '#';
              return (
                <Link
                  key={brand.id}
                  href={brandLink}
                  className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-brand-primary/50 transition-colors bg-gray-50 group"
                >
                  {logoUrl ? (
                    <div className="relative h-10 w-full flex items-center justify-center">
                      <Image
                        src={logoUrl}
                        alt={brandName}
                        fill
                        sizes="120px"
                        className="object-contain"
                        suppressHydrationWarning
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                      {brandName}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

