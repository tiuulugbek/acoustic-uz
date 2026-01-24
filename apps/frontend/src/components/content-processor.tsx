'use client';

import { useRef } from 'react';
import { useTooltipManager } from './tooltip-manager';

/**
 * Processes HTML content to add support for:
 * - Tooltips: [tooltip keyword="..." content="..."]
 * - Table positions: [table position="left|center|right|full"]...[/table]
 * - Image layouts: [images layout="grid-2|grid-3|left-right|right-left"]...[/images]
 */
export function processContentShortcodes(content: string): string {
  let processed = content;

  // Process tooltips: [tooltip keyword="..." content="..."] or [tooltips keyword="..." content="..."]
  // Support both single and double quotes, and handle content with quotes inside
  // Use a more flexible approach: match everything between the opening and closing brackets
  // Then parse the attributes manually
  const tooltipRegex = /\[tooltips?\s+([^\]]+)\]/gi;
  processed = processed.replace(tooltipRegex, (match, attributes) => {
    // Parse attributes: keyword="..." content="..."
    const keywordMatch = attributes.match(/keyword\s*=\s*["']([^"']+)["']/i);
    const contentMatch = attributes.match(/content\s*=\s*["']((?:[^"']|\\["'])*)["']/i);
    
    if (!keywordMatch || !contentMatch) {
      // If parsing fails, return the original match
      return match;
    }
    
    const keyword = keywordMatch[1];
    let tooltipContent = contentMatch[1];
    
    // Handle escaped quotes in content
    const unescapedContent = tooltipContent
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");
    
    const escapedContent = unescapedContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    const escapedKeyword = keyword
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    return `<span data-tooltip-keyword="${escapedKeyword}" data-tooltip-content="${escapedContent}">${keyword}</span>`;
  });

  // Process table positions: [table position="left|center|right|full"]...[/table]
  const tableRegex = /\[table\s+position\s*=\s*["'](left|center|right|full)["']\]([\s\S]*?)\[\/table\]/gi;
  processed = processed.replace(tableRegex, (match, position, tableContent) => {
    const positionClasses = {
      left: 'mx-0 mr-auto',
      center: 'mx-auto',
      right: 'mx-0 ml-auto',
      full: 'w-full',
    };
    const className = positionClasses[position as keyof typeof positionClasses] || 'mx-auto';
    return `<div class="table-wrapper ${className} overflow-x-auto my-6">${tableContent}</div>`;
  });

  // Process image layouts: [images layout="grid-2|grid-3|left-right|right-left"]...[/images]
  const imagesRegex = /\[images\s+layout\s*=\s*["'](grid-2|grid-3|left-right|right-left)["']\]([\s\S]*?)\[\/images\]/gi;
  processed = processed.replace(imagesRegex, (match, layout, imagesContent) => {
    // Extract img tags from content
    const imgMatches = imagesContent.match(/<img[^>]*>/gi) || [];
    
    if (imgMatches.length === 0) return imagesContent;

    let wrapperClass = '';
    let imageClasses = '';

    switch (layout) {
      case 'grid-2':
        wrapperClass = 'grid grid-cols-1 md:grid-cols-2 gap-4 my-6';
        imageClasses = 'w-full rounded-lg shadow-md';
        break;
      case 'grid-3':
        wrapperClass = 'grid grid-cols-1 md:grid-cols-3 gap-4 my-6';
        imageClasses = 'w-full rounded-lg shadow-md';
        break;
      case 'left-right':
        wrapperClass = 'flex flex-col md:flex-row gap-4 my-6';
        imageClasses = 'flex-1 rounded-lg shadow-md';
        break;
      case 'right-left':
        wrapperClass = 'flex flex-col md:flex-row-reverse gap-4 my-6';
        imageClasses = 'flex-1 rounded-lg shadow-md';
        break;
      default:
        wrapperClass = 'grid grid-cols-1 md:grid-cols-2 gap-4 my-6';
        imageClasses = 'w-full rounded-lg shadow-md';
    }

    const processedImages = imgMatches.map((imgTag) => {
      // Add classes to img tag
      if (imgTag.includes('class=')) {
        return imgTag.replace(/class=["']([^"']*)["']/i, `class="$1 ${imageClasses}"`);
      }
      return imgTag.replace(/<img/i, `<img class="${imageClasses}"`);
    }).join('');

    return `<div class="${wrapperClass}">${processedImages}</div>`;
  });

  return processed;
}

/**
 * Component that renders processed HTML content with tooltip support
 */
export function ProcessedContent({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use the optimized tooltip manager hook
  useTooltipManager(containerRef);

  return (
    <div
      ref={containerRef}
      className="rich-content prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

