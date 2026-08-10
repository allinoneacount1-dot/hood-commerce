"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/components/shell/SmoothScroll";
import { Murmuration } from "./Murmuration";

function useSceneAllowed(): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (window.innerWidth < 768) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") ?? c.getContext("webgl");
      if (!gl) return;
    } catch {
      return;
    }
    // Wait for the preloader to finish before paying the WebGL boot cost,
    // so the bow-draw sequence never stutters.
    if (sessionStorage.getItem("hood_seen") === "1") {
      setAllowed(true);
      return;
    }
    const poll = setInterval(() => {
      if (sessionStorage.getItem("hood_seen") === "1") {
        clearInterval(poll);
        setAllowed(true);
      }
    }, 250);
    return () => clearInterval(poll);
  }, []);
  return allowed;
}

/** Full-page fixed canvas behind the landing content (z-1 vs content z-2). */
export default function LandingScene() {
  const allowed = useSceneAllowed();
  const { progressRef } = useSmoothScroll();

  if (!allowed) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ scene }) => {
          scene.fog = null;
        }}
      >
        <fog attach="fog" args={["#0B0908", 11, 30]} />
        <Murmuration progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
