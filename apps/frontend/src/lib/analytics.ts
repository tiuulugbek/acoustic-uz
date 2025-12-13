/**
 * Analytics Utility
 * Supports Google Analytics 4 (GA4) and Yandex Metrika
 */

import { detectDevice, getDeviceInfoString } from './device-detection';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (id: number, method: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  yandexMetrikaId?: number;
  enabled?: boolean;
}

let analyticsConfig: AnalyticsConfig = {
  enabled: false,
};

/**
 * Initialize analytics
 */
export function initAnalytics(config: AnalyticsConfig) {
  analyticsConfig = { ...analyticsConfig, ...config };
  
  if (!analyticsConfig.enabled) {
    return;
  }

  // Initialize Google Analytics 4
  if (analyticsConfig.googleAnalyticsId) {
    initGoogleAnalytics(analyticsConfig.googleAnalyticsId);
  }

  // Initialize Yandex Metrika
  if (analyticsConfig.yandexMetrikaId) {
    initYandexMetrika(analyticsConfig.yandexMetrikaId);
  }
}

/**
 * Initialize Google Analytics 4
 */
function initGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return;

  // Create dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer!.push(arguments);
  };

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_path: window.location.pathname,
    send_page_view: true,
  });

  console.log('[Analytics] Google Analytics 4 initialized:', measurementId);
}

/**
 * Initialize Yandex Metrika
 */
function initYandexMetrika(counterId: number) {
  if (typeof window === 'undefined') return;

  // Create ym function
  window.ym = window.ym || function(...args: any[]) {
    (window.ym!.a = window.ym!.a || []).push(args);
  };
  window.ym!.l = Date.now();

  // Load Yandex Metrika script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js`;
  script.onload = () => {
    window.ym!(counterId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
    console.log('[Analytics] Yandex Metrika initialized:', counterId);
  };
  document.head.appendChild(script);

  // Add noscript fallback
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${counterId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
  document.body.appendChild(noscript);
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (!analyticsConfig.enabled) return;

  const deviceInfo = getDeviceInfoString();

  // Google Analytics 4
  if (window.gtag && analyticsConfig.googleAnalyticsId) {
    window.gtag('config', analyticsConfig.googleAnalyticsId, {
      page_path: path,
      page_title: title || document.title,
      custom_map: {
        dimension1: deviceInfo,
      },
    });
  }

  // Yandex Metrika
  if (window.ym && analyticsConfig.yandexMetrikaId) {
    window.ym(analyticsConfig.yandexMetrikaId, 'hit', path, {
      title: title || document.title,
      referer: document.referrer,
    });
  }

  console.log('[Analytics] Page view tracked:', path);
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
) {
  if (!analyticsConfig.enabled) return;

  const deviceInfo = detectDevice();

  // Google Analytics 4
  if (window.gtag && analyticsConfig.googleAnalyticsId) {
    window.gtag('event', eventName, {
      ...eventParams,
      device_type: deviceInfo.type,
      device_os: deviceInfo.os,
      device_browser: deviceInfo.browser,
      screen_width: deviceInfo.screenWidth,
      screen_height: deviceInfo.screenHeight,
    });
  }

  // Yandex Metrika
  if (window.ym && analyticsConfig.yandexMetrikaId) {
    window.ym(analyticsConfig.yandexMetrikaId, 'reachGoal', eventName, {
      ...eventParams,
      device_type: deviceInfo.type,
      device_os: deviceInfo.os,
      device_browser: deviceInfo.browser,
    });
  }

  console.log('[Analytics] Event tracked:', eventName, eventParams);
}

/**
 * Track button click
 */
export function trackButtonClick(buttonName: string, location?: string) {
  trackEvent('button_click', {
    category: 'engagement',
    label: buttonName,
    location: location || window.location.pathname,
  });
}

/**
 * Track form submission
 */
export function trackFormSubmit(formName: string, success: boolean = true) {
  trackEvent('form_submit', {
    category: 'form',
    label: formName,
    value: success ? 1 : 0,
    success,
  });
}

/**
 * Track phone call click
 */
export function trackPhoneClick(phone: string, location?: string) {
  trackEvent('phone_click', {
    category: 'contact',
    label: phone,
    location: location || window.location.pathname,
  });
}

/**
 * Track external link click
 */
export function trackExternalLink(url: string, linkText?: string) {
  trackEvent('external_link_click', {
    category: 'outbound',
    label: linkText || url,
    url,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount?: number) {
  trackEvent('search', {
    category: 'search',
    label: query,
    value: resultsCount,
    search_term: query,
  });
}

/**
 * Track product view
 */
export function trackProductView(productSlug: string, productName: string) {
  trackEvent('view_item', {
    category: 'ecommerce',
    label: productName,
    item_id: productSlug,
    item_name: productName,
  });
}

/**
 * Track branch view
 */
export function trackBranchView(branchSlug: string, branchName: string) {
  trackEvent('view_branch', {
    category: 'location',
    label: branchName,
    branch_slug: branchSlug,
    branch_name: branchName,
  });
}

/**
 * Track geolocation usage
 */
export function trackGeolocationUsed(success: boolean, error?: string) {
  trackEvent('geolocation_used', {
    category: 'location',
    label: success ? 'success' : 'error',
    success,
    error: error || null,
  });
}

