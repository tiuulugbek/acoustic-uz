import { Suspense } from 'react';
import BranchesPageContent from './page-content';

export default function BranchesPage() {
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
      <BranchesPageContent />
    </Suspense>
  );
}
