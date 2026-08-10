"use client";

import { useState, type ReactNode } from "react";
import { verifySig } from "@/lib/engine/keys";
import { shortHex } from "@/lib/format";
import type { PolicyCheck, Receipt } from "@/lib/engine/types";
import { Check, Minus, X } from "lucide-react";

export function Panel({
  title,
  right,
  children,
  className,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className ?? ""}`}>
      <header className="hairline-b flex min-h-[42px] items-center justify-between gap-3 px-4 py-2">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{title}</h2>
        {right}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-ember" />
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-ember">{label}</span>
    </span>
  );
}

export function ChecksList({ checks }: { checks: PolicyCheck[] }) {
  return (
    <ul className="space-y-2">
      {checks.map((c) => (
        <li key={c.name} className="flex items-start gap-2.5">
          <span
            className={`mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${
              c.status === "pass"
                ? "border-moss/50 text-moss"
                : c.status === "warn"
                  ? "border-[#C89B5A]/50 text-[#C89B5A]"
                  : "border-ember/60 text-ember"
            }`}
          >
            {c.status === "pass" ? <Check size={9} /> : c.status === "warn" ? <Minus size={9} /> : <X size={9} />}
          </span>
          <div className="min-w-0">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-parchment">
              {c.name}
            </span>
            <span className="ml-2 text-[12px] text-muted">{c.detail}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function VerifyButton({ receipt }: { receipt: Receipt }) {
  const [state, setState] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  if (!receipt.sig) return null;
  const run = async () => {
    setState("checking");
    const ok = await verifySig(receipt.signer, receipt.hash, receipt.sig);
    setState(ok ? "valid" : "invalid");
  };
  return (
    <button
      onClick={run}
      className={`font-mono text-[9.5px] uppercase tracking-[0.16em] transition-colors ${
        state === "valid"
          ? "text-moss"
          : state === "invalid"
            ? "text-ember"
            : "text-faint hover:text-parchment"
      }`}
    >
      {state === "idle" && "Verify sig"}
      {state === "checking" && "Recovering…"}
      {state === "valid" && "✓ ECDSA valid"}
      {state === "invalid" && "✗ Invalid"}
    </button>
  );
}

export function ReceiptRow({ receipt }: { receipt: Receipt }) {
  return (
    <div className="border-b border-hairline-soft py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-[12.5px] text-parchment">{receipt.summary}</p>
        <span
          className={`shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] ${
            receipt.status === "executed" ? "text-moss" : "text-ember"
          }`}
        >
          {receipt.status}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="num font-mono text-[10px] text-muted">
          ${receipt.amountUsd.toFixed(2)}
        </span>
        {receipt.feeUsd > 0 && (
          <span className="num font-mono text-[10px] text-faint">fee ${receipt.feeUsd.toFixed(2)}</span>
        )}
        <span className="num font-mono text-[10px] text-faint">{shortHex(receipt.hash, 5)}</span>
        <VerifyButton receipt={receipt} />
      </div>
    </div>
  );
}
