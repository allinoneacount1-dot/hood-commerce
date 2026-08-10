import {
  KIND_SCOPE,
  type EngineState,
  type IntentPayload,
  type LiveData,
  type PolicyCheck,
  type Sym,
  type Verdict,
} from "./types";

/** The perimeter. Every intent passes this gauntlet before anything settles.
 *  Checks read the real engine state and live market data — no theater. */

export interface Judgement {
  checks: PolicyCheck[];
  verdict: Verdict;
  /** resolved USD amount (floors resolved live, percentages resolved) */
  resolvedUsd: number;
  reason: string;
}

export function resolveAmountUsd(
  payload: IntentPayload,
  state: EngineState,
  live: LiveData,
): number | null {
  if (payload.kind === "SNIPE_NFT") {
    const floor = payload.collectionId ? live.floors[payload.collectionId] : undefined;
    if (!floor) return null;
    const eth = payload.immediate ? floor.eth : Math.min(floor.eth, payload.triggerEth ?? floor.eth);
    const ethUsd = live.prices.ETH;
    if (!ethUsd) return null;
    return eth * ethUsd;
  }
  if (payload.kind === "YIELD" && payload.amountUsd < 0) {
    const pct = -payload.amountUsd;
    return (state.balances.USDC * pct) / 100;
  }
  return payload.amountUsd;
}

function balanceFor(payload: IntentPayload, state: EngineState): { sym: Sym; qty: number } {
  if (payload.kind === "SNIPE_NFT") return { sym: "ETH", qty: state.balances.ETH };
  const sym = payload.fromSym ?? "USDC";
  return { sym, qty: state.balances[sym] };
}

export function judge(
  payload: IntentPayload,
  state: EngineState,
  live: LiveData,
): Judgement {
  const checks: PolicyCheck[] = [];
  const p = state.policy;
  let blockReason: string | null = null;

  const fail = (name: string, detail: string) => {
    checks.push({ name, status: "fail", detail });
    if (blockReason == null) blockReason = detail;
  };
  const pass = (name: string, detail: string) =>
    checks.push({ name, status: "pass", detail });
  const warn = (name: string, detail: string) =>
    checks.push({ name, status: "warn", detail });

  // 0) Killswitch
  if (p.killswitch) fail("Killswitch", "Killswitch engaged — every arrow stays in the quiver.");
  else pass("Killswitch", "Disengaged");

  // 1) Session key
  const key = state.sessionKey;
  if (!key) fail("Session key", "No session key forged. Visit the Quiver.");
  else if (!key.active) fail("Session key", "Session key revoked.");
  else if (Date.now() > key.expiresAt) fail("Session key", "Session key expired — forge a fresh one.");
  else pass("Session key", `Active · expires in ${Math.max(0, Math.round((key.expiresAt - Date.now()) / 3600000))}h`);

  // 2) Scope
  const scope = KIND_SCOPE[payload.kind];
  if (key && key.active && !key.scopes.includes(scope)) {
    fail("Scope", `Key not delegated for ${scope}.`);
  } else if (key) {
    pass("Scope", `${scope} delegated`);
  }

  // 3) Live price availability & resolved size
  const resolved = resolveAmountUsd(payload, state, live);
  if (resolved == null) {
    fail("Live oracle", "Market data unavailable — refusing to fire blind.");
  } else {
    pass("Live oracle", `Sized $${resolved.toFixed(2)} at live prices`);
  }
  const amountUsd = resolved ?? 0;

  // 4) Sentiment guard
  if (live.fearGreed != null) {
    if (live.fearGreed < p.minFearGreed) {
      fail("Sentiment guard", `Fear & Greed ${live.fearGreed} < floor ${p.minFearGreed} — market too fearful.`);
    } else {
      pass("Sentiment guard", `Fear & Greed ${live.fearGreed} ≥ ${p.minFearGreed}`);
    }
  } else {
    warn("Sentiment guard", "F&G feed unreachable — proceeding without it.");
  }

  // 5) Balance sufficiency
  if (resolved != null) {
    const { sym, qty } = balanceFor(payload, state);
    const price = sym === "USDC" ? 1 : live.prices[sym];
    const haveUsd = price != null ? qty * price : null;
    if (haveUsd == null) {
      warn("Balance", `No live price for ${sym}`);
    } else if (haveUsd < amountUsd) {
      fail("Balance", `Sandbox holds ${sym} worth $${haveUsd.toFixed(2)} — short of $${amountUsd.toFixed(2)}.`);
    } else {
      pass("Balance", `${sym} funds cover it ($${haveUsd.toFixed(2)} available)`);
    }
  }

  // 6) Daily limit
  const spentAfter = p.spentTodayUsd + amountUsd;
  if (resolved != null && spentAfter > p.dailyLimitUsd) {
    fail(
      "Daily limit",
      `$${amountUsd.toFixed(2)} would take today to $${spentAfter.toFixed(2)} — over the $${p.dailyLimitUsd.toFixed(0)} ceiling.`,
    );
  } else {
    pass("Daily limit", `$${p.spentTodayUsd.toFixed(2)} of $${p.dailyLimitUsd.toFixed(0)} spent today`);
  }

  // 7) Scan demand from language
  if (payload.requireScan) {
    warn("Audit demand", "Intent demands a security scan — Scanner desk covers ERC-20s.");
  }

  // 8) Human-in-the-loop — per-tx cap & explicit ask
  const capAsk = payload.approvalAboveUsd != null && amountUsd > payload.approvalAboveUsd;
  const capTx = amountUsd > p.perTxCapUsd;
  let verdict: Verdict = blockReason != null ? "blocked" : "cleared";
  let reason = blockReason ?? "All checks inside the perimeter.";
  if (verdict !== "blocked" && (capAsk || capTx)) {
    verdict = "approval";
    reason = capTx
      ? `$${amountUsd.toFixed(2)} exceeds the $${p.perTxCapUsd.toFixed(0)} per-shot cap — human confirmation required.`
      : `Your own guard asks for confirmation above $${payload.approvalAboveUsd!.toFixed(0)}.`;
    checks.push({
      name: "Human-in-the-loop",
      status: "warn",
      detail: reason,
    });
  } else if (verdict !== "blocked") {
    pass("Human-in-the-loop", `Under the $${p.perTxCapUsd.toFixed(0)} per-shot cap — cleared to fire`);
  }

  return { checks, verdict, resolvedUsd: amountUsd, reason };
}
