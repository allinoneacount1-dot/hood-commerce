"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LineReveal } from "@/components/shell/Reveal";
import { LiveTape } from "./LiveTape";
import { useSmoothScroll } from "@/components/shell/SmoothScroll";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const { scrollToId } = useSmoothScroll();
  return (
    <section className="relative flex min-h-screen flex-col justify-end pb-0 pt-28">
      <div className="shell relative">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="label-eyebrow-ember mb-6"
        >
          Autonomous agent commerce · Robinhood Chain · ERC-4337
        </motion.p>

        <h1 className="display-hero max-w-[13ch] text-[clamp(3.4rem,9.2vw,8.6rem)] text-parchment">
          <LineReveal delay={0.55}>Commerce</LineReveal>
          <LineReveal delay={0.68}>
            that <span className="display-wonk text-ember">hunts.</span>
          </LineReveal>
        </h1>

        <div className="mt-10 flex max-w-xl flex-col gap-8 lg:mt-12">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.95 }}
            className="text-[15.5px] leading-relaxed text-muted"
          >
            Hood Commerce turns plain language into policy-bound onchain execution.
            You aim an intent, the agent draws the simulation — and nothing is
            loosed outside the guardrails you set. Live floors, live quotes,
            live sentiment; every settlement signed by a real session key.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.1 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link href="/desk" className="btn-ember">
              Open the desk
            </Link>
            <button onClick={() => scrollToId("doctrine")} className="btn-ghost">
              Read the doctrine
            </button>
          </motion.div>
        </div>

        {/* corner telemetry */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.4 }}
          className="pointer-events-none absolute bottom-2 right-0 hidden text-right lg:block"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
            Aim → Draw → Loose
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
            No mock data on this page
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="mt-16"
      >
        <LiveTape />
      </motion.div>
    </section>
  );
}
