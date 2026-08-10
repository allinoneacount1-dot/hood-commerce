"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowMark } from "@/components/brand/ArrowMark";
import { useEngineRuntime, useEngineState } from "@/hooks/use-engine";
import { useBlockNumber, useGas } from "@/hooks/use-live";
import { toggleKillswitch } from "@/lib/engine/store";
import { fmtNum, shortHex } from "@/lib/format";
import type { LiveData } from "@/lib/engine/types";
import {
  Crosshair,
  KeyRound,
  Power,
  ScrollText,
  ShieldAlert,
  Terminal,
  Waypoints,
} from "lucide-react";

const MODULES = [
  { href: "/desk", label: "Command", icon: Terminal },
  { href: "/desk/snipe", label: "Snipe", icon: Crosshair },
  { href: "/desk/scanner", label: "Scanner", icon: ShieldAlert },
  { href: "/desk/routes", label: "Routes", icon: Waypoints },
  { href: "/desk/quiver", label: "Quiver", icon: KeyRound },
  { href: "/desk/ledger", label: "Ledger", icon: ScrollText },
];

interface DeskCtx {
  live: LiveData;
  ready: boolean;
}

const Ctx = createContext<DeskCtx | null>(null);

export function useDeskLive(): DeskCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDeskLive outside DeskShell");
  return v;
}

function TopBar() {
  const s = useEngineState();
  const { data: gas } = useGas();
  const { data: block } = useBlockNumber();
  const pending = s.approvals.filter((a) => a.status === "pending").length;
  const key = s.sessionKey;
  const keyLive = !!key && key.active && Date.now() < key.expiresAt;

  return (
    <header className="hairline-b sticky top-0 z-40 bg-bg/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <ArrowMark className="h-6 w-6 text-ember transition-transform duration-500 ease-hunt group-hover:-rotate-45" />
          <span className="hidden font-display text-[15px] font-semibold text-parchment md:inline">
            Hood Commerce
          </span>
        </Link>
        <span className="chip-ember">Sandbox</span>
        <span className="chip hidden sm:inline-flex" title={key?.address}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${keyLive ? "bg-moss" : "bg-ember"}`}
          />
          {key ? shortHex(key.address, 4) : "no key"}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {pending > 0 && (
            <Link href="/desk" className="chip-ember">
              {pending} awaiting sign-off
            </Link>
          )}
          <span className="chip hidden md:inline-flex">
            gas {gas != null ? `${fmtNum(gas, gas < 2 ? 2 : 1)} gwei` : "—"}
          </span>
          <span className="chip hidden lg:inline-flex">
            block {block ? `#${block.toLocaleString("en-US")}` : "—"}
          </span>
          <button
            onClick={toggleKillswitch}
            title={s.policy.killswitch ? "Release killswitch" : "Engage killswitch"}
            className={`flex h-8 w-8 items-center justify-center border transition-colors ${
              s.policy.killswitch
                ? "border-ember bg-ember/15 text-ember"
                : "border-hairline text-faint hover:border-ember hover:text-ember"
            }`}
          >
            <Power size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Rail() {
  const pathname = usePathname();
  return (
    <nav className="hairline-b flex gap-1 overflow-x-auto px-3 py-2 lg:hairline-r lg:w-[196px] lg:shrink-0 lg:flex-col lg:border-b-0 lg:px-3 lg:py-4">
      {MODULES.map((m) => {
        const active = pathname === m.href;
        const Icon = m.icon;
        return (
          <Link
            key={m.href}
            href={m.href}
            className={`relative flex shrink-0 items-center gap-2.5 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
              active ? "bg-elevated/70 text-parchment" : "text-faint hover:text-muted"
            }`}
          >
            {active && <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-ember" />}
            <Icon size={13} className={active ? "text-ember" : ""} />
            {m.label}
          </Link>
        );
      })}
      <div className="mt-auto hidden px-3 pt-6 lg:block">
        <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-faint">
          Robinhood Chain
          <br />
          Testnet (7070)
        </p>
      </div>
    </nav>
  );
}

export function DeskShell({ children }: { children: ReactNode }) {
  const runtime = useEngineRuntime();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Everything below reads browser-only engine state (localStorage, session
  // keys, clocks) — render it only after mount so SSR and client HTML agree.
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="hairline-b flex h-14 items-center gap-2.5 px-4 lg:px-6">
          <ArrowMark className="h-6 w-6 text-ember" />
          <span className="font-display text-[15px] font-semibold text-parchment">
            Hood Commerce
          </span>
          <span className="chip-ember">Sandbox</span>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-faint">
            Stringing the bow…
          </span>
        </div>
      </div>
    );
  }

  return (
    <Ctx.Provider value={runtime}>
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <div className="flex flex-1 flex-col lg:flex-row">
          <Rail />
          <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </Ctx.Provider>
  );
}
