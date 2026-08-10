"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal, DrawnLine } from "@/components/shell/Reveal";
import { forgeSessionKey } from "@/lib/engine/keys";
import type { SessionKeyState } from "@/lib/engine/types";
import { shortHex } from "@/lib/format";

const RAILS = [
  { k: "Daily ceiling", v: "$1,500", d: "Aggregate spend resets at midnight UTC. Above it, everything holds." },
  { k: "Per-shot cap", v: "$400", d: "Any single execution above the cap stops at full draw for human sign-off." },
  { k: "Sentiment floor", v: "F&G ≥ 12", d: "When the live Fear & Greed index reads panic, the agent refuses to fire." },
  { k: "Scoped delegation", v: "4 scopes", d: "NFT_BUY · DEX_SWAP · YIELD_MOVE · AGENT_PAY — the key signs nothing else." },
  { k: "Key expiry", v: "24 hours", d: "Session keys burn out daily. A stale key is a dead key." },
  { k: "Killswitch", v: "One toggle", d: "Every watcher, schedule and intent halts instantly. No questions." },
];

export function Guardrails() {
  // A real key, forged fresh for this pageview — display only, never stored.
  // Forged after mount so server HTML and client HTML agree.
  const [demoKey, setDemoKey] = useState<SessionKeyState | null>(null);
  useEffect(() => setDemoKey(forgeSessionKey()), []);

  return (
    <section id="guardrails" className="relative bg-gradient-to-b from-transparent via-bg/70 to-transparent py-32">
      <div className="shell">
        <Reveal>
          <p className="label-eyebrow">04 — The guardrails</p>
          <h2 className="display-hero mt-4 max-w-[15ch] text-[clamp(2.2rem,4.6vw,4rem)] text-parchment">
            The perimeter <span className="display-wonk text-ember">holds.</span>
          </h2>
        </Reveal>

        <DrawnLine className="mt-12" />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {RAILS.map((r, i) => (
                <Reveal key={r.k} delay={i * 0.06}>
                  <div className="hairline-b p-6 sm:odd:border-r sm:odd:border-hairline">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-[17px] font-medium text-parchment">{r.k}</h3>
                      <span className="num font-mono text-[12px] text-ember">{r.v}</span>
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{r.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.2}>
              <div className="card card-tick p-6">
                <div className="flex items-center justify-between">
                  <p className="label-eyebrow">Session key anatomy</p>
                  <span className="chip-ember">Forged for this pageview</span>
                </div>
                <p className="num mt-5 break-all font-mono text-[13px] text-parchment">
                  {demoKey?.address ?? "0x — forging in your browser…"}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  Real secp256k1 · generated in your browser just now
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    ["Curve", "secp256k1 (ECDSA)"],
                    ["Custody", "Sandbox — holds nothing, signs receipts"],
                    ["TTL", "24h, then it burns"],
                    ["Scope", demoKey?.scopes.join(" · ") ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 border-b border-hairline-soft pb-2.5 last:border-b-0">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{k}</span>
                      <span className="text-right font-mono text-[11px] text-muted">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-[12px] leading-relaxed text-muted">
                  On the desk, the twin of this key signs every settlement receipt —
                  a signature you can verify against{" "}
                  <span className="font-mono text-[11px] text-parchment">
                    {demoKey ? shortHex(demoKey.address, 4) : "0x…"}
                  </span>{" "}
                  with one click.
                </p>
                <Link href="/desk/quiver" className="btn-ghost mt-6 w-full">
                  Visit the quiver
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
