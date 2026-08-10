"use client";

import { useState } from "react";
import { LiveBadge, Panel } from "@/components/desk/ui";
import { useJupQuote, usePrices, useUniQuote } from "@/hooks/use-live";
import { fmtNum, fmtUsd } from "@/lib/format";

function SpreadNote({ quotePx, midPx }: { quotePx: number | null; midPx: number | null }) {
  if (quotePx == null || midPx == null) return null;
  const spread = ((quotePx - midPx) / midPx) * 100;
  return (
    <p className="num mt-1 font-mono text-[10px] text-faint">
      vs CoinGecko mid {fmtUsd(midPx)} ·{" "}
      <span className={Math.abs(spread) < 0.5 ? "text-moss" : "text-[#C89B5A]"}>
        {spread >= 0 ? "+" : ""}
        {spread.toFixed(3)}%
      </span>
    </p>
  );
}

function UniDesk() {
  const [ethIn, setEthIn] = useState("1");
  const amount = parseFloat(ethIn) || 0;
  const { data, isFetching, isError, refetch } = useUniQuote(amount);
  const { data: prices } = usePrices();

  return (
    <Panel
      title="EVM route — Uniswap V3 QuoterV2"
      right={<LiveBadge label={isFetching ? "eth_call…" : "On-chain read"} />}
    >
      <p className="text-[12px] leading-relaxed text-muted">
        A real <span className="font-mono text-[11px] text-parchment">eth_call</span> against
        QuoterV2 on Ethereum mainnet over a free public RPC — the same math a router
        would execute, without touching funds.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <input
          value={ethIn}
          onChange={(e) => setEthIn(e.target.value)}
          inputMode="decimal"
          className="input-field num w-28 font-mono text-[12px]"
        />
        <span className="font-mono text-[11px] text-muted">WETH → USDC · 0.05% pool</span>
        <button
          onClick={() => refetch()}
          className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint transition-colors hover:text-ember"
        >
          Requote
        </button>
      </div>
      {isError && (
        <p className="mt-4 font-mono text-[11px] text-clay">RPC unreachable — retrying.</p>
      )}
      {data && (
        <div className="mt-5 border-t border-hairline-soft pt-4">
          <p className="num font-mono text-[26px] text-parchment">
            {fmtNum(data.usdcOut, 2)} <span className="text-[13px] text-faint">USDC</span>
          </p>
          <SpreadNote quotePx={data.pricePerEth} midPx={prices?.ETH?.usd ?? null} />
          <div className="num mt-4 grid grid-cols-3 gap-3 font-mono text-[10px] text-muted">
            <div>
              <p className="text-faint">PER ETH</p>
              <p className="mt-0.5 text-[11px] text-parchment">{fmtUsd(data.pricePerEth)}</p>
            </div>
            <div>
              <p className="text-faint">QUOTE GAS</p>
              <p className="mt-0.5 text-[11px] text-parchment">
                {data.gasEstimate.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <p className="text-faint">AT BLOCK</p>
              <p className="mt-0.5 text-[11px] text-parchment">
                #{data.block.toLocaleString("en-US")}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-faint">
            <span className="border border-hairline px-2 py-1 text-parchment">WETH</span>
            <span className="text-ember">→ 0.05% →</span>
            <span className="border border-hairline px-2 py-1 text-parchment">USDC</span>
            <span className="ml-auto">quoter 0x61fF…B21e</span>
          </div>
        </div>
      )}
    </Panel>
  );
}

function JupDesk() {
  const [solIn, setSolIn] = useState("10");
  const amount = parseFloat(solIn) || 0;
  const { data, isFetching, isError, refetch } = useJupQuote(amount);
  const { data: prices } = usePrices();

  return (
    <Panel
      title="SVM route — Jupiter aggregator"
      right={<LiveBadge label={isFetching ? "Routing…" : "Live quote"} />}
    >
      <p className="text-[12px] leading-relaxed text-muted">
        Jupiter&apos;s live routing engine sweeps Solana&apos;s orderbooks and pools for the
        best path — this is the same quote a swap would fill against.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <input
          value={solIn}
          onChange={(e) => setSolIn(e.target.value)}
          inputMode="decimal"
          className="input-field num w-28 font-mono text-[12px]"
        />
        <span className="font-mono text-[11px] text-muted">SOL → USDC · 50bps slippage</span>
        <button
          onClick={() => refetch()}
          className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint transition-colors hover:text-ember"
        >
          Requote
        </button>
      </div>
      {isError && (
        <p className="mt-4 font-mono text-[11px] text-clay">
          Jupiter unreachable — retrying.
        </p>
      )}
      {data && (
        <div className="mt-5 border-t border-hairline-soft pt-4">
          <p className="num font-mono text-[26px] text-parchment">
            {fmtNum(data.usdcOut, 2)} <span className="text-[13px] text-faint">USDC</span>
          </p>
          <SpreadNote quotePx={data.pricePerSol} midPx={prices?.SOL?.usd ?? null} />
          <div className="num mt-4 grid grid-cols-2 gap-3 font-mono text-[10px] text-muted">
            <div>
              <p className="text-faint">PER SOL</p>
              <p className="mt-0.5 text-[11px] text-parchment">{fmtUsd(data.pricePerSol)}</p>
            </div>
            <div>
              <p className="text-faint">PRICE IMPACT</p>
              <p className="mt-0.5 text-[11px] text-parchment">
                {data.priceImpactPct < 0.001 ? "<0.001" : data.priceImpactPct.toFixed(3)}%
              </p>
            </div>
          </div>
          {data.hops.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <span className="border border-hairline px-2 py-1 text-parchment">SOL</span>
              {data.hops.map((h, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-ember">→</span>
                  <span className="border border-hairline px-2 py-1 text-muted">{h}</span>
                </span>
              ))}
              <span className="text-ember">→</span>
              <span className="border border-hairline px-2 py-1 text-parchment">USDC</span>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

export default function RoutesPage() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UniDesk />
      <JupDesk />
      <div className="xl:col-span-2">
        <Panel title="Why two rails">
          <p className="max-w-3xl text-[12.5px] leading-relaxed text-muted">
            Cross-chain intents route through whichever rail owns the asset: EVM swaps
            price against Uniswap V3 concentrated liquidity via direct on-chain calls,
            Solana legs price through Jupiter&apos;s aggregation across every major venue.
            The Command desk sizes swap intents in USD and picks the rail from the pair —
            these two instruments are the raw quote feeds it reads.
          </p>
        </Panel>
      </div>
    </div>
  );
}
