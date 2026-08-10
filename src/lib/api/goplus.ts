/** GoPlus token security — free, keyless, CORS-open. Real anti-scam sweeps.
 *  Fallback: honeypot.is (Ethereum) when GoPlus is unreachable. */

export const SCAN_CHAINS = [
  { id: "1", name: "Ethereum" },
  { id: "8453", name: "Base" },
  { id: "56", name: "BNB Chain" },
  { id: "42161", name: "Arbitrum" },
] as const;

export type ScanChainId = (typeof SCAN_CHAINS)[number]["id"];

export interface ScanFlag {
  label: string;
  severity: "clear" | "note" | "danger";
  detail: string;
}

export interface ScanReport {
  address: string;
  chainId: ScanChainId;
  tokenName: string;
  tokenSymbol: string;
  holderCount: number | null;
  grade: "A" | "B" | "C" | "D" | "F";
  score: number;
  honeypot: boolean;
  buyTaxPct: number | null;
  sellTaxPct: number | null;
  flags: ScanFlag[];
  source: "goplus" | "honeypot.is";
}

interface GoPlusToken {
  token_name?: string;
  token_symbol?: string;
  holder_count?: string;
  is_honeypot?: string;
  buy_tax?: string;
  sell_tax?: string;
  is_open_source?: string;
  is_proxy?: string;
  is_mintable?: string;
  can_take_back_ownership?: string;
  owner_change_balance?: string;
  hidden_owner?: string;
  selfdestruct?: string;
  is_blacklisted?: string;
  transfer_pausable?: string;
  trading_cooldown?: string;
  is_in_dex?: string;
}

function flag(
  flags: ScanFlag[],
  cond: boolean,
  label: string,
  danger: string,
  clear: string,
  severity: "note" | "danger" = "danger",
) {
  flags.push(
    cond
      ? { label, severity, detail: danger }
      : { label, severity: "clear", detail: clear },
  );
}

function gradeOf(score: number, honeypot: boolean): ScanReport["grade"] {
  if (honeypot) return "F";
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export async function scanToken(
  chainId: ScanChainId,
  address: string,
): Promise<ScanReport> {
  try {
    return await scanGoPlus(chainId, address);
  } catch (e) {
    if (chainId === "1") return scanHoneypotIs(address);
    throw e;
  }
}

async function scanGoPlus(chainId: ScanChainId, address: string): Promise<ScanReport> {
  const res = await fetch(
    `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${address.toLowerCase()}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`goplus ${res.status}`);
  const j = await res.json();
  const t: GoPlusToken | undefined = j?.result?.[address.toLowerCase()];
  if (!t) throw new Error("goplus: token not found on this chain");

  const yes = (v?: string) => v === "1";
  const flags: ScanFlag[] = [];
  let score = 100;
  const dock = (n: number) => (score -= n);

  const honeypot = yes(t.is_honeypot);
  if (honeypot) dock(100);
  flag(flags, honeypot, "Honeypot", "Sell path is trapped — buyers cannot exit.", "Sell simulation passes.");

  const openSource = yes(t.is_open_source);
  if (!openSource) dock(25);
  flag(flags, !openSource, "Source code", "Contract is unverified bytecode.", "Verified source.");

  const buyTax = t.buy_tax != null && t.buy_tax !== "" ? parseFloat(t.buy_tax) * 100 : null;
  const sellTax = t.sell_tax != null && t.sell_tax !== "" ? parseFloat(t.sell_tax) * 100 : null;
  if (buyTax != null && buyTax > 5) dock(10);
  else if (buyTax != null && buyTax > 1) dock(4);
  if (sellTax != null && sellTax > 5) dock(10);
  else if (sellTax != null && sellTax > 1) dock(4);
  flag(
    flags,
    (buyTax ?? 0) > 5 || (sellTax ?? 0) > 5,
    "Trade tax",
    `Heavy tax — buy ${buyTax?.toFixed(1) ?? "?"}% / sell ${sellTax?.toFixed(1) ?? "?"}%.`,
    `Buy ${buyTax?.toFixed(1) ?? "0"}% / sell ${sellTax?.toFixed(1) ?? "0"}%.`,
    "note",
  );

  const mintable = yes(t.is_mintable);
  if (mintable) dock(10);
  flag(flags, mintable, "Mint authority", "Supply can be inflated at will.", "No open mint.", "note");

  const takeBack = yes(t.can_take_back_ownership);
  if (takeBack) dock(12);
  flag(flags, takeBack, "Ownership", "Renounce is reversible — owner can return.", "No take-back path.");

  const ownerChange = yes(t.owner_change_balance);
  if (ownerChange) dock(12);
  flag(flags, ownerChange, "Balance tampering", "Owner can edit holder balances.", "Balances are immutable.");

  const hidden = yes(t.hidden_owner);
  if (hidden) dock(15);
  flag(flags, hidden, "Hidden owner", "Obscured owner privileges detected.", "No hidden owner.");

  const selfDestruct = yes(t.selfdestruct);
  if (selfDestruct) dock(20);
  flag(flags, selfDestruct, "Self-destruct", "Contract can erase itself.", "No self-destruct.");

  const pausable = yes(t.transfer_pausable);
  if (pausable) dock(8);
  flag(flags, pausable, "Transfer pause", "Transfers can be frozen.", "Transfers cannot be paused.", "note");

  const blacklisted = yes(t.is_blacklisted);
  if (blacklisted) dock(8);
  flag(flags, blacklisted, "Blacklist", "Addresses can be banned from trading.", "No blacklist.", "note");

  const proxy = yes(t.is_proxy);
  if (proxy) dock(8);
  flag(flags, proxy, "Proxy", "Logic can be swapped behind a proxy.", "Not a proxy.", "note");

  score = Math.max(0, score);
  return {
    address,
    chainId,
    tokenName: t.token_name ?? "Unknown",
    tokenSymbol: t.token_symbol ?? "?",
    holderCount: t.holder_count ? parseInt(t.holder_count, 10) : null,
    grade: gradeOf(score, honeypot),
    score,
    honeypot,
    buyTaxPct: buyTax,
    sellTaxPct: sellTax,
    flags,
    source: "goplus",
  };
}

interface HoneypotIsResponse {
  token?: { name?: string; symbol?: string; totalHolders?: number };
  honeypotResult?: { isHoneypot?: boolean };
  simulationResult?: { buyTax?: number; sellTax?: number };
  contractCode?: { openSource?: boolean };
}

async function scanHoneypotIs(address: string): Promise<ScanReport> {
  const res = await fetch(
    `https://api.honeypot.is/v2/IsHoneypot?address=${address}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`honeypot.is ${res.status}`);
  const j = (await res.json()) as HoneypotIsResponse;
  const honeypot = j.honeypotResult?.isHoneypot ?? false;
  const buyTax = j.simulationResult?.buyTax ?? null;
  const sellTax = j.simulationResult?.sellTax ?? null;
  const openSource = j.contractCode?.openSource ?? true;

  const flags: ScanFlag[] = [];
  let score = 100;
  if (honeypot) score = 0;
  if (!openSource) score -= 25;
  if ((buyTax ?? 0) > 5) score -= 10;
  if ((sellTax ?? 0) > 5) score -= 10;
  flag(flags, honeypot, "Honeypot", "Sell path is trapped — buyers cannot exit.", "Sell simulation passes.");
  flag(flags, !openSource, "Source code", "Contract is unverified bytecode.", "Verified source.");
  flag(
    flags,
    (buyTax ?? 0) > 5 || (sellTax ?? 0) > 5,
    "Trade tax",
    `Heavy tax — buy ${buyTax?.toFixed(1) ?? "?"}% / sell ${sellTax?.toFixed(1) ?? "?"}%.`,
    `Buy ${buyTax?.toFixed(1) ?? "0"}% / sell ${sellTax?.toFixed(1) ?? "0"}%.`,
    "note",
  );

  score = Math.max(0, score);
  return {
    address,
    chainId: "1",
    tokenName: j.token?.name ?? "Unknown",
    tokenSymbol: j.token?.symbol ?? "?",
    holderCount: j.token?.totalHolders ?? null,
    grade: gradeOf(score, honeypot),
    score,
    honeypot,
    buyTaxPct: buyTax,
    sellTaxPct: sellTax,
    flags,
    source: "honeypot.is",
  };
}

/** Known addresses for one-tap scans. */
export const SCAN_PRESETS = [
  { label: "PEPE", chainId: "1" as ScanChainId, address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933" },
  { label: "LINK", chainId: "1" as ScanChainId, address: "0x514910771AF9Ca656af840dff83E8264EcF986CA" },
  { label: "UNI", chainId: "1" as ScanChainId, address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" },
  { label: "DEGEN (Base)", chainId: "8453" as ScanChainId, address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed" },
];
