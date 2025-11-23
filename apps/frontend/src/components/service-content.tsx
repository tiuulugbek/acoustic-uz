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
      
      // Process tooltips: [tooltips keyword="..." content="..."]
      const tooltipRegex = /\[tooltips\s+keyword=["']([^"']+)["']\s+content=["']([^"']+)["']\]/gi;
      processedContent = processedContent.replace(tooltipRegex, (match, keyword, tooltipContent) => {
        // Escape HTML in content
        const escapedContent = tooltipContent
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
        
        // Replace with a span that has data attributes for tooltip
        return `<span class="tooltip-trigger cursor-help border-b border-dashed border-brand-primary/40 text-brand-primary hover:border-brand-primary" data-tooltip-keyword="${keyword.replace(/"/g, '&quot;')}" data-tooltip-content="${escapedContent}">${keyword}</span>`;
      });
      
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
      
      // Process images to add placeholder if src is missing or broken
      processedContent = processedContent.replace(/<img([^>]*)>/gi, (match, attrs) => {
        // Check if src exists
        const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
        if (!srcMatch || !srcMatch[1] || srcMatch[1].trim() === '') {
          // Replace with placeholder div
          return '<div class="relative my-6 flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30"><span class="text-sm text-muted-foreground">Rasm</span></div>';
        }
        // Ensure image has proper classes and error handling
        let newAttrs = attrs;
        if (!newAttrs.includes('class=')) {
          newAttrs += ' class="rounded-lg shadow-md my-6 w-full"';
        } else {
          newAttrs = newAttrs.replace(/class=["']([^"']*)["']/i, 'class="$1 rounded-lg shadow-md my-6 w-full"');
        }
        // Add onerror handler to show placeholder if image fails to load
        if (!newAttrs.includes('onerror=')) {
          newAttrs += ' onerror="this.onerror=null; this.style.display=\'none\'; const placeholder = document.createElement(\'div\'); placeholder.className = \'relative my-6 flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30\'; placeholder.innerHTML = \'<span class=\\\'text-sm text-muted-foreground\\\'>Rasm</span>\'; this.parentNode.insertBefore(placeholder, this.nextSibling);"';
        }
        return `<img${newAttrs} />`;
      });
      
      // Render HTML content directly with tooltip support
      return (
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: processedContent }}
          ref={(el) => {
            if (el) {
              // Add tooltip functionality after render
              const tooltipTriggers = el.querySelectorAll('.tooltip-trigger');
              tooltipTriggers.forEach((trigger) => {
                const keyword = trigger.getAttribute('data-tooltip-keyword') || '';
                const tooltipContent = trigger.getAttribute('data-tooltip-content') || '';
                
                if (keyword && tooltipContent) {
                  // Decode HTML entities
                  const decodedContent = tooltipContent
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");
                  
                  // Add hover event
                  let tooltipElement: HTMLDivElement | null = null;
                  
                  const showTooltip = () => {
                    if (tooltipElement) return;
                    
                    tooltipElement = document.createElement('div');
                    tooltipElement.className = 'absolute z-50 w-64 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg transition-opacity';
                    tooltipElement.innerHTML = `
                      <div class="font-semibold text-white mb-1">${keyword}</div>
                      <div class="text-gray-300 leading-relaxed">${decodedContent}</div>
                      <div class="absolute left-4 top-full h-0 w-0 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent"></div>
                    `;
                    
                    const wrapper = document.createElement('span');
                    wrapper.style.position = 'relative';
                    wrapper.style.display = 'inline-block';
                    wrapper.innerHTML = trigger.innerHTML;
                    wrapper.appendChild(tooltipElement);
                    
                    // Position tooltip
                    const updatePosition = () => {
                      if (!tooltipElement) return;
                      const rect = wrapper.getBoundingClientRect();
                      const tooltipRect = tooltipElement.getBoundingClientRect();
                      const spaceBelow = window.innerHeight - rect.bottom;
                      
                      const arrow = tooltipElement.querySelector('div');
                      if (spaceBelow < tooltipRect.height + 10) {
                        tooltipElement.style.bottom = '100%';
                        tooltipElement.style.marginBottom = '8px';
                        tooltipElement.style.marginTop = '0';
                        if (arrow) {
                          arrow.className = 'absolute left-4 bottom-full h-0 w-0 border-4 border-b-gray-900 border-r-transparent border-t-transparent border-l-transparent';
                        }
                      } else {
                        tooltipElement.style.top = '100%';
                        tooltipElement.style.marginTop = '8px';
                        tooltipElement.style.marginBottom = '0';
                        if (arrow) {
                          arrow.className = 'absolute left-4 top-full h-0 w-0 border-4 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent';
                        }
                      }
                    };
                    
                    updatePosition();
                    window.addEventListener('scroll', updatePosition, true);
                    window.addEventListener('resize', updatePosition);
                    
                    const hideTooltip = () => {
                      if (tooltipElement) {
                        tooltipElement.remove();
                        tooltipElement = null;
                        window.removeEventListener('scroll', updatePosition, true);
                        window.removeEventListener('resize', updatePosition);
                      }
                    };
                    
                    wrapper.addEventListener('mouseleave', hideTooltip);
                    wrapper.addEventListener('blur', hideTooltip);
                    
                    trigger.replaceWith(wrapper);
                    setTimeout(updatePosition, 0);
                  };
                  
                  trigger.addEventListener('mouseenter', showTooltip);
                  trigger.addEventListener('focus', showTooltip);
                }
              });
            }
          }}
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

