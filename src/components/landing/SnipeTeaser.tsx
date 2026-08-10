"use client";

import Link from "next/link";
import { Reveal, DrawnLine } from "@/components/shell/Reveal";
import { useFloors } from "@/hooks/use-live";
import { fmtNum, fmtPct, fmtUsd } from "@/lib/format";

const TEASER_IDS = ["pudgy-penguins", "bored-ape-yacht-club", "azuki", "milady-maker"];

export function SnipeTeaser() {
  const { data: floors, isError } = useFloors();

  return (
    <section id="snipe" className="relative bg-gradient-to-b from-transparent via-bg/70 to-transparent py-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="label-eyebrow">03 — The snipe desk</p>
            <h2 className="display-hero mt-4 max-w-[14ch] text-[clamp(2.2rem,4.6vw,4rem)] text-parchment">
              The floor is a <span className="display-wonk text-ember">target.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-muted">
              These are live floors, straight from CoinGecko&apos;s NFT oracle — not a
              screenshot. Arm a watcher on the desk and the agent checks the real
              floor every minute, firing only through the policy gauntlet.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/desk/snipe" className="btn-ghost">
              Arm a watcher
            </Link>
          </Reveal>
        </div>

        <DrawnLine className="mt-12" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {TEASER_IDS.map((id, i) => {
            const f = floors?.[id];
            return (
              <Reveal key={id} delay={i * 0.09} className="lg:border-r lg:border-hairline lg:last:border-r-0">
                <div className="group hairline-b p-6 transition-colors duration-500 hover:bg-elevated/40 lg:min-h-[210px] lg:border-b-0">
                  <div className="flex items-center gap-3">
                    {f?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.image}
                        alt=""
                        width={30}
                        height={30}
                        className="h-[30px] w-[30px] border border-hairline grayscale transition-all duration-500 group-hover:grayscale-0"
                      />
                    ) : (
                      <span className="h-[30px] w-[30px] border border-hairline bg-elevated" />
                    )}
                    <div>
                      <p className="text-[13px] font-medium text-parchment">{f?.name ?? "…"}</p>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint">
                        Live floor · CoinGecko
                      </p>
                    </div>
                  </div>
                  <p className="num mt-6 font-mono text-[26px] text-parchment">
                    {f ? fmtNum(f.floorEth, 2) : "—"}
                    <span className="ml-1.5 text-[12px] text-faint">ETH</span>
                  </p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="num font-mono text-[12px] text-muted">
                      {f ? fmtUsd(f.floorUsd, 0) : "—"}
                    </span>
                    {f?.chg24hUsd != null && (
                      <span
                        className={`num font-mono text-[11px] ${f.chg24hUsd >= 0 ? "text-moss" : "text-clay"}`}
                      >
                        {fmtPct(f.chg24hUsd)} 24h
                      </span>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        {isError && (
          <p className="mt-4 font-mono text-[11px] text-clay">
            Floor oracle unreachable right now — the desk will keep retrying.
          </p>
        )}
      </div>
    </section>
  );
}
