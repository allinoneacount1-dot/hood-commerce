"use client";

import { useEffect, useState } from "react";
import { LiveBadge, Panel } from "@/components/desk/ui";
import { useEngineState } from "@/hooks/use-engine";
import { signText, verifySig } from "@/lib/engine/keys";
import { forgeKey, revokeKey, setKeyScopes, setPolicy } from "@/lib/engine/store";
import { timeAgo } from "@/lib/format";
import type { Scope } from "@/lib/engine/types";
import { KeyRound, RefreshCw, ShieldOff } from "lucide-react";

const ALL_SCOPES: Scope[] = ["NFT_BUY", "DEX_SWAP", "YIELD_MOVE", "AGENT_PAY"];

function Countdown({ until }: { until: number }) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = until - Date.now();
  if (ms <= 0) return <span className="text-ember">EXPIRED</span>;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return (
    <span className="num">
      {h}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s
    </span>
  );
}

function KeyCard() {
  const st = useEngineState();
  const key = st.sessionKey;
  const alive = !!key && key.active && Date.now() < key.expiresAt;

  return (
    <Panel
      title="Session key — real secp256k1"
      right={<LiveBadge label={alive ? "Armed" : "Cold"} />}
    >
      {key ? (
        <>
          <p className="num break-all font-mono text-[13px] leading-relaxed text-parchment">
            {key.address}
          </p>
          <div className="num mt-4 grid grid-cols-2 gap-3 font-mono text-[10px] text-muted sm:grid-cols-3">
            <div>
              <p className="text-faint">FORGED</p>
              <p className="mt-0.5 text-[11px] text-parchment">{timeAgo(key.createdAt)}</p>
            </div>
            <div>
              <p className="text-faint">BURNS IN</p>
              <p className="mt-0.5 text-[11px] text-parchment">
                <Countdown until={key.expiresAt} />
              </p>
            </div>
            <div>
              <p className="text-faint">STATUS</p>
              <p className={`mt-0.5 text-[11px] ${alive ? "text-moss" : "text-ember"}`}>
                {key.active ? (alive ? "ACTIVE" : "EXPIRED") : "REVOKED"}
              </p>
            </div>
          </div>

          <p className="label-eyebrow mb-2 mt-6">Delegated scopes</p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SCOPES.map((sc) => {
              const on = key.scopes.includes(sc);
              return (
                <button
                  key={sc}
                  onClick={() =>
                    setKeyScopes(on ? key.scopes.filter((x) => x !== sc) : [...key.scopes, sc])
                  }
                  className={`chip transition-colors ${
                    on ? "border-ember/60 text-ember" : "hover:text-parchment"
                  }`}
                >
                  {sc}
                </button>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[9.5px] text-faint">
            An intent outside these scopes fails the gauntlet — try it on Command.
          </p>
        </>
      ) : (
        <p className="text-[12.5px] text-faint">No key in the quiver.</p>
      )}
      <div className="mt-6 flex gap-2">
        <button onClick={() => forgeKey()} className="btn-ember h-9 flex-1 text-[10px]">
          <RefreshCw size={11} /> Forge new key
        </button>
        {alive && (
          <button onClick={revokeKey} className="btn-ghost h-9 flex-1 text-[10px]">
            <ShieldOff size={11} /> Revoke
          </button>
        )}
      </div>
      <p className="mt-4 border-t border-hairline-soft pt-3 text-[11px] leading-relaxed text-faint">
        The private key lives only in this browser&apos;s storage and controls no funds —
        it exists to sign settlement receipts you can verify. That&apos;s the ERC-4337
        session-key pattern, demonstrated with real cryptography.
      </p>
    </Panel>
  );
}

function SigningRange() {
  const st = useEngineState();
  const key = st.sessionKey;
  const [msg, setMsg] = useState("The arrow knows its mark.");
  const [sig, setSig] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"valid" | "invalid" | null>(null);
  const [busy, setBusy] = useState(false);
  const alive = !!key && key.active && Date.now() < key.expiresAt;

  const sign = async () => {
    if (!key || !alive || busy) return;
    setBusy(true);
    setVerdict(null);
    try {
      setSig(await signText(key, msg));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!key || !sig) return;
    setVerdict((await verifySig(key.address, msg, sig)) ? "valid" : "invalid");
  };

  return (
    <Panel title="Signing range — try the key">
      <label className="label-eyebrow">Message</label>
      <input
        value={msg}
        onChange={(e) => {
          setMsg(e.target.value);
          setSig(null);
          setVerdict(null);
        }}
        className="input-field mt-2"
      />
      <div className="mt-3 flex gap-2">
        <button
          onClick={sign}
          disabled={!alive || busy}
          className="btn-ember h-9 flex-1 text-[10px] disabled:opacity-40"
        >
          {busy ? "Signing…" : "Sign with session key"}
        </button>
        <button
          onClick={verify}
          disabled={!sig}
          className="btn-ghost h-9 flex-1 text-[10px] disabled:opacity-40"
        >
          Recover & verify
        </button>
      </div>
      {sig && (
        <div className="mt-4 border border-hairline-soft bg-elevated/40 p-3">
          <p className="label-eyebrow">ECDSA signature</p>
          <p className="num mt-1.5 break-all font-mono text-[10px] leading-relaxed text-moss">
            {sig}
          </p>
          {verdict && (
            <p
              className={`mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] ${
                verdict === "valid" ? "text-moss" : "text-ember"
              }`}
            >
              {verdict === "valid"
                ? `✓ recovered signer matches ${key?.address.slice(0, 10)}…`
                : "✗ signature does not recover to the key"}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

function PolicyDesk() {
  const st = useEngineState();
  const p = st.policy;
  const [daily, setDaily] = useState(String(p.dailyLimitUsd));
  const [cap, setCap] = useState(String(p.perTxCapUsd));
  const [fng, setFng] = useState(String(p.minFearGreed));

  const commit = () => {
    const d = parseFloat(daily);
    const c = parseFloat(cap);
    const f = parseInt(fng, 10);
    setPolicy({
      dailyLimitUsd: Number.isFinite(d) && d > 0 ? d : p.dailyLimitUsd,
      perTxCapUsd: Number.isFinite(c) && c > 0 ? c : p.perTxCapUsd,
      minFearGreed: Number.isFinite(f) && f >= 0 && f <= 100 ? f : p.minFearGreed,
    });
  };

  return (
    <Panel title="Perimeter settings">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="label-eyebrow">Daily ceiling ($)</span>
          <input value={daily} onChange={(e) => setDaily(e.target.value)} inputMode="decimal" className="input-field num mt-2 font-mono text-[12px]" />
        </label>
        <label className="block">
          <span className="label-eyebrow">Per-shot cap ($)</span>
          <input value={cap} onChange={(e) => setCap(e.target.value)} inputMode="decimal" className="input-field num mt-2 font-mono text-[12px]" />
        </label>
        <label className="block">
          <span className="label-eyebrow">Sentiment floor (F&G)</span>
          <input value={fng} onChange={(e) => setFng(e.target.value)} inputMode="numeric" className="input-field num mt-2 font-mono text-[12px]" />
        </label>
      </div>
      <button onClick={commit} className="btn-ghost mt-4 h-9 w-full text-[10px]">
        Set the perimeter
      </button>
      <p className="mt-3 font-mono text-[9.5px] leading-relaxed text-faint">
        Spent today: ${p.spentTodayUsd.toFixed(2)} · resets midnight UTC · killswitch lives in the
        top bar and halts everything at once.
      </p>
    </Panel>
  );
}

export default function QuiverPage() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="space-y-4 xl:col-span-7">
        <KeyCard />
        <PolicyDesk />
      </div>
      <div className="space-y-4 xl:col-span-5">
        <SigningRange />
        <Panel title="Why this matters">
          <div className="flex items-start gap-3">
            <KeyRound size={14} className="mt-0.5 shrink-0 text-ember" />
            <p className="text-[12.5px] leading-relaxed text-muted">
              In production, this key is an ERC-4337 session key: your smart account
              delegates a narrow, expiring, capped slice of authority to the agent.
              It can act fast inside the slice — and can do nothing outside it. The
              sandbox runs the identical lifecycle: forge → scope → sign → verify →
              revoke.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
