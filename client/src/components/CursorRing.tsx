import { useEffect, useRef } from "react";

/** NOVA FORMA style: a fine bronze cursor ring behaves like a drafting tool and disappears on touch devices. */
export default function CursorRing() {
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ring = ringRef.current;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ring || !fine || reduced) return;
    let x = -80, y = -80, tx = x, ty = y, raf = 0;
    const move = (event: PointerEvent) => { tx = event.clientX; ty = event.clientY; ring.classList.add("is-visible"); };
    const leave = () => ring.classList.remove("is-visible");
    const down = () => ring.classList.add("is-pressed");
    const up = () => ring.classList.remove("is-pressed");
    const over = (event: Event) => { if ((event.target as HTMLElement)?.closest("a,button,input,select,textarea,[role=button]")) ring.classList.add("is-target"); };
    const out = (event: Event) => { if ((event.target as HTMLElement)?.closest("a,button,input,select,textarea,[role=button]")) ring.classList.remove("is-target"); };
    const animate = () => { x += (tx-x)*.22; y += (ty-y)*.22; ring.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`; raf=requestAnimationFrame(animate); };
    document.addEventListener("pointermove",move,{passive:true}); document.addEventListener("pointerleave",leave); document.addEventListener("pointerdown",down); document.addEventListener("pointerup",up); document.addEventListener("pointerover",over); document.addEventListener("pointerout",out); raf=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(raf);document.removeEventListener("pointermove",move);document.removeEventListener("pointerleave",leave);document.removeEventListener("pointerdown",down);document.removeEventListener("pointerup",up);document.removeEventListener("pointerover",over);document.removeEventListener("pointerout",out);};
  },[]);
  return <div ref={ringRef} className="cursor-ring" aria-hidden="true"><span /></div>;
}
