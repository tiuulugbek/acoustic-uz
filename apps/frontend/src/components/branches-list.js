"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BranchesList;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const lucide_react_1 = require("lucide-react");
const locale_1 = require("@/lib/locale");
const branch_phone_link_1 = __importDefault(require("@/components/branch-phone-link"));
// Map region codes to city names for filtering
const REGION_TO_CITIES = {
    'UZTK': ['chilonzor', 'yunusobod', 'yakkasaroy', 'toshmi', 'sergeli', 'qoyliq', 'qo\'yliq', 'qo‘yliq', 'sebzor', 'toshkent'],
    'UZTO': ['chilonzor', 'yunusobod', 'yakkasaroy', 'toshmi', 'sergeli', 'qoyliq', 'qo\'yliq', 'qo‘yliq', 'sebzor', 'toshkent'],
    'UZSI': ['guliston', 'sirdaryo'],
    'UZSA': ['samarqand'],
    'UZNW': ['navoiy'],
    'UZBU': ['buxoro'],
    'UZQA': ['qarshi', 'shahrisabz'],
    'UZSU': ['termiz', 'surxondaryo', 'surxondaryo'],
    'UZXO': ['urganch', 'xorazm'],
    'UZQR': ['nukus', 'qoraqalpog\'iston', 'qoraqalpog‘iston'],
    'UZAN': ['andijon'],
    'UZFA': ['farg\'ona', 'fargona', 'farg‘ona', 'qo\'qon', 'qoqon', 'qo‘qon'],
    'UZNG': ['namangan'],
    'UZJI': ['jizzax'],
};
function BranchesList({ branches, selectedRegion, locale, onClearFilter, branchesByRegion, regionNames }) {
    // Filter branches by selected region - use branchesByRegion if available (more accurate)
    const filteredBranches = (0, react_1.useMemo)(() => {
        console.log('🔍 [FILTER] Filtering branches:', {
            selectedRegion,
            totalBranches: branches.length,
            branchesByRegionKeys: branchesByRegion ? Object.keys(branchesByRegion) : [],
            branchesByRegionForSelected: selectedRegion && branchesByRegion ? branchesByRegion[selectedRegion] : null,
        });
        if (!selectedRegion) {
            console.log('🔍 [FILTER] No region selected, returning all branches');
            return branches;
        }
        // First, try to use branchesByRegion (coordinate-based, more accurate)
        if (branchesByRegion && branchesByRegion[selectedRegion]) {
            console.log('🔍 [FILTER] Using branchesByRegion:', branchesByRegion[selectedRegion].length, 'branches');
            return branchesByRegion[selectedRegion];
        }
        // Fallback to city name matching
        console.log('🔍 [FILTER] Falling back to city name matching');
        const cityNames = REGION_TO_CITIES[selectedRegion] || [];
        const filtered = branches.filter((branch) => {
            const branchNameUz = branch.name_uz.toLowerCase();
            const branchNameRu = branch.name_ru.toLowerCase();
            return cityNames.some(cityName => branchNameUz.includes(cityName.toLowerCase()) ||
                branchNameRu.includes(cityName.toLowerCase()));
        });
        console.log('🔍 [FILTER] Filtered by city names:', filtered.length, 'branches');
        return filtered;
    }, [branches, selectedRegion, branchesByRegion]);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return (<div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground" suppressHydrationWarning>
          {selectedRegion && regionNames?.[selectedRegion]
            ? (locale === 'ru'
                ? (() => {
                    const regionName = regionNames[selectedRegion].ru;
                    // Handle different region name formats for proper Russian grammar
                    if (regionName.includes('область')) {
                        return `Филиалы в ${regionName.replace('область', 'области')}`;
                    }
                    else if (regionName.includes('Город')) {
                        return `Филиалы в ${regionName.replace('Город', 'городе')}`;
                    }
                    else {
                        // For city names, use "в [city]"
                        return `Филиалы в ${regionName}`;
                    }
                })()
                : `${regionNames[selectedRegion].uz}dagi filiallar`)
            : (locale === 'ru' ? 'Все филиалы' : 'Barcha filiallar')}
        </h2>
        {selectedRegion && (<button onClick={onClearFilter} className="text-sm text-brand-primary hover:text-brand-accent transition-colors underline">
            {locale === 'ru' ? 'Сбросить фильтр' : 'Filterni bekor qilish'}
          </button>)}
      </div>
      <div className="grid gap-3 grid-cols-2 md:gap-4 md:grid-cols-1">
        {filteredBranches.length > 0 ? (filteredBranches.map((branch) => {
            const name = (0, locale_1.getBilingualText)(branch.name_uz, branch.name_ru, locale);
            const address = (0, locale_1.getBilingualText)(branch.address_uz, branch.address_ru, locale);
            let imageUrl = branch.image?.url || '';
            if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
                const baseUrl = API_BASE_URL.replace('/api', '');
                imageUrl = `${baseUrl}${imageUrl}`;
            }
            return (<link_1.default key={branch.id} href={`/branches/${branch.slug || branch.id}`} className="group flex flex-col items-center justify-center rounded-lg border border-border bg-white p-3 md:p-4 shadow-sm transition hover:shadow-md md:flex-row md:items-start md:justify-start">
                {/* Image - Mobile: Top, Desktop: Left - 16:9 aspect ratio */}
                {imageUrl ? (<div className="relative w-full aspect-video md:w-48 md:aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-muted/20 mb-3 md:mb-0 md:mr-4">
                    <image_1.default src={imageUrl} alt={name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 192px"/>
                  </div>) : (<div className="w-full aspect-video md:w-48 md:aspect-video flex-shrink-0 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center mb-3 md:mb-0 md:mr-4">
                    <lucide_react_1.MapPin className="h-8 w-8 md:h-10 md:w-10 text-white opacity-80"/>
                  </div>)}
                
                {/* Content - Mobile: Center, Desktop: Right */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h3 className="text-sm md:text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                    {name}
                  </h3>
                  {/* Address and phone - hidden on mobile, shown on desktop */}
                  <div className="hidden md:block space-y-2 mt-2">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <lucide_react_1.MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-primary"/>
                      <span className="leading-relaxed" suppressHydrationWarning>{address}</span>
                    </div>
                    <branch_phone_link_1.default phone={branch.phone} phones={branch.phones}/>
                  </div>
                </div>
              </link_1.default>);
        })) : (<div className="col-span-2 md:col-span-1 text-center py-12 text-muted-foreground" suppressHydrationWarning>
            {locale === 'ru'
                ? 'В выбранном регионе филиалы не найдены.'
                : 'Tanlangan viloyatda filiallar topilmadi.'}
          </div>)}
      </div>
    </div>);
}
//# sourceMappingURL=branches-list.js.map