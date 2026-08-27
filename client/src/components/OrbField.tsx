import { useEffect, useRef } from "react";

/** NOVA FORMA style: an understated bronze orb field suggests a living process while staying behind content. */
export default function OrbField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0, height = 0, raf = 0, t = 0;
    const pointer = { x: 0.5, y: 0.5 };
    const resize = () => { width = canvas.clientWidth; height = canvas.clientHeight; canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr,0,0,dpr,0,0); };
    const move = (event: PointerEvent) => { const rect = canvas.getBoundingClientRect(); pointer.x = (event.clientX - rect.left) / rect.width; pointer.y = (event.clientY - rect.top) / rect.height; };
    const draw = () => {
      t += 0.006; ctx.clearRect(0,0,width,height);
      const count = width < 600 ? 3 : 6;
      for (let i=0;i<count;i++) {
        const x = width * (0.17 + i * 0.15) + Math.sin(t * (1 + i*.08) + i) * 28 + (pointer.x-.5)*24;
        const y = height * (0.28 + (i%3)*.24) + Math.cos(t*.9+i) * 32 + (pointer.y-.5)*20;
        const r = 28 + (i%2)*17;
        const g = ctx.createRadialGradient(x-r*.25,y-r*.25,2,x,y,r);
        g.addColorStop(0,"rgba(218,184,142,.36)"); g.addColorStop(.34,"rgba(184,139,90,.15)"); g.addColorStop(1,"rgba(184,139,90,0)");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); draw(); window.addEventListener("resize",resize); canvas.addEventListener("pointermove",move);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); canvas.removeEventListener("pointermove",move); };
  }, []);
  return <canvas ref={ref} className="orb-field" aria-hidden="true" />;
}
