'use client';

import Image from 'next/image';
import { useState } from 'react';
import { normalizeImageUrl } from '@/lib/image-utils';

interface CatalogHeroImageProps {
  src: string;
  alt: string;
  locale: string;
}

export default function CatalogHeroImage({ src, alt, locale }: CatalogHeroImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="relative h-64 lg:h-80 w-full rounded-lg overflow-hidden bg-brand-primary flex items-center justify-center">
        <div className="text-white text-center space-y-3 px-6">
          <h2 className="text-2xl lg:text-3xl font-bold">
            {locale === 'ru' 
              ? 'Слышать и жить полной жизнью' 
              : 'Eshitish va to\'liq hayot kechirish'}
          </h2>
          <p className="text-base lg:text-lg opacity-90 max-w-2xl">
            {locale === 'ru'
              ? 'Современные слуховые аппараты помогут вам слышать каждый звук и наслаждаться жизнью без ограничений'
              : 'Zamonaviy eshitish moslamalari sizga har bir tovushni eshitish va cheklovlarsiz hayotdan bahramand bo\'lishga yordam beradi'}
          </p>
        </div>
      </div>
    );
  }

  // Normalize image URL
  const normalizedSrc = normalizeImageUrl(src) || src;

  return (
    <div className="relative h-64 lg:h-80 w-full rounded-lg overflow-hidden">
      <Image
        src={normalizedSrc}
        alt={alt}
        fill
        className="object-cover rounded-lg"
        sizes="100vw"
        priority
        onError={() => setImageError(true)}
        suppressHydrationWarning
        unoptimized
      />
    </div>
  );
}

