/**
 * Device Detection Utility
 * Detects device type, browser, OS, and screen size
 */

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
  isTouchDevice: boolean;
  userAgent: string;
}

/**
 * Detect device type based on user agent and screen size
 */
export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'desktop',
      browser: 'unknown',
      os: 'unknown',
      screenWidth: 0,
      screenHeight: 0,
      isTouchDevice: false,
      userAgent: '',
    };
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Detect browser
  let browser = 'unknown';
  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'firefox';
  } else if (userAgent.indexOf('Chrome') > -1 && !(userAgent.indexOf('Edg') > -1)) {
    browser = 'chrome';
  } else if (userAgent.indexOf('Safari') > -1 && !(userAgent.indexOf('Chrome') > -1)) {
    browser = 'safari';
  } else if (userAgent.indexOf('Edg') > -1) {
    browser = 'edge';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browser = 'opera';
  } else if (userAgent.indexOf('YaBrowser') > -1) {
    browser = 'yandex';
  }

  // Detect OS
  let os = 'unknown';
  if (userAgent.indexOf('Windows') > -1) {
    os = 'windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'macos';
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'linux';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'android';
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    os = 'ios';
  }

  // Detect device type
  let type: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  
  // Mobile detection
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    // Check screen size for tablets
    if (screenWidth >= 768 && screenWidth < 1024) {
      type = 'tablet';
    } else if (screenWidth < 768) {
      type = 'mobile';
    } else {
      // Large mobile or small tablet
      type = screenWidth >= 600 ? 'tablet' : 'mobile';
    }
  } else {
    // Desktop
    type = 'desktop';
  }

  return {
    type,
    browser,
    os,
    screenWidth,
    screenHeight,
    isTouchDevice,
    userAgent,
  };
}

/**
 * Get device info as string for analytics
 */
export function getDeviceInfoString(): string {
  const device = detectDevice();
  return `${device.type}-${device.os}-${device.browser}`;
}

