'use client';

import { useMemo } from 'react';

interface ProductSpecsTableProps {
  specsText?: string | null;
  locale: 'uz' | 'ru';
}

/**
 * Processes tooltip shortcodes to extract just the keyword
 */
function processTooltipShortcode(text: string): string {
  // Match [tooltips keyword="..." content="..."]
  const tooltipRegex = /\[tooltips\s+keyword=["']([^"']+)["']\s+content=["']([^"']+)["']\]/gi;
  
  return text.replace(tooltipRegex, (match, keyword) => {
    // Return just the keyword, not the whole shortcode
    return keyword;
  });
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
    const tables: Array<{ rows: Array<{ label: string; value: string }> }> = [];

    let match;
    let tableIndex = 0;
    while ((match = tableRegex.exec(specsText)) !== null) {
      const tableHtml = match[1];
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const rows: Array<{ label: string; value: string }> = [];

      let rowMatch;
      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        const rowHtml = rowMatch[1];
        const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
        const cells: string[] = [];

        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
          // Extract text from HTML, processing tooltips
          let cellText = cellMatch[1]
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
          
          // Process tooltip shortcodes - extract just the keyword
          cellText = processTooltipShortcode(cellText);
          
          if (cellText) {
            cells.push(cellText);
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
    <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
      <div className="bg-brand-accent/5 px-6 py-4 border-b border-border/60">
        <h3 className="text-xl font-semibold text-brand-accent">
          {locale === 'ru' ? 'Основные характеристики' : 'Asosiy xususiyatlar'}
        </h3>
      </div>
      <div className="divide-y divide-border/60">
        {specs.map((spec, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr] gap-6 px-6 py-3 hover:bg-muted/30 transition-colors">
            <div className="font-medium text-foreground text-sm">{spec.label}</div>
            <div className="text-muted-foreground text-sm">{spec.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

