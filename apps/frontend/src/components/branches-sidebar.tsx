'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BranchesMapSidebar from './branches-map-sidebar';
import type { BranchResponse } from '@/lib/api';

interface BranchesSidebarProps {
  locale: 'uz' | 'ru';
  branches: BranchResponse[];
}

export default function BranchesSidebar({ locale, branches: initialBranches }: BranchesSidebarProps) {
  const router = useRouter();
  const [branchesByRegion, setBranchesByRegion] = useState<Record<string, BranchResponse[]>>({});
  const [regionNames, setRegionNames] = useState<Record<string, { uz: string; ru: string }>>({});
  
  const handleRegionSelect = (regionCode: string | null) => {
    if (regionCode) {
      // Navigate to /branches page with region filter
      router.push(`/branches?region=${regionCode}`);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Map */}
      <div>
        <BranchesMapSidebar
          branches={initialBranches}
          locale={locale}
          onRegionSelect={handleRegionSelect}
          selectedRegion={null}
          onBranchesByRegionChange={setBranchesByRegion}
          onRegionNamesChange={setRegionNames}
        />
      </div>
    </div>
  );
}

