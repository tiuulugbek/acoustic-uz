'use client';

import { useEffect, useRef } from 'react';

interface TooltipRef {
  tooltipElement: HTMLDivElement | null;
  scrollHandler: (() => void) | null;
  resizeHandler: (() => void) | null;
  hideTimeout: NodeJS.Timeout | null;
}

/**
 * Optimized tooltip manager using event delegation
 * Handles all tooltip interactions efficiently
 */
export function useTooltipManager(containerRef: React.RefObject<HTMLElement>) {
  const tooltipRefsRef = useRef<Map<HTMLElement, TooltipRef>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const tooltipRefs = tooltipRefsRef.current;

    // Cleanup function
    const cleanup = () => {
      tooltipRefs.forEach((ref) => {
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
      });
      tooltipRefs.clear();
    };

    // Handle mouse enter with event delegation
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const trigger = target.closest('.tooltip-trigger') as HTMLElement;

      if (!trigger) return;

      const keyword = trigger.getAttribute('data-tooltip-keyword') || '';
      const tooltipContent = trigger.getAttribute('data-tooltip-content') || '';

      if (!keyword || !tooltipContent) return;

      // Get or create ref for this trigger
      let ref = tooltipRefs.get(trigger);
      if (!ref) {
        ref = {
          tooltipElement: null,
          scrollHandler: null,
          resizeHandler: null,
          hideTimeout: null,
        };
        tooltipRefs.set(trigger, ref);
      }

      // Clear any pending hide timeout
      if (ref.hideTimeout) {
        clearTimeout(ref.hideTimeout);
        ref.hideTimeout = null;
      }

      // If tooltip already exists, just update position
      if (ref.tooltipElement) {
        return;
      }

      // Decode HTML entities
      const decodedContent = tooltipContent
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      // Ensure trigger classes are preserved
      if (trigger.isConnected) {
        trigger.classList.add(
          'tooltip-trigger',
          'cursor-help',
          'border-b',
          'border-dashed',
          'border-brand-primary',
          'text-brand-primary'
        );
      }

      // Create tooltip element
      ref.tooltipElement = document.createElement('div');
      ref.tooltipElement.className =
        'tooltip-popup-element fixed z-50 max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg transition-opacity';
      ref.tooltipElement.style.pointerEvents = 'auto';
      ref.tooltipElement.setAttribute('role', 'tooltip');
      ref.tooltipElement.setAttribute('aria-live', 'polite');
      ref.tooltipElement.innerHTML = `
        <div class="font-semibold text-white mb-1">${keyword}</div>
        <div class="text-gray-300 leading-relaxed">${decodedContent}</div>
      `;

      document.body.appendChild(ref.tooltipElement);

      const updatePosition = () => {
        if (!ref.tooltipElement || !trigger.isConnected) {
          return;
        }

        const rect = trigger.getBoundingClientRect();
        const tooltipRect = ref.tooltipElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const spaceRight = window.innerWidth - rect.left;

        let top = rect.bottom + 8;
        let left = rect.left;

        // Adjust if not enough space below
        if (spaceBelow < tooltipRect.height + 10 && spaceAbove > spaceBelow) {
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
        if (ref.tooltipElement) {
          ref.tooltipElement.remove();
          ref.tooltipElement = null;
        }
        if (ref.scrollHandler) {
          window.removeEventListener('scroll', ref.scrollHandler, true);
          ref.scrollHandler = null;
        }
        if (ref.resizeHandler) {
          window.removeEventListener('resize', ref.resizeHandler);
          ref.resizeHandler = null;
        }
      });
    };

    // Handle mouse leave with event delegation
    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const trigger = target.closest('.tooltip-trigger') as HTMLElement;

      if (!trigger) return;

      const ref = tooltipRefs.get(trigger);
      if (!ref) return;

      // Delay hiding to allow moving mouse to tooltip
      ref.hideTimeout = setTimeout(() => {
        // Check if mouse is still not over trigger or tooltip
        const isOverTrigger = trigger.matches(':hover');
        const isOverTooltip = ref.tooltipElement?.matches(':hover');

        if (!isOverTrigger && !isOverTooltip) {
          if (ref.tooltipElement) {
            ref.tooltipElement.remove();
            ref.tooltipElement = null;
          }
          if (ref.scrollHandler) {
            window.removeEventListener('scroll', ref.scrollHandler, true);
            ref.scrollHandler = null;
          }
          if (ref.resizeHandler) {
            window.removeEventListener('resize', ref.resizeHandler);
            ref.resizeHandler = null;
          }

          // Ensure trigger classes are preserved
          if (trigger.isConnected) {
            trigger.classList.add(
              'tooltip-trigger',
              'cursor-help',
              'border-b',
              'border-dashed',
              'border-brand-primary',
              'text-brand-primary'
            );
          }
        }
      }, 150);
    };

    // Use event delegation on container
    container.addEventListener('mouseenter', handleMouseEnter, true);
    container.addEventListener('mouseleave', handleMouseLeave, true);

    // Ensure all existing triggers have correct classes
    const ensureClasses = () => {
      const triggers = Array.from(container.querySelectorAll('.tooltip-trigger')) as HTMLElement[];
      triggers.forEach((trigger) => {
        trigger.classList.add(
          'tooltip-trigger',
          'cursor-help',
          'border-b',
          'border-dashed',
          'border-brand-primary',
          'text-brand-primary'
        );
      });
    };

    ensureClasses();

    // Use MutationObserver to watch for new tooltip triggers and ensure classes
    const observer = new MutationObserver(() => {
      ensureClasses();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      container.removeEventListener('mouseenter', handleMouseEnter, true);
      container.removeEventListener('mouseleave', handleMouseLeave, true);
      cleanup();
    };
  }, [containerRef]);
}


