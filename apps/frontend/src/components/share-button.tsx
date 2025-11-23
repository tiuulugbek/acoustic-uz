'use client';

import { Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ShareButtonProps {
  title: string;
  text?: string;
  locale: 'uz' | 'ru';
}

export default function ShareButton({ title, text, locale }: ShareButtonProps) {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.href);
    }
  }, []);

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || '',
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(locale === 'ru' ? 'Ссылка скопирована!' : 'Havola nusxalandi!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      <Share2 className="h-4 w-4" />
      {locale === 'ru' ? 'Поделиться' : 'Ulashish'}
    </button>
  );
}

