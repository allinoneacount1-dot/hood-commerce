"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPrices, fetchFloors, type NftFloor, type PriceRow } from "@/lib/api/coingecko";
import { fetchFearGreed, type FearGreed } from "@/lib/api/feeds";
import { fetchBlockNumber, fetchGasGwei, fetchUniQuote, type UniQuote } from "@/lib/api/rpc";
import { fetchJupQuote, type JupQuote } from "@/lib/api/jupiter";
import { COLLECTIONS, type LiveData, type Sym } from "@/lib/engine/types";

/** Live data hooks. Every number on the site flows through here.
 *  Failures degrade to "—" states — nothing is ever faked. */

export function usePrices() {
  return useQuery<Record<Sym, PriceRow>>({
    queryKey: ["prices"],
    queryFn: fetchPrices,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 1,
  });
}

const FLOOR_IDS = COLLECTIONS.map((c) => c.id);

export function useFloors() {
  return useQuery<Record<string, NftFloor>>({
    queryKey: ["floors"],
    queryFn: () => fetchFloors(FLOOR_IDS),
    refetchInterval: 90_000,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useFearGreed() {
  return useQuery<FearGreed>({
    queryKey: ["fng"],
    queryFn: fetchFearGreed,
    refetchInterval: 300_000,
    staleTime: 240_000,
    retry: 1,
  });
}

export function useGas() {
  return useQuery<number>({
    queryKey: ["gas"],
    queryFn: fetchGasGwei,
    refetchInterval: 45_000,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useBlockNumber() {
  return useQuery<number>({
    queryKey: ["block"],
    queryFn: fetchBlockNumber,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 1,
  });
}

export function useUniQuote(ethIn: number) {
  return useQuery<UniQuote>({
    queryKey: ["uni-quote", ethIn],
    queryFn: () => fetchUniQuote(ethIn),
    enabled: ethIn > 0 && ethIn <= 1000,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 1,
  });
}

export function useJupQuote(solIn: number) {
  return useQuery<JupQuote>({
    queryKey: ["jup-quote", solIn],
    queryFn: () => fetchJupQuote(solIn),
    enabled: solIn > 0 && solIn <= 100_000,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 1,
  });
}

/** Assemble the LiveData view the engine judges against. */
export function useLiveData(): { live: LiveData; ready: boolean } {
  const { data: prices } = usePrices();
  const { data: floors } = useFloors();
  const { data: fng } = useFearGreed();

  const live = useMemo<LiveData>(() => {
    const p: LiveData["prices"] = {};
    if (prices) {
      (Object.keys(prices) as Sym[]).forEach((s) => {
        p[s] = prices[s].usd;
      });
    }
    p.USDC = p.USDC ?? 1;
    const f: LiveData["floors"] = {};
    if (floors) {
      Object.values(floors).forEach((x) => {
        f[x.id] = { eth: x.floorEth, usd: x.floorUsd };
      });
    }
    return { prices: p, floors: f, fearGreed: fng?.value ?? null };
  }, [prices, floors, fng]);

  return { live, ready: !!prices };
}
