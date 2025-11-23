'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

interface ArticleTOCProps {
  locale: 'uz' | 'ru';
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function ArticleTOC({ locale }: ArticleTOCProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    // Find all headings in the article - try multiple selectors
    const selectors = [
      'article h2, article h3',
      '.prose h2, .prose h3',
      'h2[id], h3[id]',
    ];
    
    let headings: NodeListOf<Element> | null = null;
    for (const selector of selectors) {
      headings = document.querySelectorAll(selector);
      if (headings.length > 0) break;
    }

    // If still no headings found, wait a bit for content to load
    if (!headings || headings.length === 0) {
      const timeout = setTimeout(() => {
        headings = document.querySelectorAll('h2[id], h3[id]');
        const items: TOCItem[] = [];
        
        headings.forEach((heading) => {
          const id = heading.id || heading.getAttribute('id');
          const text = heading.textContent?.trim() || '';
          const tagName = heading.tagName.toLowerCase();
          const level = tagName === 'h2' ? 2 : 3;

          if (id && text) {
            items.push({ id, text, level });
          }
        });

        setTocItems(items);
      }, 500);
      
      return () => clearTimeout(timeout);
    }

    const items: TOCItem[] = [];

    headings.forEach((heading) => {
      const id = heading.id || heading.getAttribute('id');
      const text = heading.textContent?.trim() || '';
      const tagName = heading.tagName.toLowerCase();
      const level = tagName === 'h2' ? 2 : 3;

      if (id && text) {
        items.push({ id, text, level });
      }
    });

    setTocItems(items);
  }, []);

  if (tocItems.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
        <FileText className="h-5 w-5 text-brand-primary" />
        {locale === 'ru' ? 'В этой статье' : 'Ushbu maqolada'}
      </h3>
      <nav>
        <ul className="space-y-2">
          {tocItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`block text-sm leading-relaxed text-muted-foreground transition-colors hover:text-brand-primary ${
                  item.level === 3 ? 'pl-4' : ''
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

