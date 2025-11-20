'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ZoomOut } from 'lucide-react';
import type { BranchResponse } from '@/lib/api';
import Script from 'next/script';

interface BranchesMapSidebarProps {
  branches: BranchResponse[];
  locale: 'uz' | 'ru';
  onRegionSelect?: (regionCode: string | null) => void;
  selectedRegion?: string | null;
  onBranchesByRegionChange?: (branchesByRegion: Record<string, BranchResponse[]>) => void;
  onRegionNamesChange?: (regionNames: Record<string, { uz: string; ru: string }>) => void;
}

// Uzbekistan bounds for coordinate conversion
const UZ_MIN_LAT = 37.144;
const UZ_MAX_LAT = 45.590;
const UZ_MIN_LNG = 56.000;
const UZ_MAX_LNG = 73.148;

// SVG viewBox dimensions - matching simplemaps
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 652;

// Convert GPS coordinates to SVG coordinates
function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const normalizedLng = (lng - UZ_MIN_LNG) / (UZ_MAX_LNG - UZ_MIN_LNG);
  const normalizedLat = (UZ_MAX_LAT - lat) / (UZ_MAX_LAT - UZ_MIN_LAT);
  
  const x = normalizedLng * SVG_WIDTH;
  const y = normalizedLat * SVG_HEIGHT;
  
  return { x, y };
}

// Region codes from simplemaps
const REGIONS_TO_SHOW = [
  'UZNG', // Namangan
  'UZAN', // Andijon
  'UZJI', // Jizzakh
  'UZSU', // Surkhandarya
  'UZQR', // Karakalpakstan
  'UZXO', // Khorezm
  'UZNW', // Navoi
  'UZSA', // Samarkand
  'UZTK', // Tashkent
  'UZBU', // Bukhoro
  'UZSI', // Sirdaryo
  'UZTO', // Tashkent (city)
  'UZFA', // Ferghana
  'UZQA', // Kashkadarya
] as const;

// Map region codes to city names (for matching branches)
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

// Region names in Uzbek and Russian
const REGION_NAMES: Record<string, { uz: string; ru: string }> = {
  'UZTK': { uz: 'Toshkent viloyati', ru: 'Ташкентская область' },
  'UZTO': { uz: 'Toshkent shahri', ru: 'Город Ташкент' },
  'UZSI': { uz: 'Sirdaryo', ru: 'Сырдарья' },
  'UZSA': { uz: 'Samarqand', ru: 'Самарканд' },
  'UZNW': { uz: 'Navoiy', ru: 'Навои' },
  'UZBU': { uz: 'Buxoro', ru: 'Бухара' },
  'UZQA': { uz: 'Qashqadaryo', ru: 'Кашкадарья' },
  'UZSU': { uz: 'Surxondaryo', ru: 'Сурхандарья' },
  'UZXO': { uz: 'Xorazm', ru: 'Хорезм' },
  'UZQR': { uz: 'Qoraqalpog\'iston', ru: 'Каракалпакстан' },
  'UZAN': { uz: 'Andijon', ru: 'Андижан' },
  'UZFA': { uz: 'Farg\'ona', ru: 'Фергана' },
  'UZNG': { uz: 'Namangan', ru: 'Наманган' },
  'UZJI': { uz: 'Jizzax', ru: 'Джизак' },
};

// Type declaration for simplemaps global
declare global {
  interface Window {
    simplemaps_countrymap_mapinfo?: {
      paths: Record<string, string>;
      state_bbox_array?: Record<string, {
        x: number | string;
        y: number | string;
        x2: number | string;
        y2: number | string;
        cx?: string;
        cy?: string;
      }>;
    };
  }
}

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function BranchesMapSidebar({ branches, locale, onRegionSelect, selectedRegion, onBranchesByRegionChange, onRegionNamesChange }: BranchesMapSidebarProps) {
  const [mapPaths, setMapPaths] = useState<Record<string, string>>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState<ViewBox>({ x: 0, y: 0, width: SVG_WIDTH, height: SVG_HEIGHT });
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomedRegion, setZoomedRegion] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter branches with coordinates and convert to SVG positions
  const branchesWithCoords = useMemo(() => {
    return branches
      .filter((branch) => branch.latitude != null && branch.longitude != null)
      .map((branch) => {
        const svgPos = latLngToSvg(branch.latitude!, branch.longitude!);
        const x = Math.max(0, Math.min(SVG_WIDTH, svgPos.x));
        const y = Math.max(0, Math.min(SVG_HEIGHT, svgPos.y));
        
        return {
          ...branch,
          svgX: x,
          svgY: y,
        };
      });
  }, [branches]);

  // Map branches to regions
  const branchesByRegion = useMemo(() => {
    const mapping: Record<string, typeof branchesWithCoords> = {};
    const branchToRegionMap = new Map<string, string>();
    
    const mapInfo = typeof window !== 'undefined' ? window.simplemaps_countrymap_mapinfo : null;
    
    for (const branch of branchesWithCoords) {
      if (branchToRegionMap.has(branch.id)) continue;
      
      let matched = false;
      let matchedRegion: string | null = null;
      
      const branchNameUz = branch.name_uz.toLowerCase();
      const branchNameRu = branch.name_ru.toLowerCase();
      
      // FIRST: Try to match by city names in branch name
      for (const [regionCode, cityNames] of Object.entries(REGION_TO_CITIES)) {
        for (const cityName of cityNames) {
          if (branchNameUz.includes(cityName.toLowerCase()) || branchNameRu.includes(cityName.toLowerCase())) {
            matchedRegion = regionCode;
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
      
      // SECOND: If not matched by name, try matching by coordinates
      if (!matched && mapInfo?.state_bbox_array) {
        const matchingRegions: Array<{ regionCode: string; centerX: number; centerY: number; distance: number }> = [];
        
        for (const [regionCode, bbox] of Object.entries(mapInfo.state_bbox_array)) {
          if (!REGIONS_TO_SHOW.includes(regionCode as any)) continue;
          
          const x = typeof bbox.x === 'string' ? parseFloat(bbox.x) : bbox.x;
          const y = typeof bbox.y === 'string' ? parseFloat(bbox.y) : bbox.y;
          const x2 = typeof bbox.x2 === 'string' ? parseFloat(bbox.x2) : bbox.x2;
          const y2 = typeof bbox.y2 === 'string' ? parseFloat(bbox.y2) : bbox.y2;
          
          if (branch.svgX >= x && branch.svgX <= x2 && branch.svgY >= y && branch.svgY <= y2) {
            const centerX = (x + x2) / 2;
            const centerY = (y + y2) / 2;
            const distance = Math.sqrt(
              Math.pow(branch.svgX - centerX, 2) + Math.pow(branch.svgY - centerY, 2)
            );
            matchingRegions.push({ regionCode, centerX, centerY, distance });
          }
        }
        
        if (matchingRegions.length > 0) {
          matchingRegions.sort((a, b) => a.distance - b.distance);
          matchedRegion = matchingRegions[0].regionCode;
          matched = true;
        }
      }
      
      if (matched && matchedRegion) {
        if (!mapping[matchedRegion]) {
          mapping[matchedRegion] = [];
        }
        mapping[matchedRegion].push(branch);
        branchToRegionMap.set(branch.id, matchedRegion);
      }
    }
    
    // Convert to BranchResponse format
    const branchesByRegionResponse: Record<string, BranchResponse[]> = {};
    for (const [regionCode, branchCoords] of Object.entries(mapping)) {
      branchesByRegionResponse[regionCode] = branchCoords.map(bc => {
        const originalBranch = branches.find(b => b.id === bc.id);
        return originalBranch!;
      }).filter(Boolean);
    }
    
    if (onBranchesByRegionChange) {
      onBranchesByRegionChange(branchesByRegionResponse);
    }
    
    if (onRegionNamesChange) {
      onRegionNamesChange(REGION_NAMES);
    }
    
    return mapping;
  }, [branchesWithCoords, mapLoaded, branches, onBranchesByRegionChange, onRegionNamesChange]);

  const handleRegionClick = (regionCode: string) => {
    onRegionSelect?.(regionCode);
    
    if (typeof window === 'undefined' || !window.simplemaps_countrymap_mapinfo) {
      return;
    }
    
    const mapInfo = window.simplemaps_countrymap_mapinfo;
    const bbox = mapInfo.state_bbox_array?.[regionCode];
    
    if (bbox) {
      const padding = 20;
      const x = typeof bbox.x === 'string' ? parseFloat(bbox.x) : bbox.x;
      const y = typeof bbox.y === 'string' ? parseFloat(bbox.y) : bbox.y;
      const x2 = typeof bbox.x2 === 'string' ? parseFloat(bbox.x2) : bbox.x2;
      const y2 = typeof bbox.y2 === 'string' ? parseFloat(bbox.y2) : bbox.y2;
      
      const newViewBox: ViewBox = {
        x: Math.max(0, x - padding),
        y: Math.max(0, y - padding),
        width: Math.min(SVG_WIDTH, (x2 - x) + (padding * 2)),
        height: Math.min(SVG_HEIGHT, (y2 - y) + (padding * 2)),
      };
      
      setViewBox(newViewBox);
      setIsZoomed(true);
      setZoomedRegion(regionCode);
    }
  };

  const handleZoomOut = () => {
    setViewBox({ x: 0, y: 0, width: SVG_WIDTH, height: SVG_HEIGHT });
    setIsZoomed(false);
    setZoomedRegion(null);
    onRegionSelect?.(null);
  };

  // Load map data
  useEffect(() => {
    const checkMapData = () => {
      if (typeof window !== 'undefined' && window.simplemaps_countrymap_mapinfo) {
        const mapInfo = window.simplemaps_countrymap_mapinfo;
        if (mapInfo.paths) {
          setMapPaths(mapInfo.paths);
          setMapLoaded(true);
        }
      }
    };

    checkMapData();
    const interval = setInterval(checkMapData, 100);
    return () => clearInterval(interval);
  }, []);

  // Update viewBox attribute for smooth transitions
  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    }
  }, [viewBox]);

  return (
    <>
      <Script
        src="/maps/countrymap.js"
        strategy="afterInteractive"
        onLoad={() => {
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.simplemaps_countrymap_mapinfo) {
              const mapInfo = window.simplemaps_countrymap_mapinfo;
              if (mapInfo.paths) {
                setMapPaths(mapInfo.paths);
                setMapLoaded(true);
              }
            }
          }, 100);
        }}
      />
      
      <div className="relative w-full">
        {mapLoaded ? (
          <>
            {isZoomed && (
              <button
                onClick={handleZoomOut}
                className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded bg-white px-2 py-1 text-xs shadow-md hover:bg-gray-50 transition-colors"
                title={locale === 'ru' ? 'Вернуться к полной карте' : 'To\'liq xaritaga qaytish'}
              >
                <ZoomOut className="h-3 w-3" />
                <span className="text-xs">
                  {locale === 'ru' ? 'Вся карта' : 'To\'liq xarita'}
                </span>
              </button>
            )}
            
            <svg
              ref={svgRef}
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
              className="w-full h-full transition-all duration-500 ease-in-out"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
              style={{ minHeight: '300px' }}
            >
              {/* Uzbekistan regions */}
              {REGIONS_TO_SHOW.map((region) => {
                const path = mapPaths[region];
                if (!path) return null;
                
                const isHovered = hoveredRegion === region;
                const isSelected = selectedRegion === region;
                const hasBranches = (branchesByRegion[region]?.length || 0) > 0;
                
                const mapInfo = typeof window !== 'undefined' ? window.simplemaps_countrymap_mapinfo : null;
                const bbox = mapInfo?.state_bbox_array?.[region];
                let labelX = 0;
                let labelY = 0;
                
                if (bbox) {
                  const x = typeof bbox.x === 'string' ? parseFloat(bbox.x) : bbox.x;
                  const y = typeof bbox.y === 'string' ? parseFloat(bbox.y) : bbox.y;
                  const x2 = typeof bbox.x2 === 'string' ? parseFloat(bbox.x2) : bbox.x2;
                  const y2 = typeof bbox.y2 === 'string' ? parseFloat(bbox.y2) : bbox.y2;
                  
                  if (bbox.cx && bbox.cy) {
                    labelX = typeof bbox.cx === 'string' ? parseFloat(bbox.cx) : bbox.cx;
                    labelY = typeof bbox.cy === 'string' ? parseFloat(bbox.cy) : bbox.cy;
                  } else {
                    labelX = (x + x2) / 2;
                    labelY = (y + y2) / 2;
                  }
                }
                
                const regionName = REGION_NAMES[region]?.[locale] || region;
                
                return (
                  <g key={region}>
                    <path
                      d={path}
                      fill={isSelected ? "#1890ff" : isHovered ? "#40a9ff" : hasBranches ? "#91d5ff" : "#e6f7ff"}
                      stroke={isSelected ? "#0958d9" : isHovered ? "#1890ff" : "#1890ff"}
                      strokeWidth={isSelected ? "2.5" : isHovered ? "2" : "1"}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        pointerEvents: 'all'
                      }}
                      onMouseEnter={() => setHoveredRegion(region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegionClick(region);
                      }}
                    />
                    {/* Region name label - only show when not zoomed */}
                    {!isZoomed && (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isHovered ? "#0958d9" : "#1890ff"}
                        fontSize="10"
                        fontWeight={isHovered ? "700" : "600"}
                        style={{ 
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                        className="drop-shadow-sm"
                      >
                        {regionName}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full min-h-[300px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-xs text-muted-foreground">
                {locale === 'ru' ? 'Загрузка карты...' : 'Xarita yuklanmoqda...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

