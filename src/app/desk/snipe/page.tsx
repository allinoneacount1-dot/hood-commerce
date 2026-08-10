"use client";

import { useState } from "react";
import { LiveBadge, Panel } from "@/components/desk/ui";
import { useDeskLive } from "@/components/desk/DeskShell";
import { useEngineState } from "@/hooks/use-engine";
import { useFloors } from "@/hooks/use-live";
import { armWatcher, fireWatcher, markWatcherCheck, removeWatcher } from "@/lib/engine/store";
import { COLLECTIONS } from "@/lib/engine/types";
import { fmtNum, fmtPct, fmtUsd, timeAgo } from "@/lib/format";
import { Crosshair, Trash2 } from "lucide-react";

function ArmForm({ id, name, floorEth }: { id: string; name: string; floorEth: number }) {
  const [val, setVal] = useState("");
  const trigger = parseFloat(val);
  const valid = !Number.isNaN(trigger) && trigger > 0;
  return (
    <div className="mt-4 flex gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={floorEth ? `< ${(floorEth * 0.97).toFixed(2)} ETH` : "< ? ETH"}
        inputMode="decimal"
        className="input-field h-9 flex-1 font-mono text-[11.5px]"
      />
      <button
        onClick={() => {
          if (!valid) return;
          armWatcher(id, name, trigger);
          setVal("");
        }}
        disabled={!valid}
        className="btn-ember h-9 px-3 text-[10px] disabled:opacity-40"
      >
        <Crosshair size={11} /> Arm
      </button>
    </div>
  );
}

function FloorGrid() {
  const { data: floors, isError, isFetching } = useFloors();
  const s = useEngineState();

  return (
    <Panel
      title="Live floors — CoinGecko NFT oracle"
      right={<LiveBadge label={isFetching ? "Refreshing" : "60s cadence"} />}
    >
      {isError && !floors && (
        <p className="mb-4 font-mono text-[11px] text-clay">
          Floor oracle unreachable — retrying automatically.
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {COLLECTIONS.map((c) => {
          const f = floors?.[c.id];
          const armed = s.watchers.find((w) => w.collectionId === c.id && w.active);
          return (
            <div key={c.id} className="border border-hairline-soft bg-elevated/30 p-4">
              <div className="flex items-center gap-2.5">
                {f?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.image} alt="" className="h-7 w-7 border border-hairline" />
                ) : (
                  <span className="h-7 w-7 border border-hairline bg-elevated" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] text-parchment">{c.name}</p>
                  {armed && (
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ember">
                      armed &lt; {armed.triggerEth} ETH
                    </p>
                  )}
                </div>
              </div>
              <p className="num mt-4 font-mono text-[20px] text-parchment">
                {f ? fmtNum(f.floorEth, 2) : "—"}
                <span className="ml-1 text-[11px] text-faint">ETH</span>
              </p>
              <div className="flex items-baseline gap-2.5">
                <span className="num font-mono text-[11px] text-muted">{f ? fmtUsd(f.floorUsd, 0) : ""}</span>
                {f?.chg24hUsd != null && (
                  <span className={`num font-mono text-[10px] ${f.chg24hUsd >= 0 ? "text-moss" : "text-clay"}`}>
                    {fmtPct(f.chg24hUsd)}
                  </span>
                )}
              </div>
              <ArmForm id={c.id} name={c.name} floorEth={f?.floorEth ?? 0} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function Watchers() {
  const s = useEngineState();
  const { live } = useDeskLive();
  const [evaluating, setEvaluating] = useState(false);

  const evaluateNow = async () => {
    if (evaluating) return;
    setEvaluating(true);
    try {
      for (const w of s.watchers) {
        if (!w.active) continue;
        const floor = live.floors[w.collectionId];
        if (!floor) continue;
        markWatcherCheck(w.id, floor.eth);
        if (floor.eth > 0 && floor.eth <= w.triggerEth) {
          await fireWatcher(w, live);
        }
      }
    } finally {
      setEvaluating(false);
    }
  };

  const active = s.watchers.filter((w) => w.active);
  const spent = s.watchers.filter((w) => !w.active);

  return (
    <Panel
      title="Armed watchers"
      right={
        <button
          onClick={evaluateNow}
          disabled={evaluating || active.length === 0}
          className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ember transition-opacity hover:opacity-80 disabled:opacity-30"
        >
          {evaluating ? "Sighting…" : "Evaluate now"}
        </button>
      }
    >
      {active.length === 0 && (
        <p className="text-[12.5px] text-faint">
          No watchers in the field. Arm one above — the agent re-checks the live
          floor every 20 seconds and fires through the full policy gauntlet.
        </p>
      )}
      <ul className="space-y-3">
        {active.map((w) => {
          const floor = live.floors[w.collectionId]?.eth ?? w.lastFloorEth;
          const distPct = floor ? ((floor - w.triggerEth) / floor) * 100 : null;
          return (
            <li key={w.id} className="border border-hairline-soft bg-elevated/40 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12.5px] text-parchment">{w.collectionName}</p>
                <button
                  onClick={() => removeWatcher(w.id)}
                  className="text-faint transition-colors hover:text-ember"
                  aria-label="Disarm watcher"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="num mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] text-muted">
                <span>trigger &lt; {w.triggerEth} ETH</span>
                <span>floor {floor ? fmtNum(floor, 2) : "—"} ETH</span>
                <span>checked {w.lastCheckAt ? timeAgo(w.lastCheckAt) : "—"}</span>
              </div>
              {distPct != null && (
                <div className="mt-2.5">
                  <div className="flex justify-between font-mono text-[9px] text-faint">
                    <span>DISTANCE TO TRIGGER</span>
                    <span className="num">{distPct <= 0 ? "IN RANGE" : `${distPct.toFixed(1)}%`}</span>
                  </div>
                  <div className="mt-1 h-1 bg-bg">
                    <div
                      className={`h-1 ${distPct <= 2 ? "bg-ember" : "bg-moss/60"}`}
                      style={{ width: `${Math.max(3, Math.min(100, 100 - distPct))}%` }}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {spent.length > 0 && (
        <div className="mt-4 border-t border-hairline-soft pt-3">
          <p className="label-eyebrow mb-2">Spent</p>
          {spent.slice(0, 4).map((w) => (
            <p key={w.id} className="font-mono text-[10.5px] text-faint">
              {w.collectionName} · fired/disarmed · was &lt; {w.triggerEth} ETH
            </p>
          ))}
        </div>
      )}
    </Panel>
  );
}

function SnipeLog() {
  const s = useEngineState();
  const events = s.activity.filter((e) => e.kind === "Watcher" || e.detail.includes("Snipe"));
  return (
    <Panel title="Watcher log">
      {events.length === 0 && <p className="text-[12.5px] text-faint">Quiet in the field.</p>}
      <ul className="space-y-1.5">
        {events.slice(0, 8).map((e) => (
          <li key={e.id} className="flex items-baseline gap-2 font-mono text-[10.5px]">
            <span className="shrink-0 text-faint">{timeAgo(e.at)}</span>
            <span className="text-muted">{e.detail}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default function SnipePage() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <FloorGrid />
      </div>
      <div className="space-y-4 xl:col-span-4">
        <Watchers />
        <SnipeLog />
      </div>
    </div>
  );
}
