'use client';

import { useState, useRef, useEffect } from 'react';
import { useTooltipManager } from './tooltip-manager';
import { processContentShortcodes } from './content-processor';

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

// processTooltips is now handled by processContentShortcodes

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
    // Process all shortcodes (tooltips, tables, images)
    const processed = processContentShortcodes(trimmed);
    
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
 * Uses the optimized tooltip-manager hook for better performance
 */
function TooltipContent({ html, variant }: { html: string; variant: 'primary' | 'secondary' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use the optimized tooltip manager hook
  useTooltipManager(containerRef);

  return (
    <div
      ref={containerRef}
      className={`rich-content ${variant === 'secondary' ? 'rich-content--secondary' : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function ProductTabs({ tabs }: ProductTabsProps) {
  // Use useState and useEffect to prevent hydration mismatch
  const [availableTabs, setAvailableTabs] = useState<ProductTabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const filtered = tabs.filter((tab) => (tab.primary && tab.primary.trim().length) || (tab.secondary && tab.secondary.trim().length));
    setAvailableTabs(filtered);
    
    // Set active tab after filtering to prevent hydration mismatch
    const defaultTab = filtered.find((tab) => tab.key === 'description')?.key ?? filtered[0]?.key ?? tabs[0]?.key ?? '';
    setActiveTab(defaultTab);
  }, [tabs]);

  // If not mounted yet, return empty div to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="rounded-3xl border border-border/60 bg-white shadow-sm" suppressHydrationWarning>
        <div className="p-6 text-center text-sm text-muted-foreground" suppressHydrationWarning>
          <p suppressHydrationWarning>Ma'lumot qo'shilmagan</p>
        </div>
      </div>
    );
  }

  // If no tabs have content, show placeholder message
  if (!availableTabs.length) {
    return (
      <div className="rounded-3xl border border-border/60 bg-white shadow-sm" suppressHydrationWarning>
        <div className="p-6 text-center text-sm text-muted-foreground" suppressHydrationWarning>
          <p suppressHydrationWarning>Ma'lumot qo'shilmagan</p>
        </div>
      </div>
    );
  }

  const current = availableTabs.find((tab) => tab.key === activeTab) ?? availableTabs[0];

  return (
    <div className="rounded-3xl border border-border/60 bg-white shadow-sm" suppressHydrationWarning>
      <div className="flex flex-wrap gap-2 border-b border-border/50 bg-brand-accent/5 p-3" suppressHydrationWarning>
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
        {/* Only show secondary if primary is empty (fallback) */}
        {!current?.primary && renderContent(current?.secondary, 'secondary')}
        {!current?.primary && !current?.secondary && (
          <p className="text-center text-muted-foreground italic">
            Ma'lumot qo'shilmagan
          </p>
        )}
      </div>
    </div>
  );
}
