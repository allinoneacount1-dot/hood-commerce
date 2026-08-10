/** Hood Commerce sandbox engine — shared types.
 *  Everything here is local-first: state persists in the browser, every number
 *  shown next to it is live from free public APIs, and every settlement
 *  receipt is signed with a real secp256k1 session key. */

export type Sym = "ETH" | "BTC" | "SOL" | "USDC";

export const SYM_IDS: Record<Sym, string> = {
  ETH: "ethereum",
  BTC: "bitcoin",
  SOL: "solana",
  USDC: "usd-coin",
};

export type IntentKind = "SNIPE_NFT" | "SWAP" | "DCA" | "YIELD" | "AGENT_PAY";

export type Scope = "NFT_BUY" | "DEX_SWAP" | "YIELD_MOVE" | "AGENT_PAY";

export const KIND_SCOPE: Record<IntentKind, Scope> = {
  SNIPE_NFT: "NFT_BUY",
  SWAP: "DEX_SWAP",
  DCA: "DEX_SWAP",
  YIELD: "YIELD_MOVE",
  AGENT_PAY: "AGENT_PAY",
};

export interface IntentPayload {
  kind: IntentKind;
  summary: string;
  /** SNIPE_NFT */
  collectionId?: string;
  collectionName?: string;
  triggerEth?: number;
  immediate?: boolean;
  /** SWAP / DCA */
  fromSym?: Sym;
  toSym?: Sym;
  amountUsd: number;
  cadence?: "daily" | "weekly";
  /** AGENT_PAY */
  agentId?: string;
  recurring?: boolean;
  /** guards parsed from language */
  approvalAboveUsd?: number;
  requireScan?: boolean;
}

export interface ParseStep {
  station: string;
  detail: string;
}

export interface ParseResult {
  ok: boolean;
  payload: IntentPayload | null;
  steps: ParseStep[];
  warnings: string[];
}

export type CheckStatus = "pass" | "warn" | "fail";

export interface PolicyCheck {
  name: string;
  status: CheckStatus;
  detail: string;
}

export type Verdict = "cleared" | "approval" | "blocked";

export interface Receipt {
  id: string;
  at: number;
  kind: IntentKind;
  summary: string;
  amountUsd: number;
  feeUsd: number;
  status: "executed" | "blocked" | "rejected";
  checks: PolicyCheck[];
  /** keccak256 of the canonical payload — a real content hash */
  hash: string;
  /** real ECDSA signature of `hash` by the session key (empty if blocked) */
  sig: string;
  signer: string;
}

export interface ApprovalRequest {
  id: string;
  at: number;
  payload: IntentPayload;
  checks: PolicyCheck[];
  reason: string;
  status: "pending" | "approved" | "rejected" | "expired";
}

export interface Watcher {
  id: string;
  collectionId: string;
  collectionName: string;
  triggerEth: number;
  armedAt: number;
  active: boolean;
  lastFloorEth?: number;
  lastCheckAt?: number;
}

export interface DcaSchedule {
  id: string;
  sym: Sym;
  amountUsd: number;
  cadence: "daily" | "weekly";
  nextAt: number;
  createdAt: number;
}

export interface Trophy {
  id: string;
  collectionId: string;
  name: string;
  paidEth: number;
  paidUsd: number;
  at: number;
}

export interface SessionKeyState {
  privateKey: string;
  address: string;
  createdAt: number;
  expiresAt: number;
  scopes: Scope[];
  active: boolean;
}

export interface PolicyState {
  dailyLimitUsd: number;
  perTxCapUsd: number;
  spentTodayUsd: number;
  dayKey: string;
  killswitch: boolean;
  minFearGreed: number;
}

export interface ActivityEvent {
  id: string;
  at: number;
  kind: "System" | "Compile" | "Execution" | "Block" | "Approval" | "Watcher" | "Key";
  detail: string;
}

export interface EngineState {
  v: 1;
  balances: Record<Sym, number>;
  vaultUsd: number;
  trophies: Trophy[];
  watchers: Watcher[];
  dcas: DcaSchedule[];
  receipts: Receipt[];
  approvals: ApprovalRequest[];
  activity: ActivityEvent[];
  policy: PolicyState;
  sessionKey: SessionKeyState | null;
  treasuryUsd: number;
  volumeUsd: number;
}

export interface LiveData {
  prices: Partial<Record<Sym, number>>;
  floors: Record<string, { eth: number; usd: number }>;
  fearGreed: number | null;
}

export const FEE_RATE = 0.0025;

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toLowerCase();
}

export function dayKeyOf(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

/** Marketplace roster — the four mercenaries. */
export interface AgentListing {
  id: string;
  name: string;
  role: string;
  priceUsd: number;
  reputation: number;
  volume: string;
  capabilities: string[];
  /** which desk module this agent's craft actually powers */
  powers: string;
}

export const AGENT_ROSTER: AgentListing[] = [
  {
    id: "researchbot",
    name: "ResearchBot",
    role: "Market & sentiment oracle",
    priceUsd: 2.0,
    reputation: 99.4,
    volume: "$148,200",
    capabilities: ["Fear & Greed feed", "Momentum read", "Volume spikes"],
    powers: "Feeds the sentiment guard in every policy check.",
  },
  {
    id: "databot",
    name: "DataBot",
    role: "High-frequency DEX data",
    priceUsd: 0.5,
    reputation: 98.9,
    volume: "$89,400",
    capabilities: ["Live quotes", "Slippage check", "Liquidity depth"],
    powers: "Drives the Routes desk — Uniswap & Jupiter quotes.",
  },
  {
    id: "codebot",
    name: "CodeBot",
    role: "Contract audit & anti-rug",
    priceUsd: 10.0,
    reputation: 99.8,
    volume: "$312,900",
    capabilities: ["Honeypot test", "Tax analysis", "Owner privileges"],
    powers: "Runs the Scanner — live GoPlus security sweeps.",
  },
  {
    id: "designbot",
    name: "DesignBot",
    role: "Floor telemetry & metadata",
    priceUsd: 5.0,
    reputation: 97.5,
    volume: "$42,100",
    capabilities: ["Floor watch", "Rarity read", "Metadata pin"],
    powers: "Keeps the Snipe desk's floor feeds warm.",
  },
];

/** Curated NFT collections for the Snipe desk (CoinGecko NFT ids). */
export interface CollectionInfo {
  id: string;
  name: string;
  aliases: string[];
}

export const COLLECTIONS: CollectionInfo[] = [
  { id: "pudgy-penguins", name: "Pudgy Penguins", aliases: ["pudgy", "pudgy penguins", "penguins", "ppg"] },
  { id: "bored-ape-yacht-club", name: "Bored Ape Yacht Club", aliases: ["bayc", "bored ape", "bored apes", "apes"] },
  { id: "azuki", name: "Azuki", aliases: ["azuki"] },
  { id: "cryptopunks", name: "CryptoPunks", aliases: ["punks", "cryptopunks", "punk"] },
  { id: "milady-maker", name: "Milady Maker", aliases: ["milady", "miladys"] },
  { id: "doodles-official", name: "Doodles", aliases: ["doodles", "doodle"] },
  { id: "lil-pudgys", name: "Lil Pudgys", aliases: ["lil pudgys", "lil pudgy", "lilpudgys"] },
  { id: "mutant-ape-yacht-club", name: "Mutant Ape Yacht Club", aliases: ["mayc", "mutant ape", "mutants"] },
];
