/** Jupiter aggregator quote — free lite tier, keyless, CORS-open. */

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export interface JupQuote {
  solIn: number;
  usdcOut: number;
  pricePerSol: number;
  priceImpactPct: number;
  hops: string[];
}

interface JupResponse {
  outAmount: string;
  priceImpactPct: string;
  routePlan?: Array<{ swapInfo?: { label?: string } }>;
}

export async function fetchJupQuote(solIn: number): Promise<JupQuote> {
  const lamports = Math.round(solIn * 1e9);
  const url = `https://lite-api.jup.ag/swap/v1/quote?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${lamports}&slippageBps=50`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`jupiter ${res.status}`);
  const j = (await res.json()) as JupResponse;
  const usdcOut = Number(j.outAmount) / 1e6;
  return {
    solIn,
    usdcOut,
    pricePerSol: usdcOut / solIn,
    priceImpactPct: Number(j.priceImpactPct ?? 0) * 100,
    hops: (j.routePlan ?? [])
      .map((r) => r.swapInfo?.label ?? "")
      .filter(Boolean)
      .slice(0, 4),
  };
}
