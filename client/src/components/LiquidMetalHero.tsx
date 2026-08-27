import { useEffect, useRef, useState } from "react";

/** NOVA FORMA style: liquid-metal motion stays a quiet bronze reflection over the hero, never a competing visual. */
export default function LiquidMetalHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const capable = !reduced && !touch && (nav.hardwareConcurrency ?? 8) >= 6 && (nav.deviceMemory ?? 8) >= 4;
    if (!canvas || !capable) return;
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "high-performance" }) || canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "high-performance" });
    if (!gl) return;
    setEnabled(true);
    const context = gl as WebGLRenderingContext;
    const vertexSource = `attribute vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}`;
    const fragmentSource = `precision mediump float; uniform float uTime; uniform vec2 uResolution; uniform vec2 uPointer; void main(){ vec2 uv=gl_FragCoord.xy/uResolution.xy; vec2 p=(uv-.5)*vec2(uResolution.x/uResolution.y,1.0); p.x+=sin(uTime*.18)*.08; float ring=length(p-vec2(uPointer.x-.5,(uPointer.y-.5)*.65)); float wave=sin(ring*20.0-uTime*1.4+sin(p.x*5.0+uTime)*.55); float sheen=smoothstep(.72,.98,wave*.18+.75)*smoothstep(.55,.05,ring); float edge=smoothstep(.82,.2,abs(ring-.31)); vec3 bronze=vec3(.72,.46,.24); vec3 graphite=vec3(.08,.07,.05); float alpha=(sheen*.16+edge*.07)*smoothstep(.9,.25,ring); gl_FragColor=vec4(mix(graphite,bronze,sheen),alpha); }`;
    const compile = (type: number, source: string) => { const shader=context.createShader(type); if(!shader) return null; context.shaderSource(shader,source); context.compileShader(shader); return context.getShaderParameter(shader,context.COMPILE_STATUS) ? shader : null; };
    const vertex=compile(context.VERTEX_SHADER,vertexSource); const fragment=compile(context.FRAGMENT_SHADER,fragmentSource); if(!vertex||!fragment) return;
    const program=context.createProgram(); if(!program) return; context.attachShader(program,vertex); context.attachShader(program,fragment); context.linkProgram(program); if(!context.getProgramParameter(program,context.LINK_STATUS)) return;
    const buffer=context.createBuffer(); context.bindBuffer(context.ARRAY_BUFFER,buffer); context.bufferData(context.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),context.STATIC_DRAW);
    const position=context.getAttribLocation(program,"position"); const time=context.getUniformLocation(program,"uTime"); const resolution=context.getUniformLocation(program,"uResolution"); const pointer=context.getUniformLocation(program,"uPointer");
    const mouse={x:.72,y:.42}; let raf=0; let start=performance.now();
    const resize=()=>{ const dpr=Math.min(window.devicePixelRatio||1,2); canvas.width=canvas.clientWidth*dpr; canvas.height=canvas.clientHeight*dpr; context.viewport(0,0,canvas.width,canvas.height); };
    const move=(event:PointerEvent)=>{ const rect=canvas.getBoundingClientRect(); mouse.x=(event.clientX-rect.left)/rect.width; mouse.y=1-(event.clientY-rect.top)/rect.height; };
    const draw=(now:number)=>{ context.useProgram(program); context.uniform1f(time,(now-start)/1000); context.uniform2f(resolution,canvas.width,canvas.height); context.uniform2f(pointer,mouse.x,mouse.y); context.bindBuffer(context.ARRAY_BUFFER,buffer); context.enableVertexAttribArray(position); context.vertexAttribPointer(position,2,context.FLOAT,false,0,0); context.enable(context.BLEND); context.blendFunc(context.SRC_ALPHA,context.ONE_MINUS_SRC_ALPHA); context.drawArrays(context.TRIANGLE_STRIP,0,4); raf=requestAnimationFrame(draw); };
    resize(); window.addEventListener("resize",resize); window.addEventListener("pointermove",move,{passive:true}); raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);window.removeEventListener("pointermove",move);setEnabled(false);};
  },[]);
  return <canvas ref={canvasRef} className={`liquid-metal-hero ${enabled?"is-active":""}`} aria-hidden="true" />;
}
