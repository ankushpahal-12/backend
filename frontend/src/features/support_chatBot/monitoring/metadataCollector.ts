/**
 * metadataCollector.ts
 * Collects browser, device, and network metadata at a point in time.
 */

export interface DeviceMetadata {
  browser: string;
  os: string;
  resolution: string;
  userAgent: string;
  connection: string;
  networkStatus: 'online' | 'offline';
  currentRoute: string;
  timezone: string;
}

const getBrowserName = (ua: string): string => {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua) && !/chromium/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/opr\//i.test(ua)) return 'Opera';
  return 'Unknown Browser';
};

const getOSName = (ua: string): string => {
  if (/windows nt/i.test(ua)) return 'Windows';
  if (/macintosh|mac os x/i.test(ua)) return 'macOS';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad/i.test(ua)) return 'iOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown OS';
};

const getConnectionType = (): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (!conn) return 'Unknown';
  return conn.effectiveType || conn.type || 'Unknown';
};

export const collectMetadata = (): DeviceMetadata => {
  const ua = navigator.userAgent;
  return {
    browser: getBrowserName(ua),
    os: getOSName(ua),
    resolution: `${screen.width} x ${screen.height}`,
    userAgent: ua.slice(0, 500), // cap length
    connection: getConnectionType(),
    networkStatus: navigator.onLine ? 'online' : 'offline',
    currentRoute: window.location.pathname + window.location.search,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};
