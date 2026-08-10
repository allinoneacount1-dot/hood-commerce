"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

interface SmoothScrollCtx {
  /** 0 → 1 document scroll progress */
  progressRef: React.MutableRefObject<number>;
  scrollToId: (id: string) => void;
}

const Ctx = createContext<SmoothScrollCtx | null>(null);

export function useSmoothScroll(): SmoothScrollCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSmoothScroll outside provider");
  return v;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const progressRef = useRef(0);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current = max > 0 ? window.scrollY / max : 0;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    const l = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(l);
    l.on("scroll", ({ progress }: { progress: number }) => {
      progressRef.current = progress;
    });
    let raf = 0;
    const frame = (time: number) => {
      l.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      setLenis(null);
    };
  }, []);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: "smooth" });
  };

  return <Ctx.Provider value={{ progressRef, scrollToId }}>{children}</Ctx.Provider>;
}
