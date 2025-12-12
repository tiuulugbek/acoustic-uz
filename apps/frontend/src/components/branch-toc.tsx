'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/locale';

interface BranchTOCProps {
  locale: Locale;
  hasTour3d: boolean;
}

export default function BranchTOC({ locale, hasTour3d }: BranchTOCProps) {
  // Build TOC sections consistently - use hasTour3d prop directly
  // Since this is a client component, hasTour3d prop is already available from server
  // No need for mounted state - just use the prop directly
  const baseSections = [
    { id: 'services', label: locale === 'ru' ? 'Услуги' : 'Xizmatlar' },
    { id: 'doctors', label: locale === 'ru' ? 'Врачи' : 'Shifokorlar' },
  ];
  
  const tour3dSection = { id: 'tour3d', label: locale === 'ru' ? '3D Тур' : '3D Tour' };
  const locationSection = { id: 'location', label: locale === 'ru' ? 'Как добраться' : 'Qanday yetib borish' };
  
  // Build sections array consistently - always use hasTour3d prop
  // This ensures SSR and client render the same content
  const tocSections = [
    ...baseSections,
    ...(hasTour3d ? [tour3dSection] : []),
    locationSection
  ];

  return (
    <div suppressHydrationWarning>
      <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-bold text-foreground" suppressHydrationWarning>
        {locale === 'ru' ? 'В этой статье' : 'Bu maqolada'}
      </h3>
      <nav className="space-y-1.5 sm:space-y-2" suppressHydrationWarning>
        {tocSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="block text-xs sm:text-sm text-brand-primary hover:underline break-words"
            suppressHydrationWarning
          >
            <span suppressHydrationWarning>{section.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

