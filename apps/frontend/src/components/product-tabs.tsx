'use client';

import { useMemo, useState, useEffect, useRef } from 'react';

interface ProductTabItem {
  key: string;
  title: string;
  primary?: string | null;
  secondary?: string | null;
}

interface ProductTabsProps {
  tabs: ProductTabItem[];
}

const htmlRegex = /<\/?[a-z][\s\S]*>/i;

/**
 * Processes HTML content to convert [tooltips] shortcodes into HTML with tooltip support
 */
function processTooltips(content: string): string {
  // Match [tooltips keyword="..." content="..."]
  const tooltipRegex = /\[tooltips\s+keyword=["']([^"']+)["']\s+content=["']([^"']+)["']\]/gi;
  
  return content.replace(tooltipRegex, (match, keyword, tooltipContent) => {
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
}

function renderContent(content?: string | null, variant: 'primary' | 'secondary' = 'primary') {
  if (!content) {
    return null;
  }

  const trimmed = content.trim();
  if (!trimmed.length) {
    return null;
  }

  const isHtml = htmlRegex.test(trimmed);

  if (isHtml) {
    // Process tooltips
    const processed = processTooltips(trimmed);
    
    return (
      <TooltipContent 
        html={processed} 
        variant={variant}
      />
    );
  }

  return (
    <p
      className={`whitespace-pre-line ${
        variant === 'secondary' ? 'text-brand-accent/70' : 'text-brand-accent'
      }`}
    >
      {content}
    </p>
  );
}

/**
 * Component that renders HTML content and adds tooltip functionality
 */
function TooltipContent({ html, variant }: { html: string; variant: 'primary' | 'secondary' }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    // Convert NodeList to Array to avoid issues with DOM mutations
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
          
          const updatePosition = () => {
            if (!tooltipElement) return;
            const rect = wrapper.getBoundingClientRect();
            const tooltipRect = tooltipElement.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const arrow = tooltipElement.querySelector('div:last-child');
            
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
          
          wrapper.addEventListener('mouseleave', hideTooltip);
          wrapper.addEventListener('blur', hideTooltip);
          
          trigger.replaceWith(wrapper);
          setTimeout(updatePosition, 0);
          
          cleanupFunctions.push(() => {
            wrapper.removeEventListener('mouseleave', hideTooltip);
            wrapper.removeEventListener('blur', hideTooltip);
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
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={`rich-content ${variant === 'secondary' ? 'rich-content--secondary' : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function ProductTabs({ tabs }: ProductTabsProps) {
  const availableTabs = useMemo(
    () => tabs.filter((tab) => (tab.primary && tab.primary.trim().length) || (tab.secondary && tab.secondary.trim().length)),
    [tabs],
  );

  const [activeTab, setActiveTab] = useState<string>(availableTabs[0]?.key ?? '');

  if (!availableTabs.length) {
    return null;
  }

  const current = availableTabs.find((tab) => tab.key === activeTab) ?? availableTabs[0];

  return (
    <div className="rounded-3xl border border-border/60 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-border/50 bg-brand-accent/5 p-3">
        {availableTabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 ${
                isActive
                  ? 'bg-brand-primary text-white shadow focus:ring-brand-primary'
                  : 'bg-white text-brand-accent border border-brand-accent/40 hover:bg-brand-primary/10'
              }`}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
      <div className="space-y-4 p-6 text-sm leading-relaxed text-muted-foreground">
        {renderContent(current?.primary, 'primary')}
        {renderContent(current?.secondary, 'secondary')}
      </div>
    </div>
  );
}
