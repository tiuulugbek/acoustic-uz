'use client';

import { useMemo, useRef } from 'react';
import { useTooltipManager } from './tooltip-manager';

interface ProductFeaturesListProps {
  description?: string | null;
  locale: 'uz' | 'ru';
}

interface Feature {
  name: string;
  nameHtml: string; // HTML with tooltip spans
  value: string;
  displayValue: string;
}

/**
 * Processes tooltip shortcodes and converts them to HTML spans
 */
function processTooltips(text: string): string {
  const tooltipRegex = /\[tooltips\s+keyword=["']([^"']+)["']\s+content=["']([^"']+)["']\]/gi;
  
  return text.replace(tooltipRegex, (match, keyword, content) => {
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    return `<span class="tooltip-trigger cursor-help border-b border-dashed border-brand-primary/40 text-brand-primary hover:border-brand-primary" data-tooltip-keyword="${keyword.replace(/"/g, '&quot;')}" data-tooltip-content="${escapedContent}">${keyword}</span>`;
  });
}

/**
 * Extracts and displays product features in a compact list format
 * Similar to sluh.by's feature list with icons (6, 3, +, -, etc.)
 * Format: "6 Направленные микрофоны" or "3 Конфигурации" or "+ Подавление обратной связи"
 */
export default function ProductFeaturesList({ description, locale }: ProductFeaturesListProps) {
  const features = useMemo(() => {
    if (!description) return [];

    // Try to extract features from description HTML tables
    // Look for table rows with feature names and values
    // Match: <tr>...<td>Feature Name</td>...<td>Value</td>...</tr>
    const featureRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;
    const features: Feature[] = [];

    let match;
    while ((match = featureRegex.exec(description)) !== null) {
      const nameHtml = match[1];
      const valueHtml = match[2];

      // Process tooltips first, then clean HTML
      const nameWithTooltips = processTooltips(nameHtml);
      
      // Extract plain text for filtering
      let name = nameHtml
        .replace(/\[tooltips\s+keyword=["']([^"']+)["']\s+content=["'][^"']+["']\]/gi, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      let value = valueHtml
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();

      // Skip if it's a header row, empty, or just numbers
      if (name && value && name.length > 2 && !name.match(/^[\d\s]+$/)) {
        // Format value for display - use first non-empty value if multiple columns (separated by |)
        const displayValue = value.split('|')[0].trim() || value;
        
        // Skip if value is just "—" or empty or if name is too short
        if (displayValue && displayValue !== '—' && displayValue !== '-' && displayValue.length > 0) {
          // Clean up name - remove extra spaces
          name = name.replace(/\s+/g, ' ').trim();
          
          // Clean nameHtml but keep tooltip spans
          const nameHtmlClean = nameWithTooltips
            .replace(/<(?!(span|/span))[^>]+>/g, '') // Remove all tags except span
            .replace(/&nbsp;/g, ' ')
            .trim();
          
          features.push({ 
            name,
            nameHtml: nameHtmlClean,
            value: displayValue,
            displayValue: displayValue.length > 25 ? displayValue.substring(0, 25) + '...' : displayValue
          });
        }
      }
    }

    // Limit to first 6-8 features (like sluh.by shows)
    return features.slice(0, 8);
  }, [description]);

  if (features.length === 0) {
    return null;
  }

  return (
    <FeaturesListWithTooltips features={features} />
  );
}

/**
 * Component that renders features list with tooltip support
 */
function FeaturesListWithTooltips({ features }: { features: Feature[] }) {
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

    return () => {
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
  }, [features]);

  return (
    <div ref={containerRef} className="space-y-2">
      {features.map((feature, index) => {
        // Format display: "6" or "3 Конфигурации" or "+" or "✓"
        // Keep short values as-is, truncate longer ones
        const displayValue = feature.value.length <= 15 
          ? feature.value 
          : feature.value.substring(0, 15) + '...';
        
        return (
          <div key={index} className="flex items-center gap-3 text-base py-1">
            <span className="font-bold text-brand-primary min-w-[3.5rem] text-right text-lg shrink-0">
              {displayValue}
            </span>
            <span 
              className="text-foreground flex-1 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: feature.nameHtml || feature.name }}
            />
          </div>
        );
      })}
    </div>
  );
}

