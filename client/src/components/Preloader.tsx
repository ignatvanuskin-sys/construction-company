import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type PreloaderProps = { mark: string };

export default function Preloader({ mark }: PreloaderProps) {
  const [leaving, setLeaving] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setLeaving(true), 780);
    const removeTimer = window.setTimeout(() => { setVisible(false); trackEvent("preloader_complete"); }, 1180);
    document.documentElement.classList.add("is-loading");
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  if (!visible) return null;
  return (
    <div className={`preloader${leaving ? " is-leaving" : ""}`} role="presentation" aria-hidden="true">
      <div className="preloader-inner">
        <img src={mark} alt="" className="preloader-mark" />
        <div className="preloader-wordmark">NOVA <i>FORMA</i></div>
        <div className="preloader-rule"><span /></div>
        <div className="preloader-meta"><span>Architecture & Construction</span><span>01 / 07</span></div>
      </div>
    </div>
  );
}
