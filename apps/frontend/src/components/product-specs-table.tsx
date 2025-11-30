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
        
        const keyword = trigger.getAttribute('data-tooltip-keyword') || '';
        const tooltipContent = trigger.getAttribute('data-tooltip-content') || '';
        
        if (!keyword || !tooltipContent) return;
        
        // Ensure trigger has correct classes
        if (!trigger.classList.contains('tooltip-trigger')) {
          trigger.classList.add('tooltip-trigger');
        }
        if (!trigger.classList.contains('cursor-help')) {
          trigger.classList.add('cursor-help');
        }
        if (!trigger.classList.contains('border-b')) {
          trigger.classList.add('border-b');
        }
        if (!trigger.classList.contains('border-dashed')) {
          trigger.classList.add('border-dashed');
        }
        if (!trigger.classList.contains('border-brand-primary')) {
          trigger.classList.add('border-brand-primary');
        }
        if (!trigger.classList.contains('text-brand-primary')) {
          trigger.classList.add('text-brand-primary');
        }
        
        // Decode HTML entities
        const decodedContent = tooltipContent
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        
        // Initialize ref for this trigger
        const ref = {
          tooltipElement: null as HTMLDivElement | null,
          scrollHandler: null as (() => void) | null,
          resizeHandler: null as (() => void) | null,
          hideTimeout: null as NodeJS.Timeout | null,
          mouseEnterHandler: null as (() => void) | null,
          mouseLeaveHandler: null as (() => void) | null,
          focusHandler: null as (() => void) | null,
          blurHandler: null as (() => void) | null,
        };
        tooltipRefs.set(trigger, ref);
        
        const updatePosition = () => {
          if (!ref.tooltipElement || !trigger.isConnected) {
            return;
          }
          
          const rect = trigger.getBoundingClientRect();
          const tooltipRect = ref.tooltipElement.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          
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
          
          ref.tooltipElement.style.top = `${top}px`;
          ref.tooltipElement.style.left = `${left}px`;
        };
        
        const hideTooltip = () => {
          if (ref.hideTimeout) {
            clearTimeout(ref.hideTimeout);
            ref.hideTimeout = null;
          }
          
          if (ref.tooltipElement) {
            ref.tooltipElement.remove();
            ref.tooltipElement = null;
            
            if (ref.scrollHandler) {
              window.removeEventListener('scroll', ref.scrollHandler, true);
              ref.scrollHandler = null;
            }
            
            if (ref.resizeHandler) {
              window.removeEventListener('resize', ref.resizeHandler);
              ref.resizeHandler = null;
            }
          }
          
          // Ensure trigger classes are preserved
          if (trigger.isConnected) {
            if (!trigger.classList.contains('tooltip-trigger')) {
              trigger.classList.add('tooltip-trigger');
            }
            if (!trigger.classList.contains('cursor-help')) {
              trigger.classList.add('cursor-help');
            }
            if (!trigger.classList.contains('border-b')) {
              trigger.classList.add('border-b');
            }
            if (!trigger.classList.contains('border-dashed')) {
              trigger.classList.add('border-dashed');
            }
            if (!trigger.classList.contains('border-brand-primary')) {
              trigger.classList.add('border-brand-primary');
            }
            if (!trigger.classList.contains('text-brand-primary')) {
              trigger.classList.add('text-brand-primary');
            }
          }
        };
        
        const showTooltip = () => {
          // Clear any pending hide timeout
          if (ref.hideTimeout) {
            clearTimeout(ref.hideTimeout);
            ref.hideTimeout = null;
          }
          
          // Ensure trigger classes are preserved
          if (trigger.isConnected) {
            if (!trigger.classList.contains('tooltip-trigger')) {
              trigger.classList.add('tooltip-trigger');
            }
            if (!trigger.classList.contains('cursor-help')) {
              trigger.classList.add('cursor-help');
            }
            if (!trigger.classList.contains('border-b')) {
              trigger.classList.add('border-b');
            }
            if (!trigger.classList.contains('border-dashed')) {
              trigger.classList.add('border-dashed');
            }
            if (!trigger.classList.contains('border-brand-primary')) {
              trigger.classList.add('border-brand-primary');
            }
            if (!trigger.classList.contains('text-brand-primary')) {
              trigger.classList.add('text-brand-primary');
            }
          }
          
          // If tooltip already exists, just update position
          if (ref.tooltipElement) {
            updatePosition();
            return;
          }
          
          // Create tooltip element
          ref.tooltipElement = document.createElement('div');
          ref.tooltipElement.className = 'tooltip-popup-element fixed z-50 max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg transition-opacity';
          ref.tooltipElement.style.pointerEvents = 'auto';
          ref.tooltipElement.innerHTML = `
            <div class="font-semibold text-white mb-1">${keyword}</div>
            <div class="text-gray-300 leading-relaxed">${decodedContent}</div>
          `;
          
          document.body.appendChild(ref.tooltipElement);
          
          // Setup position updaters
          ref.scrollHandler = () => updatePosition();
          ref.resizeHandler = () => updatePosition();
          
          window.addEventListener('scroll', ref.scrollHandler, true);
          window.addEventListener('resize', ref.resizeHandler);
          
          // Initial position
          updatePosition();
          
          // Setup tooltip mouse events
          ref.tooltipElement.addEventListener('mouseenter', () => {
            if (ref.hideTimeout) {
              clearTimeout(ref.hideTimeout);
              ref.hideTimeout = null;
            }
          });
          
          ref.tooltipElement.addEventListener('mouseleave', () => {
            hideTooltip();
          });
        };
        
        const handleMouseLeave = () => {
          // Delay hiding to allow moving mouse to tooltip
          ref.hideTimeout = setTimeout(() => {
            // Check if mouse is still not over trigger or tooltip
            const isOverTrigger = trigger.matches(':hover');
            const isOverTooltip = ref.tooltipElement?.matches(':hover');
            
            if (!isOverTrigger && !isOverTooltip) {
              hideTooltip();
            }
          }, 150);
        };
        
        // Setup trigger events
        ref.mouseEnterHandler = showTooltip;
        ref.mouseLeaveHandler = handleMouseLeave;
        ref.focusHandler = showTooltip;
        ref.blurHandler = hideTooltip;
        
        trigger.addEventListener('mouseenter', ref.mouseEnterHandler);
        trigger.addEventListener('mouseleave', ref.mouseLeaveHandler);
        trigger.addEventListener('focus', ref.focusHandler);
        trigger.addEventListener('blur', ref.blurHandler);
      });
    };
    
    // Initial initialization
    initializeTooltips();
    
    // Use MutationObserver to watch for new tooltip triggers (debounced)
    const observer = new MutationObserver(() => {
      // Debounce to avoid too many re-initializations
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(() => {
        initializeTooltips();
      }, 100);
    });
    
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-tooltip-keyword', 'data-tooltip-content'],
    });

    return () => {
      observer.disconnect();
      
      // Clear debounce timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      // Cleanup all tooltips and event listeners
      tooltipRefs.forEach((ref, trigger) => {
        if (ref.hideTimeout) {
          clearTimeout(ref.hideTimeout);
        }
        if (ref.tooltipElement) {
          ref.tooltipElement.remove();
        }
        if (ref.scrollHandler) {
          window.removeEventListener('scroll', ref.scrollHandler, true);
        }
        if (ref.resizeHandler) {
          window.removeEventListener('resize', ref.resizeHandler);
        }
        if (ref.mouseEnterHandler && trigger.isConnected) {
          trigger.removeEventListener('mouseenter', ref.mouseEnterHandler);
        }
        if (ref.mouseLeaveHandler && trigger.isConnected) {
          trigger.removeEventListener('mouseleave', ref.mouseLeaveHandler);
        }
        if (ref.focusHandler && trigger.isConnected) {
          trigger.removeEventListener('focus', ref.focusHandler);
        }
        if (ref.blurHandler && trigger.isConnected) {
          trigger.removeEventListener('blur', ref.blurHandler);
        }
      });
      
      tooltipRefs.clear();
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

