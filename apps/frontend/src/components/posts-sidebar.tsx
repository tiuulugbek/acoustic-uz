'use client';

import Link from 'next/link';
import { MapPin, Star, MessageSquare, Phone } from 'lucide-react';
import { getBilingualText } from '@/lib/locale';
import type { BranchResponse } from '@/lib/api';
import BranchesMapSidebar from './branches-map-sidebar';

interface PostsSidebarProps {
  locale: 'uz' | 'ru';
  branches: BranchResponse[];
}

export default function PostsSidebar({ locale, branches }: PostsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Map Section */}
      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <MapPin className="h-5 w-5 text-brand-primary" />
          {locale === 'ru' ? 'Наши адреса' : 'Bizning manzillarimiz'}
        </h3>
        {branches && branches.length > 0 ? (
          <div className="space-y-4">
            {/* Map Component */}
            <div className="mb-4">
              <BranchesMapSidebar
                branches={branches}
                locale={locale}
                onRegionSelect={() => {}}
                selectedRegion={null}
                onBranchesByRegionChange={() => {}}
                onRegionNamesChange={() => {}}
              />
            </div>
            
            {/* Branch list */}
            {branches.slice(0, 3).map((branch) => {
              const branchName = getBilingualText(branch.name_uz, branch.name_ru, locale);
              const address = getBilingualText(branch.address_uz, branch.address_ru, locale);
              
              return (
                <div key={branch.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <Link
                    href={`/branches/${branch.slug || branch.id}`}
                    className="block transition-colors hover:text-brand-primary"
                  >
                    <h4 className="font-semibold text-sm text-foreground mb-2">
                      {branchName}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {address}
                    </p>
                    {branch.phone && (
                      <div className="flex items-center gap-1 text-xs text-brand-primary">
                        <Phone className="h-3 w-3" />
                        <span>{branch.phone}</span>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
            {branches.length > 3 && (
              <Link
                href="/branches"
                className="block text-center text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors pt-2 border-t border-border"
              >
                {locale === 'ru' ? 'Все адреса →' : 'Barcha manzillar →'}
              </Link>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {locale === 'ru' ? 'Адреса скоро будут добавлены' : 'Manzillar tez orada qo\'shiladi'}
          </p>
        )}
      </div>

      {/* Reviews Section */}
      <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Star className="h-5 w-5 text-brand-primary fill-brand-primary" />
          {locale === 'ru' ? 'Ваши отзывы' : 'Sizning sharhlaringiz'}
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {locale === 'ru' 
            ? 'Реальные отзывы о работе Центров, врачах и слуховых аппаратах'
            : 'Markazlar, shifokorlar va eshitish apparatlari haqida haqiqiy sharhlar'}
        </p>
        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors"
        >
          {locale === 'ru' ? 'Оставить отзыв →' : 'Sharh qoldirish →'}
        </Link>
      </div>

      {/* Additional Info Section */}
      <div className="rounded-lg border border-border bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 p-5">
        <h3 className="mb-3 text-lg font-semibold text-foreground">
          {locale === 'ru' ? 'Нужна консультация?' : 'Maslahat kerakmi?'}
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {locale === 'ru'
            ? 'Наши специалисты готовы ответить на все ваши вопросы и помочь подобрать оптимальное решение для вашего слуха.'
            : 'Bizning mutaxassislarimiz barcha savollaringizga javob berishga va eshitishingiz uchun eng yaxshi yechimni topishga tayyor.'}
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent"
        >
          <MessageSquare className="h-4 w-4" />
          {locale === 'ru' ? 'Связаться с нами' : 'Biz bilan bog\'lanish'}
        </Link>
      </div>
    </div>
  );
}

