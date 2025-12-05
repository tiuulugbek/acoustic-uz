'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { BranchResponse } from '@/lib/api';
import { getBilingualText } from '@/lib/locale';
import BranchPhoneLink from '@/components/branch-phone-link';

interface BranchesListProps {
  branches: BranchResponse[];
  selectedRegion: string | null;
  locale: 'uz' | 'ru';
  onClearFilter: () => void;
  branchesByRegion?: Record<string, BranchResponse[]>;
  regionNames?: Record<string, { uz: string; ru: string }>;
}

// Map region codes to city names for filtering
const REGION_TO_CITIES: Record<string, string[]> = {
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

export default function BranchesList({ branches, selectedRegion, locale, onClearFilter, branchesByRegion, regionNames }: BranchesListProps) {
  // Filter branches by selected region - use branchesByRegion if available (more accurate)
  const filteredBranches = useMemo(() => {
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
      
      return cityNames.some(cityName => 
        branchNameUz.includes(cityName.toLowerCase()) || 
        branchNameRu.includes(cityName.toLowerCase())
      );
    });
    console.log('🔍 [FILTER] Filtered by city names:', filtered.length, 'branches');
    return filtered;
  }, [branches, selectedRegion, branchesByRegion]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground" suppressHydrationWarning>
          {selectedRegion && regionNames?.[selectedRegion]
            ? (locale === 'ru' 
                ? (() => {
                    const regionName = regionNames[selectedRegion].ru;
                    // Handle different region name formats for proper Russian grammar
                    if (regionName.includes('область')) {
                      return `Филиалы в ${regionName.replace('область', 'области')}`;
                    } else if (regionName.includes('Город')) {
                      return `Филиалы в ${regionName.replace('Город', 'городе')}`;
                    } else {
                      // For city names, use "в [city]"
                      return `Филиалы в ${regionName}`;
                    }
                  })()
                : `${regionNames[selectedRegion].uz}dagi filiallar`)
            : (locale === 'ru' ? 'Все филиалы' : 'Barcha filiallar')}
        </h2>
        {selectedRegion && (
          <button
            onClick={onClearFilter}
            className="text-sm text-brand-primary hover:text-brand-accent transition-colors underline"
          >
            {locale === 'ru' ? 'Сбросить фильтр' : 'Filterni bekor qilish'}
          </button>
        )}
      </div>
      <div className="grid gap-3 grid-cols-2 md:gap-4 md:grid-cols-1">
        {filteredBranches.length > 0 ? (
          filteredBranches.map((branch) => {
            const name = getBilingualText(branch.name_uz, branch.name_ru, locale);
            const address = getBilingualText(branch.address_uz, branch.address_ru, locale);
            let imageUrl = branch.image?.url || '';
            if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
              const baseUrl = API_BASE_URL.replace('/api', '');
              imageUrl = `${baseUrl}${imageUrl}`;
            }

            return (
              <Link
                key={branch.id}
                href={`/branches/${branch.slug || branch.id}`}
                className="group flex flex-col items-center justify-center rounded-lg border border-border bg-white p-3 md:p-4 shadow-sm transition hover:shadow-md md:flex-row md:items-start md:justify-start"
              >
                {/* Image - Mobile: Top, Desktop: Left */}
                {imageUrl ? (
                  <div className="relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted/20 mb-2 md:mb-0 md:mr-4">
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 64px, 96px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 md:w-24 md:h-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center mb-2 md:mb-0 md:mr-4">
                    <MapPin className="h-6 w-6 md:h-8 md:w-8 text-white opacity-80" />
                  </div>
                )}
                
                {/* Content - Mobile: Center, Desktop: Right */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <h3 className="text-sm md:text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors" suppressHydrationWarning>
                    {name}
                  </h3>
                  {/* Address and phone - hidden on mobile, shown on desktop */}
                  <div className="hidden md:block space-y-2 mt-2">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-primary" />
                      <span className="leading-relaxed" suppressHydrationWarning>{address}</span>
                    </div>
                    <BranchPhoneLink phone={branch.phone} phones={branch.phones} />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-2 md:col-span-1 text-center py-12 text-muted-foreground" suppressHydrationWarning>
            {locale === 'ru' 
              ? 'В выбранном регионе филиалы не найдены.'
              : 'Tanlangan viloyatda filiallar topilmadi.'}
          </div>
        )}
      </div>
    </div>
  );
}

