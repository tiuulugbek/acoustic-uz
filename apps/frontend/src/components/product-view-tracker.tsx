'use client';

import { useEffect } from 'react';
import { trackProductView } from '@/lib/analytics';

interface ProductViewTrackerProps {
  slug: string;
  name: string;
}

export default function ProductViewTracker({ slug, name }: ProductViewTrackerProps) {
  useEffect(() => {
    trackProductView(slug, name);
  }, [slug, name]);

  return null;
}

