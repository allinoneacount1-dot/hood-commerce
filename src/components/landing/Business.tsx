"use client";

import { Reveal, DrawnLine } from "@/components/shell/Reveal";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    line: "The public range.",
    feats: ["$1,500 daily ceiling", "Standard execution lane", "3 armed watchers", "Signed receipts"],
  },
  {
    name: "Pro",
    price: "0.25%",
    line: "The hunting license.",
    feats: ["Raised ceilings & caps", "Low-latency lane", "Unlimited watchers & DCA", "Custom strategy hooks"],
    hot: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    line: "The private reserve.",
    feats: ["Dedicated infrastructure", "Unlimited simulations", "Policy co-design", "Revenue share routing"],
  },
];

export function Business() {
  return (
    <section id="business" className="relative bg-gradient-to-b from-transparent via-bg/70 to-transparent py-32">
      <div className="shell">
        <Reveal>
          <p className="label-eyebrow">07 — The house</p>
          <h2 className="display-hero mt-4 max-w-[16ch] text-[clamp(2.2rem,4.6vw,4rem)] text-parchment">
            The house takes <span className="display-wonk text-ember">0.25%.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-muted">
            A micro-fee on executed volume, accrued to the protocol treasury on every
            settlement — you can watch it tick on the Ledger. No spread games, no
            hidden routing fees. Aligned only with arrows that land.
          </p>
        </Reveal>

        <DrawnLine className="mt-12" />

        <div className="grid grid-cols-1 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} className="md:border-r md:border-hairline md:last:border-r-0">
              <div
                className={`flex h-full flex-col hairline-b p-7 md:min-h-[320px] md:border-b-0 ${
                  t.hot ? "bg-ember/[0.045]" : ""
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-[22px] font-medium text-parchment">{t.name}</h3>
                  {t.hot && <span className="chip-ember">Fee share</span>}
                </div>
                <p className="num mt-4 font-mono text-[30px] text-parchment">{t.price}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  {t.line}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {t.feats.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-[13px] text-muted">
                      <span className={`h-px w-4 ${t.hot ? "bg-ember" : "bg-hairline"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
