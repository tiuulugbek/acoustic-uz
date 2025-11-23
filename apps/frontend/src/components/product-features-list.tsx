'use client';

import { useMemo } from 'react';

interface ProductFeaturesListProps {
  description?: string | null;
  locale: 'uz' | 'ru';
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
    const features: Array<{ name: string; value: string; displayValue: string }> = [];

    let match;
    while ((match = featureRegex.exec(description)) !== null) {
      const nameHtml = match[1];
      const valueHtml = match[2];

      // Extract text from HTML, processing tooltips first
      // Extract keyword from [tooltips keyword="..." content="..."]
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
          
          features.push({ 
            name, 
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
    <div className="space-y-2">
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
            <span className="text-foreground flex-1 leading-relaxed">{feature.name}</span>
          </div>
        );
      })}
    </div>
  );
}

