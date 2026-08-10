"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

const BEATS = [
  { word: "Aim.", detail: "An intent is compiled, never guessed." },
  { word: "Draw.", detail: "A simulation is drawn, never skipped." },
  { word: "Loose.", detail: "An arrow flies only inside your perimeter." },
];

const SENTENCE =
  "The agent watches floors, sentiment and gas while you sleep — but the bow is yours: caps, scopes, expiries and a killswitch decide what ever leaves the quiver.".split(
    " ",
  );

function Beat({
  i,
  progress,
  word,
  detail,
}: {
  i: number;
  progress: MotionValue<number>;
  word: string;
  detail: string;
}) {
  const start = 0.08 + i * 0.16;
  const opacity = useTransform(progress, [start, start + 0.09], [0.16, 1]);
  const x = useTransform(progress, [start, start + 0.09], [24, 0]);
  return (
    <motion.div style={{ opacity, x }} className="flex items-baseline gap-6">
      <span className="display-hero text-[clamp(2.6rem,6vw,5.4rem)] text-parchment">{word}</span>
      <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:inline">
        {detail}
      </span>
    </motion.div>
  );
}

function Word({
  i,
  n,
  progress,
  children,
}: {
  i: number;
  n: number;
  progress: MotionValue<number>;
  children: string;
}) {
  const start = 0.56 + (i / n) * 0.34;
  const opacity = useTransform(progress, [start, start + 0.03], [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  );
}

/** Pinned scroll-cinema: the doctrine illuminates as the flock streams past. */
export function Doctrine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section id="doctrine" ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="shell w-full">
          <p className="label-eyebrow mb-10">01 — The doctrine</p>
          <div className="space-y-3">
            {BEATS.map((b, i) => (
              <Beat key={b.word} i={i} progress={scrollYProgress} word={b.word} detail={b.detail} />
            ))}
          </div>
          <p className="mt-14 max-w-3xl font-display text-[clamp(1.15rem,2.2vw,1.7rem)] font-light leading-snug text-muted">
            {SENTENCE.map((w, i) => (
              <Word key={i} i={i} n={SENTENCE.length} progress={scrollYProgress}>
                {w}
              </Word>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
