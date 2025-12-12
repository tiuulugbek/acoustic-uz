'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-brand-primary mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Xatolik yuz berdi
            </h2>
            <p className="text-gray-600 mb-8">
              Kechirasiz, serverda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
              >
                Qayta urinib ko'rish
              </button>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Bosh sahifaga qaytish
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

