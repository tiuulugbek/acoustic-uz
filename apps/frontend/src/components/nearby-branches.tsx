'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone } from 'lucide-react';
import type { BranchResponse } from '@/lib/api';
import { getBilingualText } from '@/lib/locale';
import { normalizeImageUrl } from '@/lib/image-utils';

interface NearbyBranchesProps {
  branches: BranchResponse[];
  locale: 'uz' | 'ru';
  limit?: number;
}

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

export default function NearbyBranches({ branches, locale, limit = 3 }: NearbyBranchesProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Get user's location
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('[NearbyBranches] Geolocation is not supported by your browser');
      setLocationError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
      return;
    }

    // Check if HTTPS (required for geolocation, except localhost)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isSecure) {
      console.warn('[NearbyBranches] Geolocation requires HTTPS (except localhost)');
      setLocationError('Geolocation requires HTTPS connection');
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
          console.log('[NearbyBranches] Using cached location:', location);
          setUserLocation(location);
          setIsLoadingLocation(false);
          return;
        } catch (e) {
          console.warn('[NearbyBranches] Invalid cached location, getting fresh location');
          // Invalid cache, continue to get fresh location
        }
      } else {
        console.log('[NearbyBranches] Cached location expired, getting fresh location');
      }
    }

    // Get fresh location
    console.log('[NearbyBranches] Requesting geolocation...');
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log('[NearbyBranches] Location obtained:', location);
        setUserLocation(location);
        setLocationError(null);
        setIsLoadingLocation(false);
        
        // Cache location
        localStorage.setItem('user_location', JSON.stringify(location));
        localStorage.setItem('user_location_timestamp', Date.now().toString());
      },
      (error) => {
        console.error('[NearbyBranches] Failed to get location:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.code === 1,
          POSITION_UNAVAILABLE: error.code === 2,
          TIMEOUT: error.code === 3,
        });
        setLocationError(error.message);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60 * 60 * 1000, // Cache for 1 hour
      }
    );
  }, []);

  // Sort branches by distance if user location is available
  const sortedBranches = useMemo(() => {
    if (!userLocation) {
      // If no location, return branches in original order (or randomize)
      // Randomize to show different branches to different users
      return [...branches].sort(() => Math.random() - 0.5);
    }

    // Calculate distance for each branch and sort
    const branchesWithDistance = branches
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
    const branchesWithoutCoords = branches.filter(
      (branch) => branch.latitude == null || branch.longitude == null
    );

    return [
      ...branchesWithDistance.map((item) => item.branch),
      ...branchesWithoutCoords,
    ];
  }, [branches, userLocation]);

  // Get branches to display
  const displayBranches = sortedBranches.slice(0, limit);

  return (
    <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {locale === 'ru' ? 'Наши филиалы' : 'Bizning filiallarimiz'}
      </h3>
      
      {isLoadingLocation && (
        <div className="mb-4 text-xs text-muted-foreground">
          {locale === 'ru' ? 'Определение местоположения...' : 'Joylashuv aniqlanmoqda...'}
        </div>
      )}
      
      {locationError && !isLoadingLocation && (
        <div className="mb-4 space-y-1">
          <div className="text-xs text-muted-foreground">
            {locale === 'ru' 
              ? 'Не удалось определить местоположение. Показаны случайные филиалы.'
              : 'Joylashuv aniqlanmadi. Tasodifiy filiallar ko\'rsatilmoqda.'}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-red-500">
              Debug: {locationError}
            </div>
          )}
        </div>
      )}
      
      {userLocation && !isLoadingLocation && (
        <div className="mb-4 text-xs text-muted-foreground">
          {locale === 'ru' 
            ? 'Ближайшие к вам филиалы'
            : 'Sizga eng yaqin filiallar'}
          {process.env.NODE_ENV === 'development' && (
            <span className="ml-2 text-gray-400">
              ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
            </span>
          )}
        </div>
      )}

      <div className="space-y-4">
        {displayBranches.map((branch) => {
          const branchName = getBilingualText(branch.name_uz, branch.name_ru, locale);
          const branchAddress = getBilingualText(branch.address_uz, branch.address_ru, locale);
          const imageUrl = branch.image?.url ? normalizeImageUrl(branch.image.url) : null;
          
          // Calculate distance if user location is available
          let distance: number | null = null;
          if (userLocation && branch.latitude != null && branch.longitude != null) {
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
              href={`/branches/${branch.slug}`}
              className="group block rounded-lg border border-border bg-white p-3 transition-shadow hover:shadow-md"
            >
              {imageUrl && (
                <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={imageUrl}
                    alt={branchName}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="mb-1 text-sm font-semibold text-foreground group-hover:text-brand-primary transition-colors">
                    {branchName}
                  </h4>
                  {branchAddress && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-brand-primary" />
                      <span className="line-clamp-2">{branchAddress}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-brand-primary">
                      <Phone className="h-3 w-3" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </div>
                {distance !== null && (
                  <div className="flex-shrink-0 text-xs font-medium text-brand-primary">
                    {distance < 1 
                      ? `${Math.round(distance * 1000)} ${locale === 'ru' ? 'м' : 'm'}`
                      : `${distance.toFixed(1)} ${locale === 'ru' ? 'км' : 'km'}`}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      {branches.length > limit && (
        <Link
          href="/branches"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline"
        >
          {locale === 'ru' ? 'Все филиалы →' : 'Barcha filiallar →'}
        </Link>
      )}
    </div>
  );
}

