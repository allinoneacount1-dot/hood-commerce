"use client";

import Link from "next/link";
import { Reveal, DrawnLine } from "@/components/shell/Reveal";
import { AGENT_ROSTER } from "@/lib/engine/types";

export function Roster() {
  return (
    <section id="roster" className="relative bg-gradient-to-b from-transparent via-bg/70 to-transparent py-32">
      <div className="shell">
        <Reveal>
          <p className="label-eyebrow">06 — The roster</p>
          <h2 className="display-hero mt-4 max-w-[16ch] text-[clamp(2.2rem,4.6vw,4rem)] text-parchment">
            Mercenaries, <span className="display-wonk text-ember">for hire.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-muted">
            Specialist agents sell their craft for micro-payments. Each one maps to a
            working desk instrument — hire them from the Command line and the fee
            settles through the same signed pipeline as everything else.
          </p>
        </Reveal>

        <DrawnLine className="mt-12" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {AGENT_ROSTER.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.09} className="lg:border-r lg:border-hairline lg:last:border-r-0">
              <div className="group flex h-full flex-col hairline-b p-6 transition-colors duration-500 hover:bg-elevated/40 lg:min-h-[300px] lg:border-b-0">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-[20px] font-medium text-parchment">{a.name}</h3>
                  <span className="num font-mono text-[12px] text-ember">
                    ${a.priceUsd.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  {a.role}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {a.capabilities.map((c) => (
                    <span key={c} className="chip">{c}</span>
                  ))}
                </div>
                <p className="mt-5 text-[12.5px] leading-relaxed text-muted">{a.powers}</p>
                <div className="mt-auto pt-6">
                  <div className="flex items-center justify-between border-t border-hairline-soft pt-4">
                    <span className="num font-mono text-[10px] text-faint">
                      REP {a.reputation}% · VOL {a.volume}
                    </span>
                    <Link
                      href={`/desk?intent=${encodeURIComponent(`Hire ${a.name} ($${a.priceUsd})`)}`}
                      className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted transition-colors group-hover:text-ember"
                    >
                      Hire →
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
