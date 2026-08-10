"use client";

import { useEffect, useRef } from "react";

/** Ember cursor — a small dot with a trailing ring. Desktop pointer only. */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let hot = false;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement | null;
      hot = !!t?.closest("a, button, [role='button'], input, select, textarea, label");
    };
    const frame = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      dot.style.transform = `translate(${x - 2.5}px, ${y - 2.5}px)`;
      const s = hot ? 1.9 : 1;
      ring.style.transform = `translate(${rx - 14}px, ${ry - 14}px) scale(${s})`;
      ring.style.borderColor = hot ? "rgba(255,74,31,0.9)" : "rgba(255,74,31,0.4)";
      raf = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    dot.style.opacity = "1";
    ring.style.opacity = "1";
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[95] h-[5px] w-[5px] rounded-full bg-ember opacity-0"
      />
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[95] h-7 w-7 rounded-full border border-ember/40 opacity-0 transition-[border-color] duration-200"
      />
    </>
  );
}
