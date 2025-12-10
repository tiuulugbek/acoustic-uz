import { Suspense } from 'react';
import { detectLocale } from '@/lib/locale-server';
import { getBranches, getPosts } from '@/lib/api-server';
import BranchesPageContent from './page-content';
import type { BranchResponse, PostResponse } from '@/lib/api';

export default async function BranchesPage() {
  const locale = detectLocale();
  
  // Fetch data on server
  const [branches, posts] = await Promise.all([
    getBranches(locale),
    getPosts(locale, true, undefined, 'article'),
  ]);

  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Yuklanmoqda...</p>
          </div>
        </div>
      </main>
    }>
      <BranchesPageContent 
        initialBranches={branches || []} 
        initialPosts={posts || []}
        initialLocale={locale}
      />
    </Suspense>
  );
}
