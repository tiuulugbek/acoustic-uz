import type { BranchResponse } from '@/lib/api';
interface BranchesSidebarProps {
    locale: 'uz' | 'ru';
    branches: BranchResponse[];
}
export default function BranchesSidebar({ locale, branches: initialBranches }: BranchesSidebarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=branches-sidebar.d.ts.map