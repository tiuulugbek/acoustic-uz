'use client';

import { useMemo, useState } from 'react';

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
    return (
      <div
        className={`rich-content ${variant === 'secondary' ? 'rich-content--secondary' : ''}`}
        dangerouslySetInnerHTML={{ __html: trimmed }}
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
