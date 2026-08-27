type Umami = { track: (event: string, data?: Record<string, string | number | boolean>) => void };

declare global {
  interface Window { umami?: Umami; }
}

export function trackEvent(event: string, data?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try { window.umami?.track(event, data); } catch { /* analytics must never block the site */ }
}
