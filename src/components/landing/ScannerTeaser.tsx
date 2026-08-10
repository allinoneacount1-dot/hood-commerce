"use client";

import Link from "next/link";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Reveal, DrawnLine } from "@/components/shell/Reveal";
import { scanToken, SCAN_PRESETS } from "@/lib/api/goplus";
import { shortHex } from "@/lib/format";

const GRADE_COLOR: Record<string, string> = {
  A: "#8FA98B",
  B: "#8FA98B",
  C: "#C89B5A",
  D: "#B0685A",
  F: "#FF4A1F",
};

export function GradeDial({ grade, score, size = 148 }: { grade: string; score: number; size?: number }) {
  const r = 62;
  const c = 2 * Math.PI * r;
  const color = GRADE_COLOR[grade] ?? "#9A9188";
  return (
    <svg width={size} height={size} viewBox="0 0 148 148" className="shrink-0">
      <circle cx="74" cy="74" r={r} fill="none" stroke="#2A241F" strokeWidth="3" />
      <circle
        cx="74"
        cy="74"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${(score / 100) * c} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 74 74)"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)" }}
      />
      <text
        x="74"
        y="70"
        textAnchor="middle"
        fill={color}
        style={{ font: "600 44px 'Fraunces Variable', serif" }}
      >
        {grade}
      </text>
      <text
        x="74"
        y="96"
        textAnchor="middle"
        fill="#9A9188"
        style={{ font: "11px 'Martian Mono Variable', monospace" }}
      >
        {score}/100
      </text>
    </svg>
  );
}

export function ScannerTeaser() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "10% 0px" });
  const preset = SCAN_PRESETS[0]; // PEPE on Ethereum

  const { data, isFetching, isError } = useQuery({
    queryKey: ["teaser-scan", preset.address],
    queryFn: () => scanToken(preset.chainId, preset.address),
    enabled: inView,
    staleTime: Infinity,
    retry: 1,
  });

  return (
    <section id="scanner" ref={ref} className="relative bg-gradient-to-b from-transparent via-bg/70 to-transparent py-32">
      <div className="shell">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="label-eyebrow">05 — The scanner</p>
              <h2 className="display-hero mt-4 max-w-[13ch] text-[clamp(2.2rem,4.6vw,4rem)] text-parchment">
                Trust is <span className="display-wonk text-ember">scanned,</span> not assumed.
              </h2>
              <p className="mt-5 max-w-md text-[14px] leading-relaxed text-muted">
                Before any ERC-20 touches a route, the agent sweeps the contract
                through GoPlus security intelligence — honeypot traps, hidden
                owners, tax ambushes, mint authority. What you see here is a
                live sweep that ran when this section entered your viewport.
              </p>
              <Link href="/desk/scanner" className="btn-ghost mt-8">
                Scan any contract
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.15}>
              <div className="card card-tick p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="label-eyebrow">
                    {data ? `${data.tokenName} (${data.tokenSymbol})` : `Sweeping ${preset.label}…`}
                  </p>
                  <span className="chip-ember">
                    {isFetching ? "GoPlus · sweeping" : data ? `${data.source} · live` : "GoPlus"}
                  </span>
                </div>
                <DrawnLine className="mt-4" />
                {isError ? (
                  <p className="mt-6 font-mono text-[12px] text-clay">
                    Scanner oracle unreachable from this network — open the desk and retry.
                  </p>
                ) : (
                  <div className="mt-6 flex flex-col items-start gap-8 sm:flex-row">
                    <GradeDial grade={data?.grade ?? "…"} score={data?.score ?? 0} />
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                        {shortHex(preset.address, 6)} · Ethereum
                      </p>
                      {(data?.flags.slice(0, 5) ?? []).map((f) => (
                        <div key={f.label} className="flex items-start gap-3">
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                              f.severity === "clear"
                                ? "bg-moss"
                                : f.severity === "note"
                                  ? "bg-[#C89B5A]"
                                  : "bg-ember"
                            }`}
                          />
                          <p className="text-[12.5px] leading-snug text-muted">
                            <span className="text-parchment">{f.label}.</span> {f.detail}
                          </p>
                        </div>
                      ))}
                      {data && (
                        <p className="pt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                          {data.holderCount != null
                            ? `${data.holderCount.toLocaleString("en-US")} holders`
                            : ""}{" "}
                          · buy tax {data.buyTaxPct?.toFixed(1) ?? "0"}% · sell tax{" "}
                          {data.sellTaxPct?.toFixed(1) ?? "0"}%
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
