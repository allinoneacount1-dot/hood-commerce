"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChecksList, LiveBadge, Panel, ReceiptRow } from "@/components/desk/ui";
import { useDeskLive } from "@/components/desk/DeskShell";
import { useEngineState } from "@/hooks/use-engine";
import { usePrices } from "@/hooks/use-live";
import { parseIntent } from "@/lib/engine/parser";
import { decideApproval, executePayload, type ExecuteResult } from "@/lib/engine/store";
import { fmtUsd, timeAgo } from "@/lib/format";
import type { ParseResult, Sym } from "@/lib/engine/types";

const PRESETS = [
  "Snipe Pudgy Penguins if the floor drops below 8 ETH",
  "Swap $250 of USDC to ETH",
  "Buy Milady at current floor, scan for rugs first",
  "DCA $50 into SOL every day",
  "Allocate $400 USDC into the yield vault",
  "Hire CodeBot for a contract audit ($10)",
];

function IntentTerminal() {
  const { live, ready } = useDeskLive();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [result, setResult] = useState<ExecuteResult | null>(null);
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prefill from ?intent= (roster "Hire →" wiring)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("intent");
    if (q) {
      setText(q);
      setParsed(parseIntent(q));
    }
  }, []);

  const onChange = (v: string) => {
    setText(v);
    setResult(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParsed(v.trim() ? parseIntent(v) : null);
    }, 220);
  };

  const fire = async () => {
    if (!parsed?.ok || !parsed.payload || busy || !ready) return;
    setBusy(true);
    try {
      const r = await executePayload(parsed.payload, live);
      setResult(r);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Intent terminal" right={<LiveBadge label={ready ? "Oracles live" : "Waiting for oracles"} />}>
      <div className="flex items-center gap-2 border border-hairline bg-elevated/60 px-3 focus-within:border-ember">
        <span className="font-mono text-[13px] text-ember">›</span>
        <input
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fire()}
          placeholder="Speak an intent — “Snipe Pudgy Penguins below 8 ETH, scan for rugs first”"
          className="num h-11 w-full bg-transparent font-mono text-[12.5px] text-parchment outline-none placeholder:text-faint"
        />
        <button
          onClick={fire}
          disabled={!parsed?.ok || busy || !ready}
          className="btn-ember h-8 shrink-0 px-4 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Drawing…" : "Loose"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="chip transition-colors hover:border-ember/50 hover:text-parchment"
          >
            {p}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {parsed && (
          <motion.div
            key={text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <div>
              <p className="label-eyebrow mb-2.5">Compiler trace</p>
              <div className="space-y-1.5">
                {parsed.steps.map((s, i) => (
                  <p key={i} className="font-mono text-[11px] text-muted">
                    <span className="text-ember">[{s.station}]</span> {s.detail}
                  </p>
                ))}
                {parsed.warnings.map((w, i) => (
                  <p key={`w${i}`} className="font-mono text-[11px] text-[#C89B5A]">
                    ⚠ {w}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="label-eyebrow mb-2.5">Payload</p>
              {parsed.payload ? (
                <pre className="num max-h-44 overflow-auto border border-hairline-soft bg-elevated/40 p-3 font-mono text-[10.5px] leading-relaxed text-moss">
                  {JSON.stringify(parsed.payload, null, 2)}
                </pre>
              ) : (
                <p className="font-mono text-[11px] text-faint">— nothing executable —</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-5 border p-4 ${
              result.verdict === "cleared"
                ? "border-moss/40 bg-moss/[0.06]"
                : result.verdict === "approval"
                  ? "border-[#C89B5A]/40 bg-[#C89B5A]/[0.06]"
                  : "border-ember/40 bg-ember/[0.06]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <p
                className={`font-mono text-[11px] uppercase tracking-[0.2em] ${
                  result.verdict === "cleared"
                    ? "text-moss"
                    : result.verdict === "approval"
                      ? "text-[#C89B5A]"
                      : "text-ember"
                }`}
              >
                {result.verdict === "cleared" && "Loosed — settled & signed"}
                {result.verdict === "approval" && "Held at full draw — awaiting your sign-off"}
                {result.verdict === "blocked" && "Held — outside the perimeter"}
              </p>
            </div>
            <ChecksList checks={result.checks} />
            {result.receipt?.sig && (
              <div className="mt-4 border-t border-hairline-soft pt-3">
                <ReceiptRow receipt={result.receipt} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function Telemetry() {
  const s = useEngineState();
  const { data: prices } = usePrices();

  const rows = useMemo(() => {
    const syms: Sym[] = ["ETH", "BTC", "SOL", "USDC"];
    return syms.map((sym) => {
      const qty = s.balances[sym];
      const px = sym === "USDC" ? 1 : prices?.[sym]?.usd;
      return { sym, qty, usd: px != null ? qty * px : null };
    });
  }, [s.balances, prices]);

  const total =
    rows.every((r) => r.usd != null)
      ? rows.reduce((a, r) => a + (r.usd ?? 0), 0) + s.vaultUsd
      : null;
  const spentPct = Math.min(100, (s.policy.spentTodayUsd / s.policy.dailyLimitUsd) * 100);

  return (
    <Panel title="Agent telemetry" right={<LiveBadge label="Priced live" />}>
      <div className="flex items-baseline justify-between">
        <span className="label-eyebrow">Sandbox portfolio</span>
        <span className="num font-mono text-[22px] text-parchment">{fmtUsd(total, 0)}</span>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.sym} className="flex items-baseline justify-between border-b border-hairline-soft pb-2 last:border-b-0">
            <span className="font-mono text-[11px] text-muted">{r.sym}</span>
            <span className="num font-mono text-[11px] text-parchment">
              {r.qty.toLocaleString("en-US", { maximumFractionDigits: 4 })}
              <span className="ml-2 text-faint">{fmtUsd(r.usd, 0)}</span>
            </span>
          </div>
        ))}
        {s.vaultUsd > 0 && (
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] text-muted">VAULT</span>
            <span className="num font-mono text-[11px] text-moss">{fmtUsd(s.vaultUsd)}</span>
          </div>
        )}
      </div>
      <div className="mt-5">
        <div className="flex justify-between font-mono text-[10px] text-faint">
          <span>SPENT TODAY</span>
          <span className="num">
            ${s.policy.spentTodayUsd.toFixed(2)} / ${s.policy.dailyLimitUsd.toFixed(0)}
          </span>
        </div>
        <div className="mt-1.5 h-1 bg-elevated">
          <div
            className={`h-1 transition-all duration-700 ${spentPct > 85 ? "bg-ember" : "bg-moss/70"}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
      </div>
    </Panel>
  );
}

function Approvals() {
  const s = useEngineState();
  const { live } = useDeskLive();
  const pending = s.approvals.filter((a) => a.status === "pending");

  return (
    <Panel
      title="Human-in-the-loop"
      right={
        pending.length > 0 ? (
          <span className="chip-ember">{pending.length} held</span>
        ) : undefined
      }
    >
      {pending.length === 0 && (
        <p className="text-[12.5px] text-faint">
          Nothing at full draw. Intents above the per-shot cap will wait here for
          your hand.
        </p>
      )}
      <ul className="space-y-3">
        {pending.map((a) => (
          <li key={a.id} className="border border-hairline-soft bg-elevated/40 p-3">
            <p className="text-[12.5px] text-parchment">{a.payload.summary}</p>
            <p className="mt-1 font-mono text-[10px] text-[#C89B5A]">{a.reason}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => decideApproval(a.id, true, live)}
                className="btn-ember h-8 flex-1 text-[10px]"
              >
                Release
              </button>
              <button
                onClick={() => decideApproval(a.id, false, live)}
                className="btn-ghost h-8 flex-1 text-[10px]"
              >
                Refuse
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function RecentActivity() {
  const s = useEngineState();
  return (
    <Panel title="Field log">
      <ul className="space-y-1.5">
        {s.activity.slice(0, 6).map((e) => (
          <li key={e.id} className="flex items-baseline gap-2 font-mono text-[10.5px]">
            <span className="shrink-0 text-faint">{timeAgo(e.at)}</span>
            <span className="truncate text-muted">{e.detail}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/desk/ledger"
        className="mt-3 block font-mono text-[10px] uppercase tracking-[0.18em] text-faint transition-colors hover:text-ember"
      >
        Full ledger →
      </Link>
    </Panel>
  );
}

export default function CommandPage() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-7 2xl:col-span-8">
        <IntentTerminal />
        <RecentActivity />
      </div>
      <div className="space-y-4 xl:col-span-5 2xl:col-span-4">
        <Telemetry />
        <Approvals />
      </div>
    </div>
  );
}
