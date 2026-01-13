import type { BranchResponse } from '@/lib/api';
interface BranchesMapProps {
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
            state_labels?: Record<string, {
                x: number | string;
                y: number | string;
                text?: string;
            }>;
            initial_view: {
                x: number;
                y: number;
                x2: number;
                y2: number;
            };
        };
    }
}
export default function BranchesMap({ branches, locale, onRegionSelect, selectedRegion, onBranchesByRegionChange, onRegionNamesChange }: BranchesMapProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=branches-map.d.ts.map