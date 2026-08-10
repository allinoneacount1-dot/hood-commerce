import { SYM_IDS, type Sym } from "@/lib/engine/types";

/** CoinGecko free API — keyless, CORS-open. */

const BASE = "https://api.coingecko.com/api/v3";

export interface PriceRow {
  usd: number;
  chg24h: number | null;
}

export async function fetchPrices(): Promise<Record<Sym, PriceRow>> {
  const ids = Object.values(SYM_IDS).join(",");
  const res = await fetch(
    `${BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`coingecko ${res.status}`);
  const j = (await res.json()) as Record<string, { usd: number; usd_24h_change?: number }>;
  const out = {} as Record<Sym, PriceRow>;
  (Object.keys(SYM_IDS) as Sym[]).forEach((sym) => {
    const row = j[SYM_IDS[sym]];
    if (row?.usd != null) out[sym] = { usd: row.usd, chg24h: row.usd_24h_change ?? null };
  });
  if (!out.ETH) throw new Error("coingecko empty");
  return out;
}

export interface NftFloor {
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  floorEth: number;
  floorUsd: number;
  chg24hUsd: number | null;
  marketCapUsd: number | null;
  vol24hEth: number | null;
}

export async function fetchNftFloor(id: string): Promise<NftFloor> {
  const res = await fetch(`${BASE}/nfts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`coingecko nft ${res.status}`);
  const j = await res.json();
  return {
    id,
    name: j.name ?? id,
    symbol: j.symbol ?? "",
    image: j.image?.small ?? null,
    floorEth: j.floor_price?.native_currency ?? 0,
    floorUsd: j.floor_price?.usd ?? 0,
    chg24hUsd: j.floor_price_in_usd_24h_percentage_change ?? null,
    marketCapUsd: j.market_cap?.usd ?? null,
    vol24hEth: j.volume_24h?.native_currency ?? null,
  };
}

/** Fetch a set of floors with a soft failure mode: collections that error are
 *  simply absent from the map — panels show honest gaps, never fake numbers. */
export async function fetchFloors(ids: string[]): Promise<Record<string, NftFloor>> {
  const settled = await Promise.allSettled(ids.map((id) => fetchNftFloor(id)));
  const out: Record<string, NftFloor> = {};
  settled.forEach((r) => {
    if (r.status === "fulfilled") out[r.value.id] = r.value;
  });
  if (Object.keys(out).length === 0) throw new Error("all floors unreachable");
  return out;
}
