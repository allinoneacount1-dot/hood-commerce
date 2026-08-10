"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { LiveBadge, Panel } from "@/components/desk/ui";
import { GradeDial } from "@/components/landing/ScannerTeaser";
import {
  SCAN_CHAINS,
  SCAN_PRESETS,
  scanToken,
  type ScanChainId,
  type ScanReport,
} from "@/lib/api/goplus";
import { logActivity } from "@/lib/engine/store";
import { shortHex } from "@/lib/format";

export default function ScannerPage() {
  const [chainId, setChainId] = useState<ScanChainId>("1");
  const [address, setAddress] = useState("");
  const [history, setHistory] = useState<ScanReport[]>([]);

  const scan = useMutation({
    mutationFn: ({ c, a }: { c: ScanChainId; a: string }) => scanToken(c, a),
    onSuccess: (report) => {
      setHistory((h) => [report, ...h.filter((x) => x.address !== report.address)].slice(0, 5));
      logActivity(
        "System",
        `Scanner sweep · ${report.tokenSymbol} → grade ${report.grade} (${report.score}/100) via ${report.source}`,
      );
    },
  });

  const valid = /^0x[a-fA-F0-9]{40}$/.test(address.trim());
  const report = scan.data;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-5">
        <Panel title="Contract sweep" right={<LiveBadge label="GoPlus intelligence" />}>
          <label className="label-eyebrow">Chain</label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SCAN_CHAINS.map((c) => (
              <button
                key={c.id}
                onClick={() => setChainId(c.id)}
                className={`chip transition-colors ${
                  chainId === c.id ? "border-ember/60 text-ember" : "hover:text-parchment"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <label className="label-eyebrow mt-5 block">ERC-20 contract address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x…"
            className="input-field num mt-2 font-mono text-[12px]"
          />
          {address && !valid && (
            <p className="mt-1.5 font-mono text-[10px] text-clay">Not a 0x…40-hex address.</p>
          )}
          <button
            onClick={() => valid && scan.mutate({ c: chainId, a: address.trim() })}
            disabled={!valid || scan.isPending}
            className="btn-ember mt-4 w-full disabled:opacity-40"
          >
            {scan.isPending ? "Sweeping bytecode…" : "Run the sweep"}
          </button>

          <p className="label-eyebrow mb-2 mt-6">Known marks</p>
          <div className="flex flex-wrap gap-1.5">
            {SCAN_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setChainId(p.chainId);
                  setAddress(p.address);
                  scan.mutate({ c: p.chainId, a: p.address });
                }}
                className="chip transition-colors hover:border-ember/50 hover:text-parchment"
              >
                {p.label}
              </button>
            ))}
          </div>
        </Panel>

        {history.length > 0 && (
          <Panel title="Sweep history — this session">
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.address} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-mono text-[11px] text-muted">
                    {h.tokenSymbol} · {shortHex(h.address, 5)}
                  </span>
                  <span
                    className={`num font-mono text-[11px] ${
                      h.grade === "A" || h.grade === "B"
                        ? "text-moss"
                        : h.grade === "C"
                          ? "text-[#C89B5A]"
                          : "text-ember"
                    }`}
                  >
                    {h.grade} · {h.score}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>

      <div className="xl:col-span-7">
        <Panel
          title={report ? `${report.tokenName} (${report.tokenSymbol})` : "Sweep report"}
          right={report ? <span className="chip">{report.source} · live</span> : undefined}
        >
          {scan.isError && (
            <p className="font-mono text-[11.5px] text-clay">
              Sweep failed: {(scan.error as Error)?.message ?? "oracle unreachable"}. The token may
              not exist on the selected chain.
            </p>
          )}
          {!report && !scan.isError && !scan.isPending && (
            <p className="text-[12.5px] text-faint">
              Aim the scanner at any ERC-20 — the sweep reads honeypot traps, tax
              ambushes, owner privileges, mint authority and proxy tricks from
              GoPlus security intelligence, live.
            </p>
          )}
          {scan.isPending && (
            <p className="font-mono text-[11.5px] text-muted">
              <span className="text-ember">▍</span> Simulating buys & sells, reading owner
              privileges…
            </p>
          )}
          <AnimatePresence>
            {report && (
              <motion.div
                key={report.address}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-8 sm:flex-row"
              >
                <div className="flex flex-col items-center gap-2">
                  <GradeDial grade={report.grade} score={report.score} />
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-faint">
                    {report.honeypot ? "HONEYPOT — DO NOT TOUCH" : "Composite risk grade"}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="num font-mono text-[10px] text-faint">
                    {shortHex(report.address, 8)} ·{" "}
                    {SCAN_CHAINS.find((c) => c.id === report.chainId)?.name}
                    {report.holderCount != null &&
                      ` · ${report.holderCount.toLocaleString("en-US")} holders`}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {report.flags.map((f) => (
                      <li key={f.label} className="flex items-start gap-3">
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
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>
      </div>
    </div>
  );
}
