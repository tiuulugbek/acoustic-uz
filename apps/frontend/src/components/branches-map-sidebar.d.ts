import type { BranchResponse } from '@/lib/api';
interface BranchesMapSidebarProps {
    branches: BranchResponse[];
    locale: 'uz' | 'ru';
    onRegionSelect?: (regionCode: string | null) => void;
    selectedRegion?: string | null;
    onBranchesByRegionChange?: (branchesByRegion: Record<string, BranchResponse[]>) => void;
    onRegionNamesChange?: (regionNames: Record<string, {
        uz: string;
        ru: string;
    }>) => void;
}
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
export default function BranchesMapSidebar({ branches, locale, onRegionSelect, selectedRegion, onBranchesByRegionChange, onRegionNamesChange }: BranchesMapSidebarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=branches-map-sidebar.d.ts.map