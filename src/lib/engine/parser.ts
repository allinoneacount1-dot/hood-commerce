import {
  AGENT_ROSTER,
  COLLECTIONS,
  type IntentPayload,
  type ParseResult,
  type ParseStep,
  type Sym,
} from "./types";

/** The intent compiler. Deterministic natural language → structured payload.
 *  This is a real parser that runs in the page — not a canned demo. */

const SYM_ALIASES: Record<string, Sym> = {
  eth: "ETH",
  ethereum: "ETH",
  ether: "ETH",
  weth: "ETH",
  btc: "BTC",
  bitcoin: "BTC",
  wbtc: "BTC",
  sol: "SOL",
  solana: "SOL",
  usdc: "USDC",
  usd: "USDC",
  stable: "USDC",
  stables: "USDC",
  stablecoin: "USDC",
  dollar: "USDC",
  dollars: "USDC",
};

function findSym(word: string): Sym | null {
  return SYM_ALIASES[word.toLowerCase()] ?? null;
}

function parseUsd(text: string): number | null {
  // $1,500 | $1500 | $1.5k | 1500 usdc | 20 dollars
  const m =
    text.match(/\$\s?([\d,]+(?:\.\d+)?)\s?(k)?/i) ??
    text.match(/([\d,]+(?:\.\d+)?)\s?(k)?\s?(?:usdc|usd|dollars?)/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (Number.isNaN(n)) return null;
  return m[2] ? n * 1000 : n;
}

function parseEth(text: string): number | null {
  const m = text.match(/([\d.]+)\s?(?:eth|Ξ)/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isNaN(n) ? null : n;
}

function findCollection(text: string) {
  const t = text.toLowerCase();
  for (const c of COLLECTIONS) {
    if (c.aliases.some((a) => t.includes(a))) return c;
  }
  return null;
}

function findAgent(text: string) {
  const t = text.toLowerCase();
  return (
    AGENT_ROSTER.find((a) => t.includes(a.name.toLowerCase())) ??
    AGENT_ROSTER.find((a) => t.includes(a.id)) ??
    null
  );
}

export function parseIntent(raw: string): ParseResult {
  const text = raw.trim();
  const t = text.toLowerCase();
  const steps: ParseStep[] = [];
  const warnings: string[] = [];

  if (text.length < 6) {
    return {
      ok: false,
      payload: null,
      steps: [{ station: "LEXER", detail: "Intent too short to aim." }],
      warnings: ["Give the agent a full sentence — target, size, condition."],
    };
  }

  steps.push({
    station: "LEXER",
    detail: `${text.split(/\s+/).length} tokens · lowercased · symbols resolved`,
  });

  // ——— shared guard clauses ———
  const approvalM = t.match(
    /(?:ask|confirm|approval|check with me)[^.$]*\$\s?([\d,]+(?:\.\d+)?)/i,
  );
  const approvalAboveUsd = approvalM
    ? parseFloat(approvalM[1].replace(/,/g, ""))
    : undefined;
  const requireScan =
    /\b(rug|audit|verified?|honeypot|scan|safe|security|scam)\b/.test(t) || undefined;

  // ——— 1) NFT snipe / buy ———
  const collection = findCollection(t);
  const wantsNft = /\b(nft|floor|snipe|mint)\b/.test(t) || collection !== null;
  if (wantsNft && collection) {
    const triggerEth = parseEth(t);
    const conditional = /\b(if|when|drops?|below|under|falls?)\b/.test(t);
    if (!triggerEth && conditional) {
      warnings.push("Condition heard, but no ETH level found — add e.g. “below 8 ETH”.");
    }
    steps.push(
      { station: "TARGET", detail: `Collection resolved → ${collection.name} (${collection.id})` },
      {
        station: "CONDITION",
        detail: conditional
          ? `Armed trigger: floor < ${triggerEth ?? "?"} ETH`
          : "No condition — buy at current floor",
      },
    );
    if (requireScan)
      steps.push({ station: "GUARD", detail: "Language demands a security scan first" });
    const payload: IntentPayload = {
      kind: "SNIPE_NFT",
      summary: conditional
        ? `Snipe ${collection.name} when floor < ${triggerEth ?? "?"} ETH`
        : `Buy ${collection.name} at current floor`,
      collectionId: collection.id,
      collectionName: collection.name,
      triggerEth: triggerEth ?? undefined,
      immediate: !conditional,
      amountUsd: 0, // resolved at execution from the live floor
      approvalAboveUsd,
      requireScan,
    };
    return { ok: !conditional || triggerEth != null, payload, steps, warnings };
  }
  if (wantsNft && !collection) {
    return {
      ok: false,
      payload: null,
      steps: [
        ...steps,
        { station: "TARGET", detail: "No known collection in range" },
      ],
      warnings: [
        `Name a tracked collection: ${COLLECTIONS.slice(0, 4)
          .map((c) => c.name)
          .join(", ")}…`,
      ],
    };
  }

  // ——— 2) Agent hire / subscription ———
  const agent = findAgent(t);
  if (agent || /\b(hire|subscribe|subscription)\b/.test(t)) {
    if (!agent) {
      return {
        ok: false,
        payload: null,
        steps: [...steps, { station: "TARGET", detail: "No agent matched in roster" }],
        warnings: ["Roster: ResearchBot, DataBot, CodeBot, DesignBot."],
      };
    }
    const usd = parseUsd(t) ?? agent.priceUsd;
    const recurring = /\b(subscribe|monthly|\/mo|per month|feed)\b/.test(t);
    steps.push(
      { station: "TARGET", detail: `Agent resolved → ${agent.name} (${agent.role})` },
      { station: "SIZE", detail: `${recurring ? "Recurring" : "One-shot"} payment $${usd.toFixed(2)}` },
    );
    return {
      ok: true,
      payload: {
        kind: "AGENT_PAY",
        summary: `${recurring ? "Subscribe to" : "Hire"} ${agent.name} · $${usd.toFixed(2)}${recurring ? "/mo" : ""}`,
        agentId: agent.id,
        recurring,
        amountUsd: usd,
        approvalAboveUsd,
        requireScan,
      },
      steps,
      warnings,
    };
  }

  // ——— 3) DCA ———
  if (/\bdca\b|dollar[- ]cost/i.test(t)) {
    const usd = parseUsd(t);
    const symM = t.match(/(?:into|in|to|buy)\s+([a-z]+)/);
    const sym = symM ? findSym(symM[1]) : null;
    const cadence: "daily" | "weekly" = /\bweek/.test(t) ? "weekly" : "daily";
    if (!usd || !sym || sym === "USDC") {
      return {
        ok: false,
        payload: null,
        steps: [...steps, { station: "SIZE", detail: "DCA needs a $ amount and a target asset" }],
        warnings: ["Try: “DCA $50 into ETH every day”."],
      };
    }
    steps.push(
      { station: "TARGET", detail: `Accumulate ${sym} from USDC` },
      { station: "CADENCE", detail: `${cadence} tranche of $${usd.toFixed(0)}` },
    );
    return {
      ok: true,
      payload: {
        kind: "DCA",
        summary: `DCA $${usd.toFixed(0)} → ${sym} · ${cadence}`,
        fromSym: "USDC",
        toSym: sym,
        amountUsd: usd,
        cadence,
        approvalAboveUsd,
        requireScan,
      },
      steps,
      warnings,
    };
  }

  // ——— 4) Yield ———
  if (/\byield|apy|vault|lend|staking|stake\b/.test(t)) {
    const usd = parseUsd(t);
    const pctM = t.match(/([\d.]+)\s?%/);
    const pct = pctM ? parseFloat(pctM[1]) : null;
    if (!usd && !pct) {
      return {
        ok: false,
        payload: null,
        steps: [...steps, { station: "SIZE", detail: "No size found for the yield move" }],
        warnings: ["Give a size: “allocate $400 USDC into the vault” or “20% of stables”."],
      };
    }
    steps.push({
      station: "SIZE",
      detail: usd ? `Fixed $${usd.toFixed(0)} of USDC` : `${pct}% of USDC balance`,
    });
    if (requireScan)
      steps.push({ station: "GUARD", detail: "Only audited venues — scan demanded" });
    return {
      ok: true,
      payload: {
        kind: "YIELD",
        summary: usd
          ? `Move $${usd.toFixed(0)} USDC into the yield vault`
          : `Move ${pct}% of USDC into the yield vault`,
        fromSym: "USDC",
        amountUsd: usd ?? -(pct as number), // negative = percentage, resolved at execution
        approvalAboveUsd,
        requireScan,
      },
      steps,
      warnings,
    };
  }

  // ——— 5) Swap / buy / sell ———
  if (/\b(swap|buy|sell|convert|allocate|rotate)\b/.test(t)) {
    const usd = parseUsd(t);
    const syms: Sym[] = [];
    for (const w of t.replace(/[^a-z ]/g, " ").split(/\s+/)) {
      const s = findSym(w);
      if (s && !syms.includes(s)) syms.push(s);
    }
    const selling = /\bsell\b/.test(t);
    let fromSym: Sym | undefined;
    let toSym: Sym | undefined;
    if (syms.length >= 2) {
      [fromSym, toSym] = syms as [Sym, Sym];
    } else if (syms.length === 1) {
      if (selling) {
        fromSym = syms[0];
        toSym = "USDC";
      } else {
        fromSym = "USDC";
        toSym = syms[0];
      }
    }
    if (!usd || !fromSym || !toSym || fromSym === toSym) {
      return {
        ok: false,
        payload: null,
        steps: [...steps, { station: "ROUTE", detail: "Could not resolve a from → to pair with size" }],
        warnings: ["Try: “Swap $250 of USDC to ETH” or “Sell 300 dollars of SOL”."],
      };
    }
    steps.push(
      { station: "ROUTE", detail: `${fromSym} → ${toSym} sized $${usd.toFixed(0)}` },
      { station: "VENUE", detail: toSym === "SOL" || fromSym === "SOL" ? "Jupiter route (SVM)" : "Uniswap V3 route (EVM)" },
    );
    return {
      ok: true,
      payload: {
        kind: "SWAP",
        summary: `Swap $${usd.toFixed(0)} ${fromSym} → ${toSym}`,
        fromSym,
        toSym,
        amountUsd: usd,
        approvalAboveUsd,
        requireScan,
      },
      steps,
      warnings,
    };
  }

  return {
    ok: false,
    payload: null,
    steps: [...steps, { station: "INTENT", detail: "No executable intent recognized" }],
    warnings: [
      "The agent hunts five things: NFT snipes, swaps, DCA, yield moves, agent hires.",
    ],
  };
}

/** Example intents used by the landing pipeline demo — all parse for real. */
export const EXAMPLE_INTENTS = [
  "Snipe Pudgy Penguins if the floor drops below 8.5 ETH, but scan for rugs first",
  "Swap $250 of USDC to ETH and ask me before anything over $200",
  "DCA $50 into SOL every day",
  "Hire CodeBot to audit the contract before the buy ($10)",
];
