'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/locale';

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number; // 1 for h1, 2 for h2, 3 for h3, etc.
}

interface ArticleTableOfContentsProps {
  items: TableOfContentsItem[];
  locale: Locale;
}

export default function ArticleTableOfContents({ items, locale }: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;

    // Set first item as active by default
    setActiveId(items[0]?.id || '');

    // Handle scroll to update active item
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for header

      // Find the current section based on scroll position
      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(items[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Update active ID after scroll
      setTimeout(() => {
        setActiveId(id);
      }, 100);
    }
  };

  return (
    <div className="rounded-lg border border-border/60 bg-white p-4 shadow-sm" suppressHydrationWarning>
      <h3 className="mb-3 text-base font-bold text-foreground" suppressHydrationWarning>
        {locale === 'ru' ? 'В этой статье' : 'Ushbu maqolada'}
      </h3>
      <nav className="space-y-1.5" suppressHydrationWarning>
        {items.map((item) => {
          const isActive = activeId === item.id;
          const indentClass = item.level === 1 ? 'pl-0' : item.level === 2 ? 'pl-3' : 'pl-6';
          
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`block text-sm text-brand-primary hover:text-brand-accent transition-colors break-words ${indentClass} ${
                isActive ? 'font-semibold text-brand-accent' : 'font-normal'
              }`}
              suppressHydrationWarning
            >
              <span suppressHydrationWarning>{item.text}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

