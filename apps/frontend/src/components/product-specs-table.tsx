'use client';

import { useMemo, useRef } from 'react';
import { useTooltipManager } from './tooltip-manager';

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
 * Handles various formats: [tooltips keyword="..." content="..."] or [tooltips keyword = "..." content = "..."]
 */
function processTooltips(text: string): { 
  text: string; 
  tooltips: Array<{ keyword: string; content: string }> 
} {
  // More flexible regex that handles spaces around = and different quote types
  const tooltipRegex = /\[tooltips\s+keyword\s*=\s*["']([^"']+)["']\s+content\s*=\s*["']([^"']+)["']\]/gi;
  const tooltips: Array<{ keyword: string; content: string }> = [];
  
  const processedText = text.replace(tooltipRegex, (match, keyword, content) => {
    // Trim whitespace from keyword and content
    const trimmedKeyword = keyword.trim();
    const trimmedContent = content.trim();
    
    tooltips.push({ keyword: trimmedKeyword, content: trimmedContent });
    
    // Escape HTML entities in content for data attribute
    const escapedContent = trimmedContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    // Escape keyword for data attribute
    const escapedKeyword = trimmedKeyword.replace(/"/g, '&quot;');
    
    // Return keyword wrapped in a span with data attributes
    return `<span class="tooltip-trigger cursor-help border-b border-dashed border-brand-primary/40 text-brand-primary hover:border-brand-primary" data-tooltip-keyword="${escapedKeyword}" data-tooltip-content="${escapedContent}">${trimmedKeyword}</span>`;
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
          // YOKI agar jadvalda kamida 2 ta qator bo'lsa va label uzunligi 3 dan katta bo'lsa, ko'rsatish
          if (label.length > 2 && value.length > 0 && !isModelName && !isJustNumbers) {
            // Agar jadvalda kam qator bo'lsa yoki barcha qatorlar qisqa bo'lsa, barchasini ko'rsatish
            const shouldInclude = (isBasicSpec || isLongValue) && !isShortValue;
            if (shouldInclude || (label.length > 3 && value.length > 1)) {
              rows.push({
                label,
                value,
                tooltips: rowTooltips,
              });
            }
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
  
  // Use optimized tooltip manager hook
  useTooltipManager(containerRef);

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

