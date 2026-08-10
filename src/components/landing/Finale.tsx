"use client";

import Link from "next/link";
import { Reveal, LineReveal } from "@/components/shell/Reveal";
import { ArrowMark } from "@/components/brand/ArrowMark";

export function Finale() {
  return (
    <section className="relative flex min-h-[92vh] flex-col justify-center py-32">
      <div className="shell relative text-center">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[130%] -translate-y-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(11,9,8,0.72),transparent_70%)]" />
        <div className="relative">
        <Reveal>
          <p className="label-eyebrow-ember">08 — Nock. Aim. Draw.</p>
        </Reveal>
        <h2 className="display-hero mx-auto mt-6 max-w-[13ch] text-[clamp(2.8rem,7vw,6.4rem)] text-parchment">
          <LineReveal delay={0.1}>Loose the</LineReveal>
          <LineReveal delay={0.22}>
            first <span className="display-wonk text-ember">arrow.</span>
          </LineReveal>
        </h2>
        <Reveal delay={0.35}>
          <p className="mx-auto mt-8 max-w-md text-[14px] leading-relaxed text-muted">
            The desk is a full sandbox — simulated custody, live everything else.
            No wallet, no sign-up, no risk. Your first intent is thirty seconds away.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/desk" className="btn-ember h-12 px-8 text-[13px]">
              Open the desk
            </Link>
            <Link href="/desk/scanner" className="btn-ghost h-12 px-8 text-[13px]">
              Scan a contract
            </Link>
          </div>
        </Reveal>
        </div>
      </div>

      <footer className="absolute inset-x-0 bottom-0">
        <div className="hairline-t">
          <div className="shell flex flex-col items-center justify-between gap-4 py-7 sm:flex-row">
            <span className="flex items-center gap-2.5">
              <ArrowMark className="h-5 w-5 text-ember" />
              <span className="font-display text-[14px] font-medium text-parchment">Hood Commerce</span>
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-faint">
              Robinhood Chain Testnet (7070) · Sandbox custody · Real data & signatures
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-faint">
              CoinGecko · GoPlus · Jupiter · PublicNode
            </span>
          </div>
        </div>
      </footer>
    </section>
  );
}
