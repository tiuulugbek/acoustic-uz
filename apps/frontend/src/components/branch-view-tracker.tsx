'use client';

import { useEffect } from 'react';
import { trackBranchView } from '@/lib/analytics';

interface BranchViewTrackerProps {
  slug: string;
  name: string;
}

export default function BranchViewTracker({ slug, name }: BranchViewTrackerProps) {
  useEffect(() => {
    trackBranchView(slug, name);
  }, [slug, name]);

  return null;
}

