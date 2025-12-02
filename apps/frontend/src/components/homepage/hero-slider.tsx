'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import type { BannerResponse } from '@/lib/api';
import type { Locale } from '@/lib/locale';
import { normalizeImageUrl } from '@/lib/image-utils';

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  link: string;
};

interface HeroSliderProps {
  banners: BannerResponse[];
  locale: Locale;
  apiBaseUrl: string;
  phoneNumber?: string;
  phoneLink?: string;
}

export default function HeroSlider({ banners, locale, apiBaseUrl, phoneNumber = '1385', phoneLink = '+998712021441' }: HeroSliderProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Convert banners to slides
  const slides: HeroSlide[] = banners
    .filter((banner) => banner.title_uz || banner.title_ru)
    .map((banner, index) => {
      const title = locale === 'ru' ? (banner.title_ru || '') : (banner.title_uz || '');
      const subtitle = locale === 'ru' ? (banner.text_ru || '') : (banner.text_uz || '');
      const cta = locale === 'ru' ? (banner.ctaText_ru || '') : (banner.ctaText_uz || '');
      
      let imageUrl = banner.image?.url || '';
      
      // Normalize image URL using shared utility
      if (imageUrl) {
        imageUrl = normalizeImageUrl(imageUrl);
        
        // Debug: log banner image data
        if (process.env.NODE_ENV === 'development') {
          console.log('[HeroSlider] Banner image:', {
            bannerId: banner.id,
            originalUrl: banner.image?.url,
            normalizedUrl: imageUrl,
            apiBaseUrl,
          });
        }
      }
      
      return {
        id: banner.id ?? `banner-${index}`,
        title: title || '',
        subtitle: subtitle || '',
        cta: cta || '',
        image: imageUrl || '',
        link: banner.ctaLink || '#',
      };
    });

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  // Reset active slide when locale changes
  useEffect(() => {
    setActiveSlide(0);
  }, [locale]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="flex flex-col-reverse md:flex-row md:items-stretch">
            {/* Left Panel - Text Content */}
            <div className="relative flex flex-col justify-center bg-white px-6 py-6 md:px-8 md:py-8 md:w-1/2 md:min-h-[320px] rounded-b-lg md:rounded-b-none md:rounded-l-lg overflow-hidden">
              {slides.map((slide, index) => (
                <div
                  key={`text-${slide.id}`}
                  className={`transition-opacity duration-500 ease-in-out ${
                    index === activeSlide 
                      ? 'opacity-100 relative z-10' 
                      : 'absolute inset-0 opacity-0 z-0 pointer-events-none'
                  }`}
                  style={{
                    visibility: index === activeSlide ? 'visible' : 'hidden',
                    willChange: 'opacity',
                  }}
                >
                  <div className="space-y-3 md:space-y-4">
                    <h1 className="text-xl font-bold leading-tight text-[#1e3a8a] md:text-2xl lg:text-3xl" suppressHydrationWarning>
                      {slide.title}
                    </h1>
                    {slide.subtitle && (
                      <p className="text-sm leading-relaxed text-muted-foreground md:text-base" suppressHydrationWarning>
                        {slide.subtitle}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {slide.cta && (
                        <Link
                          href={slide.link}
                          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary/90 md:px-5 md:py-2.5"
                          suppressHydrationWarning
                        >
                          {slide.cta}
                          <ArrowRight size={14} className="md:w-4 md:h-4" />
                        </Link>
                      )}
                      <Link
                        href={`tel:${phoneLink}`}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/50 md:px-5 md:py-2.5"
                        suppressHydrationWarning
                      >
                        <Phone size={14} className="md:w-4 md:h-4" />
                        <span>{phoneNumber}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {slides.length > 1 && (
                <div className="absolute bottom-3 left-6 flex items-center gap-2 z-20 md:bottom-4 md:left-8">
                  {slides.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      type="button"
                      onClick={() => setActiveSlide(dotIndex)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        dotIndex === activeSlide
                          ? 'h-2.5 w-2.5 bg-brand-primary'
                          : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                      }`}
                      aria-label={`Go to slide ${dotIndex + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel - Image */}
            <div className="relative w-full md:w-1/2 bg-brand-primary md:min-h-[320px] rounded-t-lg md:rounded-t-none md:rounded-r-lg overflow-hidden">
              {slides.map((slide, index) => {
                const imageUrl = slide.image;
                const isActive = index === activeSlide;
                const hasRealImage = imageUrl && imageUrl.trim().length > 0;
                
                // Debug: log slide image
                if (process.env.NODE_ENV === 'development' && isActive) {
                  console.log('[HeroSlider] Active slide image:', {
                    slideId: slide.id,
                    imageUrl,
                    hasRealImage,
                  });
                }
                
                return (
                  <div
                    key={`image-${slide.id}`}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out rounded-r-lg ${
                      isActive 
                        ? 'opacity-100 z-10' 
                        : 'opacity-0 z-0 pointer-events-none'
                    }`}
                    style={{
                      visibility: isActive ? 'visible' : 'hidden',
                      willChange: 'opacity',
                    }}
                  >
                    {hasRealImage ? (
                      <div className="absolute inset-0 overflow-hidden rounded-r-lg">
                        <img
                          src={imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover object-center"
                          style={{ 
                            minWidth: '100%',
                            minHeight: '100%'
                          }}
                          onError={(e) => {
                            console.error('[HeroSlider] Image load error:', {
                              imageUrl,
                              slideId: slide.id,
                            });
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center rounded-r-lg"><span class="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Acoustic</span></div>';
                            }
                          }}
                          onLoad={() => {
                            if (process.env.NODE_ENV === 'development') {
                              console.log('[HeroSlider] Image loaded successfully:', imageUrl);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center rounded-r-lg">
                        <span className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Acoustic</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

