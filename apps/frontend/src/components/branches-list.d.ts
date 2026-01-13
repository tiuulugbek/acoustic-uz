import type { BranchResponse } from '@/lib/api';
interface BranchesListProps {
    branches: BranchResponse[];
    selectedRegion: string | null;
    locale: 'uz' | 'ru';
    onClearFilter: () => void;
    branchesByRegion?: Record<string, BranchResponse[]>;
    regionNames?: Record<string, {
        uz: string;
        ru: string;
    }>;
}
export default function BranchesList({ branches, selectedRegion, locale, onClearFilter, branchesByRegion, regionNames }: BranchesListProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=branches-list.d.ts.map