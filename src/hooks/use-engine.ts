"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  expireApprovals,
  fireWatcher,
  getEngineState,
  markWatcherCheck,
  runDueDcas,
  subscribeEngine,
} from "@/lib/engine/store";
import type { EngineState, LiveData } from "@/lib/engine/types";
import { useLiveData } from "./use-live";

const serverSnapshot = (): EngineState => getEngineState();

export function useEngineState(): EngineState {
  return useSyncExternalStore(subscribeEngine, getEngineState, serverSnapshot);
}

/** The runtime loop: evaluates armed watchers against real floors, runs due
 *  DCA tranches, expires stale approvals. Mount once in the desk layout. */
export function useEngineRuntime(): { live: LiveData; ready: boolean } {
  const { live, ready } = useLiveData();
  const liveRef = useRef(live);
  liveRef.current = live;
  const busyRef = useRef(false);

  useEffect(() => {
    const tick = async () => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        const l = liveRef.current;
        expireApprovals();
        const s = getEngineState();
        for (const w of s.watchers) {
          if (!w.active) continue;
          const floor = l.floors[w.collectionId];
          if (!floor) continue;
          markWatcherCheck(w.id, floor.eth);
          if (floor.eth > 0 && floor.eth <= w.triggerEth) {
            await fireWatcher(w, l);
          }
        }
        if (s.dcas.length > 0) await runDueDcas(l);
      } finally {
        busyRef.current = false;
      }
    };
    const id = setInterval(tick, 20_000);
    const first = setTimeout(tick, 2_500);
    return () => {
      clearInterval(id);
      clearTimeout(first);
    };
  }, []);

  return { live, ready };
}
