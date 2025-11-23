'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  keyword: string;
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ keyword, content, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isOpen || !tooltipRef.current || !triggerRef.current) return;

    const updatePosition = () => {
      if (!tooltipRef.current || !triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If there's not enough space below but more space above, show tooltip above
      if (spaceBelow < tooltipRect.height + 10 && spaceAbove > spaceBelow) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-block cursor-help border-b border-dashed border-brand-primary/40 text-brand-primary hover:border-brand-primary"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      {children}
      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-64 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg transition-opacity ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          role="tooltip"
        >
          <div className="font-semibold text-white mb-1">{keyword}</div>
          <div className="text-gray-300 leading-relaxed">{content}</div>
          {/* Arrow */}
          <div
            className={`absolute left-4 h-0 w-0 border-4 ${
              position === 'top'
                ? 'top-full border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent'
                : 'bottom-full border-b-gray-900 border-r-transparent border-t-transparent border-l-transparent'
            }`}
          />
        </div>
      )}
    </span>
  );
}



