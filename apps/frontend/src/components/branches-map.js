"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BranchesMap;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const locale_1 = require("@/lib/locale");
const script_1 = __importDefault(require("next/script"));
// Uzbekistan bounds for coordinate conversion
// Based on simplemaps data: viewBox 0 0 1000 652
// Actual Uzbekistan bounds (more accurate):
// Latitude: 37.144 (south) to 45.590 (north)
// Longitude: 56.000 (west) to 73.148 (east)
const UZ_MIN_LAT = 37.144;
const UZ_MAX_LAT = 45.590;
const UZ_MIN_LNG = 56.000;
const UZ_MAX_LNG = 73.148;
// SVG viewBox dimensions - matching simplemaps
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 652;
// Convert GPS coordinates to SVG coordinates
// Simplemaps uses a specific projection, so we need to match it exactly
function latLngToSvg(lat, lng) {
    // Normalize longitude (0 to 1)
    const normalizedLng = (lng - UZ_MIN_LNG) / (UZ_MAX_LNG - UZ_MIN_LNG);
    // Normalize latitude (0 to 1, inverted because SVG y increases downward)
    const normalizedLat = (UZ_MAX_LAT - lat) / (UZ_MAX_LAT - UZ_MIN_LAT);
    // Convert to SVG coordinates
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
];
// Map region codes to city names (for matching branches)
// These are keywords that appear in branch names
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
// Region names in Uzbek and Russian
const REGION_NAMES = {
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
function BranchesMap({ branches, locale, onRegionSelect, selectedRegion, onBranchesByRegionChange, onRegionNamesChange }) {
    const [selectedBranchId, setSelectedBranchId] = (0, react_1.useState)(null);
    const [mapPaths, setMapPaths] = (0, react_1.useState)({});
    const [mapLoaded, setMapLoaded] = (0, react_1.useState)(false);
    const [hoveredRegion, setHoveredRegion] = (0, react_1.useState)(null);
    const [viewBox, setViewBox] = (0, react_1.useState)({ x: 0, y: 0, width: SVG_WIDTH, height: SVG_HEIGHT });
    const [isZoomed, setIsZoomed] = (0, react_1.useState)(false);
    const [zoomedRegion, setZoomedRegion] = (0, react_1.useState)(null);
    const [hoveredBranchId, setHoveredBranchId] = (0, react_1.useState)(null);
    const svgRef = (0, react_1.useRef)(null);
    // Filter branches with coordinates and convert to SVG positions
    const branchesWithCoords = (0, react_1.useMemo)(() => {
        console.log('🗺️ [MAP] Total branches received:', branches.length);
        console.log('🗺️ [MAP] Sample branch:', branches[0] ? {
            id: branches[0].id,
            name: branches[0].name_uz,
            hasLatitude: 'latitude' in branches[0],
            latitude: branches[0].latitude,
            hasLongitude: 'longitude' in branches[0],
            longitude: branches[0].longitude,
            allKeys: Object.keys(branches[0]),
        } : 'No branches');
        const filtered = branches
            .filter((branch) => {
            const hasCoords = branch.latitude != null && branch.longitude != null;
            if (!hasCoords) {
                console.log('🗺️ [MAP] Branch missing coords:', branch.name_uz, {
                    latitude: branch.latitude,
                    longitude: branch.longitude,
                });
            }
            return hasCoords;
        })
            .map((branch) => {
            const svgPos = latLngToSvg(branch.latitude, branch.longitude);
            // Ensure coordinates are within SVG bounds
            const x = Math.max(0, Math.min(SVG_WIDTH, svgPos.x));
            const y = Math.max(0, Math.min(SVG_HEIGHT, svgPos.y));
            // Debug log for coordinate conversion
            console.log('🗺️ [MAP] Branch coordinate conversion:', {
                name: branch.name_uz,
                lat: branch.latitude,
                lng: branch.longitude,
                svgX: x,
                svgY: y,
                rawX: svgPos.x,
                rawY: svgPos.y,
            });
            return {
                ...branch,
                svgX: x,
                svgY: y,
            };
        });
        console.log('🗺️ [MAP] Branches with coords:', filtered.length, 'out of', branches.length);
        if (filtered.length > 0) {
            console.log('🗺️ [MAP] First branch with coords:', {
                name: filtered[0].name_uz,
                lat: filtered[0].latitude,
                lng: filtered[0].longitude,
                svgX: filtered[0].svgX,
                svgY: filtered[0].svgY,
            });
        }
        return filtered;
    }, [branches]);
    // Map branches to regions based on coordinates (bbox) and city names
    // IMPORTANT: Each branch should be mapped to ONLY ONE region
    const branchesByRegion = (0, react_1.useMemo)(() => {
        const mapping = {};
        const branchToRegionMap = new Map(); // Track which branch belongs to which region
        // Get map info for bbox calculations
        const mapInfo = typeof window !== 'undefined' ? window.simplemaps_countrymap_mapinfo : null;
        for (const branch of branchesWithCoords) {
            // Skip if branch is already mapped to a region
            if (branchToRegionMap.has(branch.id)) {
                console.log('🗺️ [MAP] Branch already mapped:', branch.name_uz, 'to region:', branchToRegionMap.get(branch.id));
                continue;
            }
            let matched = false;
            let matchedRegion = null;
            const branchNameUz = branch.name_uz.toLowerCase();
            const branchNameRu = branch.name_ru.toLowerCase();
            // FIRST: Try to match by city names in branch name - most reliable
            // This should be checked first because branch names explicitly mention the city
            for (const [regionCode, cityNames] of Object.entries(REGION_TO_CITIES)) {
                for (const cityName of cityNames) {
                    // Check if city name appears in branch name
                    if (branchNameUz.includes(cityName.toLowerCase()) || branchNameRu.includes(cityName.toLowerCase())) {
                        matchedRegion = regionCode;
                        matched = true;
                        console.log('🗺️ [MAP] Matched by name:', branch.name_uz, '->', cityName, '->', regionCode);
                        break;
                    }
                }
                if (matched)
                    break;
            }
            // SECOND: If not matched by name, try matching by coordinates (bbox) - less reliable
            // Only use coordinates if name matching failed
            if (!matched && mapInfo?.state_bbox_array) {
                // Collect all regions that contain this branch's coordinates
                const matchingRegions = [];
                for (const [regionCode, bbox] of Object.entries(mapInfo.state_bbox_array)) {
                    if (!REGIONS_TO_SHOW.includes(regionCode))
                        continue;
                    const x = typeof bbox.x === 'string' ? parseFloat(bbox.x) : bbox.x;
                    const y = typeof bbox.y === 'string' ? parseFloat(bbox.y) : bbox.y;
                    const x2 = typeof bbox.x2 === 'string' ? parseFloat(bbox.x2) : bbox.x2;
                    const y2 = typeof bbox.y2 === 'string' ? parseFloat(bbox.y2) : bbox.y2;
                    // Check if branch coordinates are within region bbox
                    if (branch.svgX >= x && branch.svgX <= x2 && branch.svgY >= y && branch.svgY <= y2) {
                        // Calculate distance from branch to region center
                        const centerX = (x + x2) / 2;
                        const centerY = (y + y2) / 2;
                        const distance = Math.sqrt(Math.pow(branch.svgX - centerX, 2) + Math.pow(branch.svgY - centerY, 2));
                        matchingRegions.push({ regionCode, centerX, centerY, distance });
                    }
                }
                // If multiple regions match, choose the closest one
                if (matchingRegions.length > 0) {
                    matchingRegions.sort((a, b) => a.distance - b.distance);
                    matchedRegion = matchingRegions[0].regionCode;
                    matched = true;
                    console.log('🗺️ [MAP] Matched by coordinates:', branch.name_uz, '->', matchedRegion, '(distance:', matchingRegions[0].distance.toFixed(2), ')');
                }
            }
            // Add branch to mapping only if matched and not already in another region
            if (matched && matchedRegion) {
                if (!mapping[matchedRegion]) {
                    mapping[matchedRegion] = [];
                }
                mapping[matchedRegion].push(branch);
                branchToRegionMap.set(branch.id, matchedRegion);
                console.log('🗺️ [MAP] Mapped branch:', branch.name_uz, 'to region:', matchedRegion);
            }
            else {
                console.warn('🗺️ [MAP] ⚠️ Branch not mapped to any region:', branch.name_uz);
            }
        }
        console.log('🗺️ [MAP] Branches by region:', Object.keys(mapping).map(region => ({
            region,
            count: mapping[region].length
        })));
        // Convert to BranchResponse format for parent component
        const branchesByRegionResponse = {};
        for (const [regionCode, branchCoords] of Object.entries(mapping)) {
            branchesByRegionResponse[regionCode] = branchCoords.map(bc => {
                const originalBranch = branches.find(b => b.id === bc.id);
                return originalBranch;
            }).filter(Boolean);
        }
        // Notify parent component about branches by region
        if (onBranchesByRegionChange) {
            onBranchesByRegionChange(branchesByRegionResponse);
        }
        // Notify parent component about region names
        if (onRegionNamesChange) {
            onRegionNamesChange(REGION_NAMES);
        }
        return mapping;
    }, [branchesWithCoords, mapLoaded, branches, onBranchesByRegionChange, onRegionNamesChange]);
    // Helper function to group branches by proximity
    const groupBranchesByProximity = (branches, threshold) => {
        const groups = [];
        for (const branch of branches) {
            let added = false;
            for (const group of groups) {
                const distance = Math.sqrt(Math.pow(branch.svgX - group.x, 2) + Math.pow(branch.svgY - group.y, 2));
                if (distance < threshold) {
                    group.branches.push(branch);
                    added = true;
                    break;
                }
            }
            if (!added) {
                groups.push({
                    x: branch.svgX,
                    y: branch.svgY,
                    branches: [branch],
                });
            }
        }
        return groups;
    };
    const router = (0, navigation_1.useRouter)();
    const handleMarkerClick = (group) => {
        // If multiple branches at same location, show modal
        if (group.branches.length > 1) {
            setSelectedBranchId(group.branches[0].id);
        }
        else {
            // Single branch - navigate directly to branch page
            const branch = group.branches[0];
            const slug = branch.slug || branch.id;
            router.push(`/branches/${slug}`);
        }
    };
    const closeModal = () => {
        setSelectedBranchId(null);
    };
    const handleRegionClick = (regionCode) => {
        // Notify parent component about region selection
        onRegionSelect?.(regionCode);
        if (typeof window === 'undefined' || !window.simplemaps_countrymap_mapinfo) {
            return;
        }
        const mapInfo = window.simplemaps_countrymap_mapinfo;
        const bbox = mapInfo.state_bbox_array?.[regionCode];
        if (bbox) {
            const padding = 30; // Add padding around the region
            // Parse string values to numbers
            const x = typeof bbox.x === 'string' ? parseFloat(bbox.x) : bbox.x;
            const y = typeof bbox.y === 'string' ? parseFloat(bbox.y) : bbox.y;
            const x2 = typeof bbox.x2 === 'string' ? parseFloat(bbox.x2) : bbox.x2;
            const y2 = typeof bbox.y2 === 'string' ? parseFloat(bbox.y2) : bbox.y2;
            const newViewBox = {
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
    // Load map data when scripts are ready
    (0, react_1.useEffect)(() => {
        const checkMapData = () => {
            if (typeof window !== 'undefined') {
                // Check for mapinfo first (from countrymap.js)
                if (window.simplemaps_countrymap_mapinfo) {
                    const mapInfo = window.simplemaps_countrymap_mapinfo;
                    if (mapInfo.paths) {
                        setMapPaths(mapInfo.paths);
                        setMapLoaded(true);
                        return;
                    }
                }
                // Fallback: check for mapdata (from mapdata.js)
                if (window.simplemaps_countrymap_mapdata) {
                    const mapData = window.simplemaps_countrymap_mapdata;
                    if (mapData && mapData.state_specific) {
                        // Extract paths from mapdata if available
                        setMapLoaded(true);
                        return;
                    }
                }
            }
        };
        // Check immediately
        checkMapData();
        // Also check periodically in case script loads asynchronously
        const interval = setInterval(() => {
            if (!mapLoaded) {
                checkMapData();
            }
            else {
                clearInterval(interval);
            }
        }, 100);
        // Timeout after 5 seconds - if map still not loaded, show error
        const timeout = setTimeout(() => {
            if (!mapLoaded) {
                console.warn('[BranchesMap] Map data failed to load after 5 seconds');
            }
        }, 5000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [mapLoaded]);
    // Update viewBox when zoomed state changes to trigger smooth transition
    (0, react_1.useEffect)(() => {
        if (svgRef.current) {
            // Force re-render for smooth transition
            svgRef.current.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
        }
    }, [viewBox]);
    // Get branches for the hovered/selected region
    const regionBranches = hoveredRegion ? branchesByRegion[hoveredRegion] || [] : [];
    return (<>
      {/* Load simplemaps scripts */}
      <script_1.default src={`/maps/countrymap.js?v=${Date.now()}`} strategy="afterInteractive" onLoad={() => {
            // Wait a bit for the script to execute
            setTimeout(() => {
                if (typeof window !== 'undefined' && window.simplemaps_countrymap_mapinfo) {
                    const mapInfo = window.simplemaps_countrymap_mapinfo;
                    if (mapInfo.paths) {
                        setMapPaths(mapInfo.paths);
                        setMapLoaded(true);
                    }
                }
            }, 100);
        }} onError={(e) => {
            console.warn('[BranchesMap] Failed to load countrymap.js:', e);
            // Try to use mapdata.js as fallback
            if (typeof window !== 'undefined' && window.simplemaps_countrymap_mapdata) {
                const mapData = window.simplemaps_countrymap_mapdata;
                if (mapData && mapData.state_specific) {
                    // Extract paths from mapdata if available
                    setMapLoaded(true);
                }
            }
        }}/>
      
      <div className="relative w-full aspect-[1000/652] max-h-[500px] bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden border border-blue-200">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes markerPulse {
            0%, 100% {
              opacity: 0.4;
            }
            50% {
              opacity: 0.8;
            }
          }
        ` }}/>
        {mapLoaded ? (<>
            {/* Zoom out button */}
            {isZoomed && (<button onClick={handleZoomOut} className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg hover:bg-gray-50 transition-colors" title={locale === 'ru' ? 'Вернуться к полной карте' : 'To\'liq xaritaga qaytish'}>
                <lucide_react_1.ZoomOut className="h-4 w-4"/>
                <span className="text-sm font-medium">
                  {locale === 'ru' ? 'Вся карта' : 'To\'liq xarita'}
                </span>
              </button>)}
            
            <svg ref={svgRef} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} className="w-full h-full transition-all duration-500 ease-in-out" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              {/* Uzbekistan regions - using paths from simplemaps */}
              {REGIONS_TO_SHOW.map((region) => {
                const path = mapPaths[region];
                if (!path)
                    return null;
                const isHovered = hoveredRegion === region;
                const isSelected = selectedRegion === region;
                const hasBranches = (branchesByRegion[region]?.length || 0) > 0;
                // Get region center for label placement
                const mapInfo = typeof window !== 'undefined' ? window.simplemaps_countrymap_mapinfo : null;
                const bbox = mapInfo?.state_bbox_array?.[region];
                let labelX = 0;
                let labelY = 0;
                if (bbox) {
                    const x = typeof bbox.x === 'string' ? parseFloat(bbox.x) : bbox.x;
                    const y = typeof bbox.y === 'string' ? parseFloat(bbox.y) : bbox.y;
                    const x2 = typeof bbox.x2 === 'string' ? parseFloat(bbox.x2) : bbox.x2;
                    const y2 = typeof bbox.y2 === 'string' ? parseFloat(bbox.y2) : bbox.y2;
                    // Use cx/cy if available, otherwise calculate center
                    if (bbox.cx && bbox.cy) {
                        labelX = typeof bbox.cx === 'string' ? parseFloat(bbox.cx) : bbox.cx;
                        labelY = typeof bbox.cy === 'string' ? parseFloat(bbox.cy) : bbox.cy;
                    }
                    else {
                        labelX = (x + x2) / 2;
                        labelY = (y + y2) / 2;
                    }
                }
                const regionName = REGION_NAMES[region]?.[locale] || region;
                return (<g key={region}>
                    <path d={path} fill={isSelected ? "#69c0ff" : isHovered ? "#91d5ff" : hasBranches ? "#bae7ff" : "#e6f7ff"} stroke={isSelected ? "#0958d9" : isHovered ? "#0958d9" : "#1890ff"} strokeWidth={isSelected ? "3" : isHovered ? "2.5" : "1"} style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        pointerEvents: 'all'
                    }} onMouseEnter={() => {
                        setHoveredRegion(region);
                    }} onMouseLeave={() => {
                        setHoveredRegion(null);
                    }} onClick={(e) => {
                        e.stopPropagation();
                        handleRegionClick(region);
                    }}/>
                    {/* Region name label - only show when not zoomed */}
                    {!isZoomed && (<text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fill={isHovered ? "#0958d9" : "#1890ff"} fontSize="12" fontWeight={isHovered ? "700" : "600"} style={{
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }} className="drop-shadow-sm">
                        {regionName}
                      </text>)}
                  </g>);
            })}
          
              {/* Branch markers removed - map is used only for region selection */}
            </svg>
          </>) : (<div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {locale === 'ru' ? 'Загрузка карты...' : 'Xarita yuklanmoqda...'}
              </p>
            </div>
          </div>)}
      </div>

      {/* Modal for multiple branches at same location */}
      {selectedBranchId && (() => {
            const selectedBranchWithCoords = branchesWithCoords.find(b => b.id === selectedBranchId);
            if (!selectedBranchWithCoords)
                return null;
            // Find all branches at the same location
            const branchesAtLocation = branchesWithCoords.filter(b => {
                if (b.id === selectedBranchId)
                    return true;
                const distance = Math.sqrt(Math.pow(b.svgX - selectedBranchWithCoords.svgX, 2) +
                    Math.pow(b.svgY - selectedBranchWithCoords.svgY, 2));
                return distance < 30;
            });
            // Only show modal if there are multiple branches
            if (branchesAtLocation.length <= 1)
                return null;
            return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
            <div className="relative w-full max-w-2xl max-h-[90vh] rounded-lg bg-white shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModal} className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow-md hover:bg-gray-100 transition-colors">
                <lucide_react_1.X className="h-4 w-4"/>
              </button>
              
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <h2 className="mb-4 text-2xl font-bold text-foreground">
                  {locale === 'ru' ? 'Филиалы в этом районе' : 'Bu tuman filiallari'} ({branchesAtLocation.length})
                </h2>
                
                <div className="space-y-6">
                  {branchesAtLocation.map((branch) => (<div key={branch.id} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
                      <h3 className="mb-3 text-xl font-semibold text-foreground">
                        {(0, locale_1.getBilingualText)(branch.name_uz, branch.name_ru, locale)}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <lucide_react_1.MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-primary"/>
                          <span className="leading-relaxed">
                            {(0, locale_1.getBilingualText)(branch.address_uz, branch.address_ru, locale)}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <svg className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                          </svg>
                          <div className="flex flex-col">
                            <a href={`tel:${branch.phone}`} className="hover:text-brand-primary transition-colors">
                              {branch.phone}
                            </a>
                            {branch.phones && branch.phones.length > 0 && (<div className="mt-1 space-y-0.5">
                                {branch.phones.map((phone, idx) => (<a key={idx} href={`tel:${phone}`} className="block hover:text-brand-primary transition-colors">
                                    {phone}
                                  </a>))}
                              </div>)}
                          </div>
                        </div>
                      </div>
                      
                      <button onClick={() => {
                        const slug = branch.slug || branch.id;
                        router.push(`/branches/${slug}`);
                    }} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors">
                        {locale === 'ru' ? 'Подробнее' : 'Batafsil'}
                      </button>
                    </div>))}
                </div>
              </div>
            </div>
          </div>);
        })()}
    </>);
}
//# sourceMappingURL=branches-map.js.map