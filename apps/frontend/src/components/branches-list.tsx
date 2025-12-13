'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { BranchResponse } from '@/lib/api';
import { getBilingualText } from '@/lib/locale';
import BranchPhoneLink from '@/components/branch-phone-link';

interface UserLocation {
  latitude: number;
  longitude: number;
}

// Haversine formula to calculate distance between two coordinates (in km)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
  // Filter branches by selected region - use useState + useEffect to prevent hydration mismatch
  const [filteredBranches, setFilteredBranches] = useState<BranchResponse[]>(branches);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  // Get user's location
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setIsLoadingLocation(false);
      return;
    }

    // Try to get cached location from localStorage
    const cachedLocation = localStorage.getItem('user_location');
    const cachedTimestamp = localStorage.getItem('user_location_timestamp');
    
    if (cachedLocation && cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();
      // Use cached location if it's less than 1 hour old
      if (now - timestamp < 60 * 60 * 1000) {
        try {
          const location = JSON.parse(cachedLocation);
          setUserLocation(location);
          setIsLoadingLocation(false);
        } catch (e) {
          // Invalid cache, continue to get fresh location
        }
      }
    }

    // Get fresh location
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        setIsLoadingLocation(false);
        
        // Cache location
        localStorage.setItem('user_location', JSON.stringify(location));
        localStorage.setItem('user_location_timestamp', Date.now().toString());
      },
      (error) => {
        console.warn('[BranchesList] Failed to get location:', error.message);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60 * 60 * 1000, // Cache for 1 hour
      }
    );
  }, []);
  
  useEffect(() => {
    console.log('🔍 [FILTER] Filtering branches:', {
      selectedRegion,
      totalBranches: branches.length,
      branchesByRegionKeys: branchesByRegion ? Object.keys(branchesByRegion) : [],
      branchesByRegionForSelected: selectedRegion && branchesByRegion ? branchesByRegion[selectedRegion] : null,
    });
    
    let branchesToFilter = branches;
    
    if (!selectedRegion) {
      console.log('🔍 [FILTER] No region selected, using all branches');
      // If no region selected, use all branches
    } else {
      // First, try to use branchesByRegion (coordinate-based, more accurate)
      if (branchesByRegion && branchesByRegion[selectedRegion]) {
        console.log('🔍 [FILTER] Using branchesByRegion:', branchesByRegion[selectedRegion].length, 'branches');
        branchesToFilter = branchesByRegion[selectedRegion];
      } else {
        // Fallback to city name matching
        console.log('🔍 [FILTER] Falling back to city name matching');
        const cityNames = REGION_TO_CITIES[selectedRegion] || [];
        branchesToFilter = branches.filter((branch) => {
          const branchNameUz = branch.name_uz.toLowerCase();
          const branchNameRu = branch.name_ru.toLowerCase();
          
          return cityNames.some(cityName => 
            branchNameUz.includes(cityName.toLowerCase()) || 
            branchNameRu.includes(cityName.toLowerCase())
          );
        });
        console.log('🔍 [FILTER] Filtered by city names:', branchesToFilter.length, 'branches');
      }
    }
    
    // Sort by distance if user location is available
    if (userLocation && !selectedRegion) {
      // Only sort by distance when no region filter is applied
      const branchesWithDistance = branchesToFilter
        .filter((branch) => branch.latitude != null && branch.longitude != null)
        .map((branch) => ({
          branch,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            branch.latitude!,
            branch.longitude!
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      // If some branches don't have coordinates, add them at the end
      const branchesWithoutCoords = branchesToFilter.filter(
        (branch) => branch.latitude == null || branch.longitude == null
      );

      setFilteredBranches([
        ...branchesWithDistance.map((item) => item.branch),
        ...branchesWithoutCoords,
      ]);
    } else {
      // If no location or region filter is applied, use original order
      setFilteredBranches(branchesToFilter);
    }
  }, [branches, selectedRegion, branchesByRegion, userLocation]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
        <div className="flex-1">
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
          {!selectedRegion && userLocation && !isLoadingLocation && (
            <p className="text-sm text-muted-foreground mt-1" suppressHydrationWarning>
              {locale === 'ru' 
                ? 'Отсортировано по расстоянию от вас'
                : 'Sizga eng yaqin filiallar bo\'yicha tartiblangan'}
            </p>
          )}
        </div>
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

            // Calculate distance if user location is available
            let distance: number | null = null;
            if (userLocation && branch.latitude != null && branch.longitude != null && !selectedRegion) {
              distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                branch.latitude,
                branch.longitude
              );
            }

            return (
              <Link
                key={branch.id}
                href={`/branches/${branch.slug || branch.id}`}
                className="group flex flex-col items-center justify-center rounded-lg border border-border bg-white p-3 md:p-4 shadow-sm transition hover:shadow-md md:flex-row md:items-start md:justify-start"
              >
                {/* Image - Mobile: Top, Desktop: Left - 16:9 aspect ratio */}
                {imageUrl ? (
                  <div className="relative w-full aspect-video md:w-48 md:aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-muted/20 mb-3 md:mb-0 md:mr-4">
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 192px"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video md:w-48 md:aspect-video flex-shrink-0 rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center mb-3 md:mb-0 md:mr-4">
                    <MapPin className="h-8 w-8 md:h-10 md:w-10 text-white opacity-80" />
                  </div>
                )}
                
                {/* Content - Mobile: Center, Desktop: Right */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm md:text-lg font-semibold text-foreground group-hover:text-brand-primary transition-colors flex-1" suppressHydrationWarning>
                      {name}
                    </h3>
                    {distance !== null && (
                      <div className="flex-shrink-0 text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-md">
                        {distance < 1 
                          ? `${Math.round(distance * 1000)} ${locale === 'ru' ? 'м' : 'm'}`
                          : `${distance.toFixed(1)} ${locale === 'ru' ? 'км' : 'km'}`}
                      </div>
                    )}
                  </div>
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

