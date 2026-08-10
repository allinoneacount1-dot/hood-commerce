"use client";

import { useBlockNumber, useFearGreed, useFloors, useGas, usePrices } from "@/hooks/use-live";
import { fmtNum, fmtPct, fmtUsd } from "@/lib/format";
import type { Sym } from "@/lib/engine/types";

function Item({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className="mx-6 inline-flex items-baseline gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{label}</span>
      <span className={`num font-mono text-[12px] ${accent ? "text-ember" : "text-parchment"}`}>
        {value}
      </span>
    </span>
  );
}

function Delta({ v }: { v: number | null }) {
  if (v == null) return null;
  return (
    <span className={`num font-mono text-[11px] ${v >= 0 ? "text-moss" : "text-clay"}`}>
      {fmtPct(v)}
    </span>
  );
}

/** One pass of tape content — rendered twice for the seamless loop. */
function TapeRun() {
  const { data: prices } = usePrices();
  const { data: fng } = useFearGreed();
  const { data: gas } = useGas();
  const { data: block } = useBlockNumber();
  const { data: floors } = useFloors();
  const pudgy = floors?.["pudgy-penguins"];

  return (
    <span className="inline-flex items-center whitespace-nowrap">
      {(["ETH", "BTC", "SOL"] as Sym[]).map((s) => (
        <span key={s} className="mx-6 inline-flex items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{s}</span>
          <span className="num font-mono text-[12px] text-parchment">
            {prices?.[s] ? fmtUsd(prices[s].usd) : "—"}
          </span>
          <Delta v={prices?.[s]?.chg24h ?? null} />
        </span>
      ))}
      <Item label="Fear & Greed" value={fng ? `${fng.value} · ${fng.label}` : "—"} />
      <Item label="Gas" value={gas != null ? `${fmtNum(gas, gas < 2 ? 2 : 1)} gwei` : "—"} />
      <Item label="ETH block" value={block ? `#${block.toLocaleString("en-US")}` : "—"} />
      <Item
        label="Pudgy floor"
        value={pudgy ? `${fmtNum(pudgy.floorEth, 2)} ETH` : "—"}
      />
      <Item label="Settlement" value="SANDBOX · SIGNED" accent />
    </span>
  );
}

export function LiveTape() {
  return (
    <div className="hairline-t hairline-b relative overflow-hidden bg-bg/80 py-2.5 backdrop-blur-sm">
      <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
        <span className="flex items-center gap-1.5 bg-bg pr-3">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-ember" />
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-ember">Live</span>
        </span>
      </div>
      <div className="animate-tape inline-flex whitespace-nowrap pl-24">
        <TapeRun />
        <TapeRun />
      </div>
    </div>
  );
}
