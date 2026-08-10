"use client";

import { useMemo, useState } from "react";
import { LiveBadge, Panel, ReceiptRow } from "@/components/desk/ui";
import { useEngineState } from "@/hooks/use-engine";
import { usePrices } from "@/hooks/use-live";
import { exportReceipts, resetEngine } from "@/lib/engine/store";
import { fmtNum, fmtUsd, timeAgo } from "@/lib/format";
import type { Sym } from "@/lib/engine/types";
import { Download, RotateCcw } from "lucide-react";

function Holdings() {
  const s = useEngineState();
  const { data: prices } = usePrices();

  const rows = useMemo(() => {
    const syms: Sym[] = ["ETH", "BTC", "SOL", "USDC"];
    const r = syms.map((sym) => {
      const qty = s.balances[sym];
      const px = sym === "USDC" ? 1 : prices?.[sym]?.usd;
      return { sym, qty, usd: px != null ? qty * px : null };
    });
    const total = r.reduce((a, x) => a + (x.usd ?? 0), 0) + s.vaultUsd;
    return { r, total };
  }, [s.balances, s.vaultUsd, prices]);

  return (
    <Panel title="Sandbox holdings" right={<LiveBadge label="Priced live" />}>
      <p className="num font-mono text-[28px] text-parchment">{fmtUsd(rows.total, 0)}</p>
      <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint">
        Total sandbox value at live prices
      </p>
      <div className="mt-5 space-y-3">
        {rows.r.map((x) => {
          const pct = rows.total > 0 && x.usd != null ? (x.usd / rows.total) * 100 : 0;
          return (
            <div key={x.sym}>
              <div className="flex items-baseline justify-between font-mono text-[11px]">
                <span className="text-muted">{x.sym}</span>
                <span className="num text-parchment">
                  {x.qty.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                  <span className="ml-2 text-faint">{fmtUsd(x.usd, 0)}</span>
                </span>
              </div>
              <div className="mt-1 h-1 bg-elevated">
                <div className="h-1 bg-parchment/40" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {s.vaultUsd > 0 && (
          <div>
            <div className="flex items-baseline justify-between font-mono text-[11px]">
              <span className="text-muted">YIELD VAULT</span>
              <span className="num text-moss">{fmtUsd(s.vaultUsd)}</span>
            </div>
            <div className="mt-1 h-1 bg-elevated">
              <div
                className="h-1 bg-moss/60"
                style={{ width: `${rows.total > 0 ? (s.vaultUsd / rows.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

function Trophies() {
  const s = useEngineState();
  const { data: prices } = usePrices();
  if (s.trophies.length === 0) return null;
  return (
    <Panel title="Trophies — sniped NFTs">
      <ul className="space-y-2.5">
        {s.trophies.map((t) => {
          const nowUsd = prices?.ETH ? t.paidEth * prices.ETH.usd : null;
          const pnl = nowUsd != null ? nowUsd - t.paidUsd : null;
          return (
            <li key={t.id} className="flex items-baseline justify-between gap-3 border-b border-hairline-soft pb-2.5 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] text-parchment">{t.name}</p>
                <p className="num font-mono text-[10px] text-faint">
                  {fmtNum(t.paidEth, 2)} ETH · {timeAgo(t.at)}
                </p>
              </div>
              <div className="text-right">
                <p className="num font-mono text-[11px] text-muted">{fmtUsd(t.paidUsd, 0)}</p>
                {pnl != null && (
                  <p className={`num font-mono text-[10px] ${pnl >= 0 ? "text-moss" : "text-clay"}`}>
                    {pnl >= 0 ? "+" : ""}
                    {fmtUsd(pnl, 0)} mark
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function HouseBook() {
  const s = useEngineState();
  return (
    <Panel title="The house book">
      <div className="num grid grid-cols-3 gap-3 font-mono">
        <div>
          <p className="text-[9.5px] uppercase tracking-[0.16em] text-faint">Volume</p>
          <p className="mt-1 text-[15px] text-parchment">{fmtUsd(s.volumeUsd, 0)}</p>
        </div>
        <div>
          <p className="text-[9.5px] uppercase tracking-[0.16em] text-faint">Fees 0.25%</p>
          <p className="mt-1 text-[15px] text-ember">{fmtUsd(s.treasuryUsd)}</p>
        </div>
        <div>
          <p className="text-[9.5px] uppercase tracking-[0.16em] text-faint">Receipts</p>
          <p className="mt-1 text-[15px] text-parchment">{s.receipts.length}</p>
        </div>
      </div>
    </Panel>
  );
}

function Receipts() {
  const s = useEngineState();
  const [armedReset, setArmedReset] = useState(false);

  const download = () => {
    const blob = new Blob([exportReceipts()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hood-receipts.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Panel
      title="Settlement receipts — ECDSA signed"
      right={
        <div className="flex items-center gap-3">
          <button
            onClick={download}
            className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-faint transition-colors hover:text-parchment"
          >
            <Download size={11} /> Export
          </button>
          <button
            onClick={() => {
              if (armedReset) {
                resetEngine();
                setArmedReset(false);
              } else {
                setArmedReset(true);
                setTimeout(() => setArmedReset(false), 3000);
              }
            }}
            className={`flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] transition-colors ${
              armedReset ? "text-ember" : "text-faint hover:text-parchment"
            }`}
          >
            <RotateCcw size={11} /> {armedReset ? "Click again to reset" : "Reset sandbox"}
          </button>
        </div>
      }
    >
      {s.receipts.length === 0 && (
        <p className="text-[12.5px] text-faint">
          No settlements yet. Loose an intent from Command — every execution lands
          here with a content hash and a real signature.
        </p>
      )}
      <div>
        {s.receipts.slice(0, 20).map((r) => (
          <ReceiptRow key={r.id} receipt={r} />
        ))}
      </div>
    </Panel>
  );
}

function FieldLog() {
  const s = useEngineState();
  const [filter, setFilter] = useState<string>("All");
  const kinds = ["All", "Execution", "Block", "Approval", "Watcher", "Key", "System"];
  const events = s.activity.filter((e) => filter === "All" || e.kind === filter);
  return (
    <Panel title="Field log">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`chip transition-colors ${filter === k ? "border-ember/60 text-ember" : "hover:text-parchment"}`}
          >
            {k}
          </button>
        ))}
      </div>
      <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
        {events.slice(0, 60).map((e) => (
          <li key={e.id} className="flex items-baseline gap-2 font-mono text-[10.5px]">
            <span className="shrink-0 text-faint">{timeAgo(e.at)}</span>
            <span className="shrink-0 text-ember">[{e.kind}]</span>
            <span className="text-muted">{e.detail}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default function LedgerPage() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-5">
        <Holdings />
        <HouseBook />
        <Trophies />
      </div>
      <div className="space-y-4 xl:col-span-7">
        <Receipts />
        <FieldLog />
      </div>
    </div>
  );
}
