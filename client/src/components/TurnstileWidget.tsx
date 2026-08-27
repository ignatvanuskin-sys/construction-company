import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type TurnstileApi = { render: (container: HTMLElement, options: Record<string, unknown>) => string; reset: (widgetId?: string) => void; remove: (widgetId?: string) => void };
declare global { interface Window { turnstile?: TurnstileApi; onTurnstileLoad?: () => void; } }

export default function TurnstileWidget({ onToken, resetKey }: { onToken: (token: string) => void; resetKey?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const sitekey = import.meta.env.VITE_TURNSTILE_SITEKEY ?? "";

  useEffect(() => {
    if (!sitekey || !containerRef.current) return;
    let cancelled = false;
    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetRef.current) return;
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        theme: "light",
        size: "flexible",
        action: "contact",
        callback: (token: string) => { setReady(true); onToken(token); trackEvent("turnstile_success"); },
        "error-callback": () => { setReady(false); onToken(""); trackEvent("turnstile_error"); },
        "expired-callback": () => { setReady(false); onToken(""); trackEvent("turnstile_expired"); },
      });
    };
    renderWidget();
    const poll = window.setInterval(renderWidget, 120);
    const stopPoll = window.setTimeout(() => window.clearInterval(poll), 8_000);
    return () => { cancelled = true; window.clearInterval(poll); window.clearTimeout(stopPoll); if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current); widgetRef.current = undefined; };
  }, [onToken, sitekey]);

  useEffect(() => {
    if (resetKey && widgetRef.current && window.turnstile) { window.turnstile.reset(widgetRef.current); setReady(false); onToken(""); }
  }, [onToken, resetKey]);

  if (!sitekey) return <div className="turnstile-placeholder" role="note">Защита формы активируется после добавления Cloudflare Turnstile</div>;
  return <div ref={containerRef} className={`turnstile-widget${ready ? " is-ready" : ""}`} aria-label="Проверка Cloudflare Turnstile" />;
}
