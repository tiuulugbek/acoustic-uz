'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getBilingualText } from '@/lib/locale';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import BranchesMap from '@/components/branches-map';
import BranchesList from '@/components/branches-list';
import PageHeader from '@/components/page-header';
import type { BranchResponse, PostResponse } from '@/lib/api';

interface BranchesPageContentProps {
  initialBranches: BranchResponse[];
  initialPosts: PostResponse[];
  initialLocale: 'uz' | 'ru';
}

export default function BranchesPageContent({ 
  initialBranches, 
  initialPosts, 
  initialLocale 
}: BranchesPageContentProps) {
  const searchParams = useSearchParams();
  const [branches] = useState<BranchResponse[]>(initialBranches);
  const [posts] = useState<PostResponse[]>(initialPosts);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [locale] = useState<'uz' | 'ru'>(initialLocale);
  const [branchesByRegion, setBranchesByRegion] = useState<Record<string, BranchResponse[]>>({});
  const [regionNames, setRegionNames] = useState<Record<string, { uz: string; ru: string }>>({});
  
  // Check URL params on mount
  useEffect(() => {
    const regionParam = searchParams.get('region');
    if (regionParam) {
      setSelectedRegion(regionParam);
    }
  }, [searchParams]);
  
  const usefulArticles = posts?.slice(0, 5) || [];

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        locale={locale}
        breadcrumbs={[
          { label: locale === 'ru' ? 'Главная' : 'Bosh sahifa', href: '/' },
          { label: locale === 'ru' ? 'Наши адреса' : 'Bizning manzillarimiz' },
        ]}
        title={locale === 'ru' ? 'Acoustic — Филиалы центра слуха' : 'Acoustic — Eshitish markazi filiallari'}
        icon={<MapPin className="h-8 w-8 text-white" />}
      />

      {/* Main Content */}
      <section className="bg-muted/40 py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Left Column - Map and Branches List */}
            <div className="space-y-8">
              {/* Map */}
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <BranchesMap 
                  branches={branches} 
                  locale={locale}
                  onRegionSelect={setSelectedRegion}
                  selectedRegion={selectedRegion}
                  onBranchesByRegionChange={setBranchesByRegion}
                  onRegionNamesChange={setRegionNames}
                />
              </div>
              
              {/* Branches List - Filtered by selected region */}
              <BranchesList 
                branches={branches}
                selectedRegion={selectedRegion}
                locale={locale}
                onClearFilter={() => setSelectedRegion(null)}
                branchesByRegion={branchesByRegion}
                regionNames={regionNames}
              />
            </div>

            {/* Right Column - Useful Articles - Sticky Sidebar */}
            <aside className="lg:sticky lg:top-4 lg:self-start space-y-6">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-foreground" suppressHydrationWarning>
                  {locale === 'ru' ? 'Полезные статьи' : 'Foydali maqolalar'}
                </h3>
                {usefulArticles.length > 0 ? (
                  <ul className="space-y-4">
                    {usefulArticles.map((article) => {
                      const title = getBilingualText(article.title_uz, article.title_ru, locale);
                      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                      let imageUrl = article.cover?.url || '';
                      if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
                        const baseUrl = API_BASE_URL.replace('/api', '');
                        imageUrl = `${baseUrl}${imageUrl}`;
                      }
                      
                      return (
                        <li key={article.id}>
                          <Link
                            href={`/posts/${article.slug}`}
                            className="group flex items-start gap-3 transition hover:opacity-80"
                          >
                            {imageUrl ? (
                              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted/20">
                                <Image
                                  src={imageUrl}
                                  alt={title}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  sizes="64px"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-brand-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-foreground group-hover:text-brand-primary line-clamp-2 transition-colors" suppressHydrationWarning>
                                {title}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                    {locale === 'ru' ? 'Статьи скоро будут добавлены.' : 'Maqolalar tez orada qo\'shiladi.'}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

