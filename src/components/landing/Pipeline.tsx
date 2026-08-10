"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal, DrawnLine } from "@/components/shell/Reveal";
import { EXAMPLE_INTENTS, parseIntent } from "@/lib/engine/parser";
import type { ParseResult } from "@/lib/engine/types";

const STATIONS = [
  { n: "01", t: "Intent", d: "Plain language in. Voice or text — the agent hears targets, sizes, conditions, guards." },
  { n: "02", t: "Brain", d: "The compiler resolves collections, assets and venues against live oracles." },
  { n: "03", t: "Simulation", d: "The full policy gauntlet runs before anything moves — balances, caps, sentiment." },
  { n: "04", t: "Session key", d: "A scoped secp256k1 key with a 24h fuse signs inside its delegation, nothing more." },
  { n: "05", t: "Settlement", d: "Sandbox custody settles and emits a receipt with a verifiable ECDSA signature." },
];

/** Live compile demo — this is the real parser, running in your tab. */
function CompileDemo() {
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const full = EXAMPLE_INTENTS[idx % EXAMPLE_INTENTS.length];
    let i = 0;
    setTyped("");
    setResult(null);
    const type = () => {
      i += 1 + Math.floor(Math.random() * 2);
      setTyped(full.slice(0, i));
      if (i < full.length) {
        timerRef.current = setTimeout(type, 26);
      } else {
        timerRef.current = setTimeout(() => {
          setResult(parseIntent(full));
          timerRef.current = setTimeout(() => setIdx((x) => x + 1), 6200);
        }, 350);
      }
    };
    timerRef.current = setTimeout(type, 700);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [idx]);

  return (
    <div className="card card-tick p-0">
      <div className="hairline-b flex items-center justify-between px-5 py-3">
        <span className="label-eyebrow">Intent compiler — live in this tab</span>
        <span className="chip-ember">Real parser</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="hairline-b p-5 lg:border-b-0 lg:border-r lg:border-hairline">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">stdin</p>
          <p className="num mt-3 min-h-[72px] font-mono text-[13px] leading-relaxed text-parchment">
            <span className="text-ember">›</span> {typed}
            <span className="ml-0.5 inline-block h-[14px] w-[7px] translate-y-[2px] animate-pulse bg-ember" />
          </p>
          <div className="mt-4 space-y-1.5">
            <AnimatePresence>
              {result?.steps.map((s, i) => (
                <motion.p
                  key={`${idx}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="font-mono text-[11px] text-muted"
                >
                  <span className="text-ember">[{s.station}]</span> {s.detail}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="bg-elevated/40 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            compiled payload
          </p>
          <AnimatePresence mode="wait">
            {result?.payload ? (
              <motion.pre
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="num mt-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-moss"
              >
                {JSON.stringify(result.payload, null, 2)}
              </motion.pre>
            ) : (
              <motion.p
                key={`w-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="mt-3 font-mono text-[11px] text-faint"
              >
                — compiling —
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function Pipeline() {
  return (
    <section id="pipeline" className="relative bg-gradient-to-b from-transparent via-bg/70 to-transparent py-32">
      <div className="shell">
        <Reveal>
          <p className="label-eyebrow">02 — The pipeline</p>
          <h2 className="display-hero mt-4 max-w-[16ch] text-[clamp(2.2rem,4.6vw,4rem)] text-parchment">
            From a sentence to a <span className="display-wonk text-ember">signed</span> settlement.
          </h2>
        </Reveal>

        <DrawnLine className="mt-12" />

        <div className="grid grid-cols-1 md:grid-cols-5">
          {STATIONS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08} className="md:border-r md:border-hairline md:last:border-r-0">
              <div className="hairline-b py-6 pr-5 md:min-h-[190px] md:border-b-0 md:pl-5 md:first:pl-0">
                <p className="num font-mono text-[11px] text-ember">{s.n}</p>
                <h3 className="mt-2 font-display text-[19px] font-medium text-parchment">{s.t}</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-14">
          <CompileDemo />
        </Reveal>
      </div>
    </section>
  );
}
