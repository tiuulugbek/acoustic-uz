'use client';

import { useEffect, useRef } from 'react';

interface TooltipRef {
  tooltipElement: HTMLDivElement | null;
  hideTimeout: NodeJS.Timeout | null;
  updatePosition: (() => void) | null;
  trigger: HTMLElement | null;
}

// Global scroll/resize handlers - shared across all tooltips
let globalScrollHandler: (() => void) | null = null;
let globalResizeHandler: (() => void) | null = null;
let activeTooltips: Set<TooltipRef> = new Set();
let scrollTimeout: NodeJS.Timeout | null = null;
let resizeTimeout: NodeJS.Timeout | null = null;

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
        activeTooltips.delete(ref);
      });
      tooltipRefs.clear();
      
      // Remove global handlers if no active tooltips
      if (activeTooltips.size === 0) {
        if (globalScrollHandler) {
          window.removeEventListener('scroll', globalScrollHandler, true);
          globalScrollHandler = null;
        }
        if (globalResizeHandler) {
          window.removeEventListener('resize', globalResizeHandler);
          globalResizeHandler = null;
        }
      }
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
          hideTimeout: null,
          updatePosition: null,
          trigger: trigger,
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

      // Create tooltip element with improved styling
      ref.tooltipElement = document.createElement('div');
      ref.tooltipElement.className =
        'tooltip-popup-element fixed z-[9999] max-w-sm rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl transition-all duration-200 ease-out';
      ref.tooltipElement.style.pointerEvents = 'auto';
      ref.tooltipElement.style.opacity = '0';
      ref.tooltipElement.style.transform = 'translateY(-4px)';
      ref.tooltipElement.setAttribute('role', 'tooltip');
      ref.tooltipElement.setAttribute('aria-live', 'polite');
      ref.tooltipElement.innerHTML = `
        <div class="font-semibold text-white mb-2 text-base border-b border-gray-700 pb-1">${keyword}</div>
        <div class="text-gray-200 leading-relaxed">${decodedContent}</div>
      `;
      
      // Animate in
      requestAnimationFrame(() => {
        if (ref.tooltipElement) {
          ref.tooltipElement.style.opacity = '1';
          ref.tooltipElement.style.transform = 'translateY(0)';
        }
      });

      document.body.appendChild(ref.tooltipElement);

      const updatePosition = () => {
        if (!ref.tooltipElement || !trigger.isConnected) {
          return;
        }

        const rect = trigger.getBoundingClientRect();
        const tooltipRect = ref.tooltipElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

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

      ref.updatePosition = updatePosition;
      activeTooltips.add(ref);

      // Setup global scroll/resize handlers if not already set
      if (!globalScrollHandler) {
        globalScrollHandler = () => {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            activeTooltips.forEach((tooltipRef) => {
              if (tooltipRef.updatePosition) {
                tooltipRef.updatePosition();
              }
            });
          }, 16); // ~60fps
        };
        window.addEventListener('scroll', globalScrollHandler, true);
      }

      if (!globalResizeHandler) {
        globalResizeHandler = () => {
          if (resizeTimeout) clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            activeTooltips.forEach((tooltipRef) => {
              if (tooltipRef.updatePosition) {
                tooltipRef.updatePosition();
              }
            });
          }, 150);
        };
        window.addEventListener('resize', globalResizeHandler);
      }

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
        activeTooltips.delete(ref);
        ref.updatePosition = null;
        
        // Remove global handlers if no active tooltips
        if (activeTooltips.size === 0) {
          if (globalScrollHandler) {
            window.removeEventListener('scroll', globalScrollHandler, true);
            globalScrollHandler = null;
          }
          if (globalResizeHandler) {
            window.removeEventListener('resize', globalResizeHandler);
            globalResizeHandler = null;
          }
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
          activeTooltips.delete(ref);
          ref.updatePosition = null;
          
          // Remove global handlers if no active tooltips
          if (activeTooltips.size === 0) {
            if (globalScrollHandler) {
              window.removeEventListener('scroll', globalScrollHandler, true);
              globalScrollHandler = null;
            }
            if (globalResizeHandler) {
              window.removeEventListener('resize', globalResizeHandler);
              globalResizeHandler = null;
            }
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

    // Use event delegation on container - use bubble phase instead of capture for better performance
    container.addEventListener('mouseenter', handleMouseEnter, false);
    container.addEventListener('mouseleave', handleMouseLeave, false);

    // Ensure all existing triggers have correct classes
    const ensureClasses = () => {
      const triggers = Array.from(container.querySelectorAll('.tooltip-trigger')) as HTMLElement[];
      triggers.forEach((trigger) => {
        if (!trigger.classList.contains('tooltip-trigger')) {
          trigger.classList.add(
            'tooltip-trigger',
            'cursor-help',
            'border-b',
            'border-dashed',
            'border-brand-primary',
            'text-brand-primary'
          );
        }
      });
    };

    ensureClasses();

    // Use MutationObserver with throttling to watch for new tooltip triggers
    let mutationTimeout: NodeJS.Timeout | null = null;
    const observer = new MutationObserver(() => {
      if (mutationTimeout) clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        ensureClasses();
      }, 100); // Throttle mutations
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: false, // Don't watch attributes - too expensive
    });

    return () => {
      observer.disconnect();
      container.removeEventListener('mouseenter', handleMouseEnter, true);
      container.removeEventListener('mouseleave', handleMouseLeave, true);
      cleanup();
    };
  }, [containerRef]);
}


