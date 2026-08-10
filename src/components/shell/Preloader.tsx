"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
const STEPS = ["NOCK", "AIM", "DRAW", "LOOSE"];

/** Bow-draw preloader. Runs once per session (sessionStorage-gated). */
export function Preloader() {
  const [phase, setPhase] = useState<"boot" | "hold" | "done" | "skip">("boot");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("hood_seen") === "1") {
      setPhase("skip");
      return;
    }
    const t1 = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS.length - 1) {
          clearInterval(t1);
          setPhase("hold");
          setTimeout(() => {
            sessionStorage.setItem("hood_seen", "1");
            setPhase("done");
          }, 420);
          return s;
        }
        return s + 1;
      });
    }, 430);
    return () => clearInterval(t1);
  }, []);

  if (phase === "skip") return null;

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
          exit={{ y: "-100%", transition: { duration: 0.9, ease: EASE } }}
        >
          {/* the draw — a line pulled taut */}
          <div className="relative h-24 w-64">
            <svg viewBox="0 0 256 96" className="h-full w-full" fill="none" aria-hidden>
              {/* bow limb */}
              <motion.path
                d="M 24 8 Q 44 48 24 88"
                stroke="#2A241F"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              {/* string, drawn back proportionally to step */}
              <motion.path
                stroke="#9A9188"
                strokeWidth="1"
                initial={false}
                animate={{
                  d: `M 24 8 L ${24 + step * 44} 48 L 24 88`,
                }}
                transition={{ duration: 0.38, ease: EASE }}
              />
              {/* arrow */}
              <motion.g
                initial={false}
                animate={{ x: step * 44 }}
                transition={{ duration: 0.38, ease: EASE }}
              >
                <line x1="24" y1="48" x2="120" y2="48" stroke="#EDE6DA" strokeWidth="1.5" />
                <path d="M 120 48 L 108 42 L 108 54 Z" fill="#FF4A1F" />
              </motion.g>
            </svg>
          </div>

          <div className="mt-8 flex items-center gap-5">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`font-mono text-[11px] uppercase tracking-[0.3em] transition-colors duration-300 ${
                  i <= step ? "text-ember" : "text-faint"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
