'use client';

import { useMemo } from 'react';

interface ServiceContentProps {
  content: string;
  locale: 'uz' | 'ru';
}

/**
 * Renders service body content with support for:
 * - HTML content (from RichTextEditor)
 * - Markdown-style **bold** text
 * - Numbered and bullet lists
 * - Headings (##, ###)
 * - Paragraphs
 */
export default function ServiceContent({ content, locale }: ServiceContentProps) {
  const renderedContent = useMemo(() => {
    if (!content || !content.trim()) {
      return null;
    }

    // Check if content is HTML (contains HTML tags)
    const isHTML = /<[a-z][\s\S]*>/i.test(content);
    
    if (isHTML) {
      // Add IDs to headings for table of contents (in order)
      let processedContent = content;
      let headingIndex = 0;
      
      // Process all headings in order (H2 and H3 together)
      processedContent = processedContent.replace(/<(h[23])([^>]*)>(.*?)<\/h[23]>/gi, (match, tag, attrs, text) => {
        // Check if id already exists
        if (attrs && attrs.includes('id=')) {
          return match; // Keep existing ID
        }
        const id = `section-${headingIndex++}`;
        const scrollClass = 'scroll-mt-20';
        // Preserve existing classes or add scroll class
        if (attrs && attrs.includes('class=')) {
          attrs = attrs.replace(/class="([^"]*)"/, `class="$1 ${scrollClass}"`);
        } else {
          attrs = `${attrs} class="${scrollClass}"`;
        }
        return `<${tag}${attrs} id="${id}">${text}</${tag}>`;
      });
      
      // Render HTML content directly
      return (
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      );
    }

    // Otherwise, process as markdown
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'ordered' | 'unordered' | null = null;
    let listKey = 0;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const items = currentList.map((item, idx) => (
          <li key={`${listKey}-${idx}`} className="mb-2 pl-2">
            {renderInlineContent(item.trim())}
          </li>
        ));
        elements.push(
          listType === 'ordered' ? (
            <ol key={`list-${listKey}`} className="mb-4 ml-6 list-decimal space-y-2">
              {items}
            </ol>
          ) : (
            <ul key={`list-${listKey}`} className="mb-4 ml-6 list-disc space-y-2">
              {items}
            </ul>
          ),
        );
        currentList = [];
        listType = null;
        listKey++;
      }
    };

    const renderInlineContent = (text: string) => {
      // Handle **bold** text
      const parts: (string | JSX.Element)[] = [];
      const boldRegex = /\*\*(.+?)\*\*/g;
      let lastIndex = 0;
      let match;
      let key = 0;

      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={`bold-${key++}`} className="font-semibold text-foreground">
            {match[1]}
          </strong>,
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? <>{parts}</> : text;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      // Check for headings
      if (trimmed.startsWith('### ')) {
        flushList();
        const headingText = trimmed.substring(4);
        const headingId = `section-${index}`;
        elements.push(
          <h3 key={`h3-${index}`} id={headingId} className="mb-3 mt-6 scroll-mt-20 text-xl font-semibold text-foreground">
            {renderInlineContent(headingText)}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        flushList();
        const headingText = trimmed.substring(3);
        const headingId = `section-${index}`;
        elements.push(
          <h2 key={`h2-${index}`} id={headingId} className="mb-4 mt-8 scroll-mt-20 text-2xl font-bold text-foreground">
            {renderInlineContent(headingText)}
          </h2>
        );
        return;
      }

      // Check for ordered list (1., 2., etc.)
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (orderedMatch) {
        if (listType !== 'ordered') {
          flushList();
          listType = 'ordered';
        }
        currentList.push(orderedMatch[2]);
        return;
      }

      // Check for unordered list (-, *, •)
      const unorderedMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      if (unorderedMatch) {
        if (listType !== 'unordered') {
          flushList();
          listType = 'unordered';
        }
        currentList.push(unorderedMatch[1]);
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${index}`} className="mb-4 leading-relaxed text-foreground/90">
          {renderInlineContent(trimmed)}
        </p>
      );
    });

    flushList();

    return elements;
  }, [content]);

  if (!renderedContent || renderedContent.length === 0) {
    return (
      <p className="text-muted-foreground" suppressHydrationWarning>
        {locale === 'ru'
          ? 'Подробная информация об этой услуге скоро будет добавлена.'
          : "Ushbu xizmat bo'yicha batafsil ma'lumot tez orada qo'shiladi."}
      </p>
    );
  }

  return <article className="prose prose-lg max-w-none">{renderedContent}</article>;
}

