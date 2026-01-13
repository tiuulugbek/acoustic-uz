'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

// Secret code for presentation page access
const PRESENTATION_SECRET_CODE = 'acoustic2024';

interface PresentationLockProps {
  children: React.ReactNode;
}

export default function PresentationLock({ children }: PresentationLockProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already unlocked in session storage
    const unlocked = sessionStorage.getItem('presentation_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PRESENTATION_SECRET_CODE) {
      setIsUnlocked(true);
      sessionStorage.setItem('presentation_unlocked', 'true');
      setError('');
      setCode('');
    } else {
      setError('Noto\'g\'ri kod');
      setCode('');
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F07E22]/10 mb-4">
            <Lock className="h-8 w-8 text-[#F07E22]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Maxfiy taqdimot sahifasi
          </h1>
          <p className="text-gray-600 text-sm">
            Kirish uchun maxfiy kodni kiriting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              placeholder="Maxfiy kod"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F07E22] focus:border-transparent text-center text-lg font-mono tracking-wider"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#F07E22] to-[#3F3091] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Kirish
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Bu sahifa faqat maxfiy kod bilan kirish mumkin
          </p>
        </div>
      </div>
    </div>
  );
}
