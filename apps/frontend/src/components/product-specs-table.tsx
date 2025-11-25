'use client';

import { useMemo, useEffect, useRef } from 'react';

interface ProductSpecsTableProps {
  specsText?: string | null;
  locale: 'uz' | 'ru';
}

interface SpecRow {
  label: string;
  value: string;
  tooltips: Array<{ keyword: string; content: string }>;
}

/**
 * Processes tooltip shortcodes and extracts both keyword and content
 */
function processTooltips(text: string): { 
  text: string; 
  tooltips: Array<{ keyword: string; content: string }> 
} {
  const tooltipRegex = /\[tooltips\s+keyword=["']([^"']+)["']\s+content=["']([^"']+)["']\]/gi;
  const tooltips: Array<{ keyword: string; content: string }> = [];
  
  const processedText = text.replace(tooltipRegex, (match, keyword, content) => {
    tooltips.push({ keyword, content });
    // Return keyword wrapped in a span with data attributes
    return `<span class="tooltip-trigger cursor-help border-b border-dashed border-brand-primary/40 text-brand-primary hover:border-brand-primary" data-tooltip-keyword="${keyword.replace(/"/g, '&quot;')}" data-tooltip-content="${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}">${keyword}</span>`;
  });
  
  return { text: processedText, tooltips };
}

/**
 * Extracts and displays product specifications from HTML table format
 * Similar to sluh.by's "Основные характеристики" table
 */
export default function ProductSpecsTable({ specsText, locale }: ProductSpecsTableProps) {
  const specs = useMemo(() => {
    if (!specsText) return null;

    // Try to extract table data from HTML
    // Look for tables that contain "Основные характеристики" or similar structure
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables: Array<{ rows: SpecRow[] }> = [];

    let match;
    let tableIndex = 0;
    while ((match = tableRegex.exec(specsText)) !== null) {
      const tableHtml = match[1];
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const rows: SpecRow[] = [];

      let rowMatch;
      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        const rowHtml = rowMatch[1];
        const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
        const cells: string[] = [];
        const rowTooltips: Array<{ keyword: string; content: string }> = [];

        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
          // Extract HTML content first (before removing tags)
          const cellHtml = cellMatch[1];
          
          // Process tooltips and get both text and tooltip data
          const { text: cellText, tooltips } = processTooltips(cellHtml);
          
          // Clean HTML tags but keep tooltip spans
          const cleanedText = cellText
            .replace(/<(?!(span|/span))[^>]+>/g, '') // Remove all tags except span
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
          
          if (cleanedText) {
            cells.push(cleanedText);
            rowTooltips.push(...tooltips);
          }
        }

        // If we have at least 2 cells (label and value), add to rows
        if (cells.length >= 2) {
          const label = cells[0].trim();
          const value = cells.slice(1).map(v => v.trim()).filter(v => v && v !== '—' && v !== '-').join(' | ');
          
          // Skip rows where:
          // - Label is too short (less than 3 chars)
          // - Value is empty
          // - Label looks like a model name (e.g., "Xceed 1", "Xceed 3") - these are usually headers
          // - Label is just numbers
          const isModelName = /^[A-Z][a-z]+\s+\d+$/.test(label); // Matches "Xceed 1", "Run P", etc.
          const isJustNumbers = /^\d+$/.test(label);
          
          // For "Основные характеристики" table, we want different rows than features list
          // Look for rows that have labels like "Тип модели", "Линейка", "Производитель", etc.
          // These are typically longer, descriptive labels (more than 10 chars)
          // Also exclude rows that are already shown in features list (short values like "6", "3", "+", "✓")
          const isBasicSpec = label.length > 10 && !isModelName && !isJustNumbers;
          // Match short values: "6", "3", "+", "✓", "100%", "9 dB", "Уровень 1", "48 | 48", "✓ | ✓", etc.
          const isShortValue = /^[\d\s%✓+\-—|Уровеньконфигурации]+$/.test(value) || value.length <= 12;
          const isLongValue = value.length > 20; // Long values like "DSE, VAC+, NALNL1 + 2, DSL v5.0"
          
          // Include rows that are either:
          // 1. Basic specs (long labels, not short values) - like "Тип модели", "Линейка"
          // 2. Long values (like formulas, descriptions) - these are different from features list
          // Exclude rows that are already in features list (short values with short labels)
          if (label.length > 2 && value.length > 0 && !isModelName && !isJustNumbers && (isBasicSpec || isLongValue) && !isShortValue) {
            rows.push({
              label,
              value,
              tooltips: rowTooltips,
            });
          }
        }
      }

      if (rows.length > 0) {
        tables.push({ rows });
        tableIndex++;
      }
    }

    // Return the first table that has basic specs (not features)
    // If no such table found, return null to hide the component
    return tables.length > 0 ? tables[0].rows : null;
  }, [specsText]);

  if (!specs || specs.length === 0) {
    return null;
  }

  return (
    <SpecsTableWithTooltips specs={specs} locale={locale} />
  );
}

/**
 * Component that renders specs table with tooltip support
 */
function SpecsTableWithTooltips({ specs, locale }: { specs: SpecRow[]; locale: 'uz' | 'ru' }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const tooltipTriggers = Array.from(container.querySelectorAll('.tooltip-trigger'));
    
    const cleanupFunctions: Array<() => void> = [];
    
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
        
        let tooltipElement: HTMLDivElement | null = null;
        let scrollHandler: (() => void) | null = null;
        let resizeHandler: (() => void) | null = null;
        
        const showTooltip = () => {
          if (tooltipElement) return;
          
          tooltipElement = document.createElement('div');
          tooltipElement.className = 'fixed z-50 max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg transition-opacity';
          tooltipElement.innerHTML = `
            <div class="font-semibold text-white mb-1">${keyword}</div>
            <div class="text-gray-300 leading-relaxed">${decodedContent}</div>
          `;
          
          document.body.appendChild(tooltipElement);
          
          const updatePosition = () => {
            if (!tooltipElement) return;
            const rect = trigger.getBoundingClientRect();
            const tooltipRect = tooltipElement.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const spaceRight = window.innerWidth - rect.left;
            
            let top = rect.bottom + 8;
            let left = rect.left;
            
            // Adjust if not enough space below
            if (spaceBelow < tooltipRect.height + 10) {
              top = rect.top - tooltipRect.height - 8;
            }
            
            // Adjust if goes off right edge
            if (left + tooltipRect.width > window.innerWidth) {
              left = window.innerWidth - tooltipRect.width - 10;
            }
            
            // Adjust if goes off left edge
            if (left < 10) {
              left = 10;
            }
            
            tooltipElement.style.top = `${top}px`;
            tooltipElement.style.left = `${left}px`;
          };
          
          updatePosition();
          scrollHandler = () => updatePosition();
          resizeHandler = () => updatePosition();
          
          window.addEventListener('scroll', scrollHandler, true);
          window.addEventListener('resize', resizeHandler);
          
          const hideTooltip = () => {
            if (tooltipElement) {
              tooltipElement.remove();
              tooltipElement = null;
              if (scrollHandler) {
                window.removeEventListener('scroll', scrollHandler, true);
              }
              if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
              }
            }
          };
          
          trigger.addEventListener('mouseleave', hideTooltip);
          trigger.addEventListener('blur', hideTooltip);
          
          setTimeout(updatePosition, 0);
          
          cleanupFunctions.push(() => {
            trigger.removeEventListener('mouseleave', hideTooltip);
            trigger.removeEventListener('blur', hideTooltip);
            if (scrollHandler) {
              window.removeEventListener('scroll', scrollHandler, true);
            }
            if (resizeHandler) {
              window.removeEventListener('resize', resizeHandler);
            }
            if (tooltipElement) {
              tooltipElement.remove();
            }
          });
        };
        
        trigger.addEventListener('mouseenter', showTooltip);
        trigger.addEventListener('focus', showTooltip);
        
        cleanupFunctions.push(() => {
          trigger.removeEventListener('mouseenter', showTooltip);
          trigger.removeEventListener('focus', showTooltip);
        });
      }
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [specs]);

  return (
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <div className="bg-brand-accent/5 px-6 py-4 border-b border-border/60">
        <h3 className="text-xl font-semibold text-brand-accent">
          {locale === 'ru' ? 'Основные характеристики' : 'Asosiy xususiyatlar'}
        </h3>
      </div>
      <div ref={containerRef} className="divide-y divide-border/60">
        {specs.map((spec, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr] gap-6 px-6 py-3 hover:bg-muted/30 transition-colors">
            <div className="font-medium text-foreground text-sm" dangerouslySetInnerHTML={{ __html: spec.label }} />
            <div className="text-muted-foreground text-sm" dangerouslySetInnerHTML={{ __html: spec.value }} />
          </div>
        ))}
      </div>
    </div>
  );
}

