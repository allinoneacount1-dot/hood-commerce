import {
  FEE_RATE,
  dayKeyOf,
  uid,
  type ActivityEvent,
  type ApprovalRequest,
  type DcaSchedule,
  type EngineState,
  type IntentPayload,
  type LiveData,
  type PolicyCheck,
  type Receipt,
  type Scope,
  type Sym,
  type Watcher,
} from "./types";
import { judge, resolveAmountUsd } from "./policy";
import { forgeSessionKey, payloadHash, signHash } from "./keys";

/** Local-first engine store. localStorage + subscriptions.
 *  Single source of truth for the whole /desk surface. */

const KEY = "hood_engine_v1";
const MAX_RECEIPTS = 120;
const MAX_ACTIVITY = 250;

function seed(): EngineState {
  const now = Date.now();
  const key = forgeSessionKey();
  return {
    v: 1,
    balances: { ETH: 1.2, BTC: 0.015, SOL: 30, USDC: 2500 },
    vaultUsd: 0,
    trophies: [],
    watchers: [],
    dcas: [],
    receipts: [],
    approvals: [],
    activity: [
      {
        id: uid(),
        at: now,
        kind: "Key" as const,
        detail: `Session key forged for the sandbox · ${key.address.slice(0, 8)}… · 24h scope`,
      },
      {
        id: uid(),
        at: now,
        kind: "System" as const,
        detail: "Sandbox armed. Balances are simulated; every price, floor and quote on screen is live.",
      },
    ],
    policy: {
      dailyLimitUsd: 1500,
      perTxCapUsd: 400,
      spentTodayUsd: 0,
      dayKey: dayKeyOf(now),
      killswitch: false,
      minFearGreed: 12,
    },
    sessionKey: key,
    treasuryUsd: 0,
    volumeUsd: 0,
  };
}

function normalize(s: EngineState): EngineState {
  const today = dayKeyOf(Date.now());
  if (s.policy.dayKey !== today) {
    s.policy = { ...s.policy, dayKey: today, spentTodayUsd: 0 };
  }
  if (s.sessionKey && s.sessionKey.active && Date.now() > s.sessionKey.expiresAt) {
    s.sessionKey = { ...s.sessionKey, active: false };
    s.activity = [
      {
        id: uid(),
        at: Date.now(),
        kind: "Key" as const,
        detail: "Session key expired — forge a fresh one in the Quiver.",
      },
      ...s.activity,
    ].slice(0, MAX_ACTIVITY);
  }
  return s;
}

function load(): EngineState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as EngineState;
      if (s && s.v === 1) return normalize(s);
    }
  } catch {
    /* fresh */
  }
  return seed();
}

let state: EngineState | null = null;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage blocked — stay in memory */
  }
}

export function getEngineState(): EngineState {
  if (!state) state = typeof window === "undefined" ? seed() : load();
  return state;
}

export function subscribeEngine(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function mutateEngine(fn: (s: EngineState) => void) {
  const s = getEngineState();
  fn(s);
  state = { ...normalize(s) };
  persist();
  listeners.forEach((l) => l());
}

/* ————— activity ————— */

export function logActivity(kind: ActivityEvent["kind"], detail: string) {
  mutateEngine((s) => {
    s.activity = [{ id: uid(), at: Date.now(), kind, detail }, ...s.activity].slice(
      0,
      MAX_ACTIVITY,
    );
  });
}

/* ————— keys & policy ————— */

export function forgeKey(scopes?: Scope[]) {
  mutateEngine((s) => {
    s.sessionKey = forgeSessionKey(scopes ?? s.sessionKey?.scopes);
  });
  const k = getEngineState().sessionKey!;
  logActivity("Key", `New session key forged · ${k.address.slice(0, 10)}… · expires in 24h`);
}

export function revokeKey() {
  mutateEngine((s) => {
    if (s.sessionKey) s.sessionKey = { ...s.sessionKey, active: false };
  });
  logActivity("Key", "Session key revoked by hand.");
}

export function setKeyScopes(scopes: Scope[]) {
  mutateEngine((s) => {
    if (s.sessionKey) s.sessionKey = { ...s.sessionKey, scopes };
  });
}

export function setPolicy(patch: Partial<EngineState["policy"]>) {
  mutateEngine((s) => {
    s.policy = { ...s.policy, ...patch };
  });
}

export function toggleKillswitch() {
  const now = !getEngineState().policy.killswitch;
  mutateEngine((s) => {
    s.policy = { ...s.policy, killswitch: now };
  });
  logActivity("System", now ? "KILLSWITCH ENGAGED — all execution halted." : "Killswitch released.");
}

/* ————— watchers & schedules ————— */

export function armWatcher(collectionId: string, collectionName: string, triggerEth: number) {
  mutateEngine((s) => {
    s.watchers = [
      {
        id: uid(),
        collectionId,
        collectionName,
        triggerEth,
        armedAt: Date.now(),
        active: true,
      },
      ...s.watchers.filter((w) => !(w.collectionId === collectionId && w.active)),
    ].slice(0, 12);
  });
  logActivity("Watcher", `Watcher armed · ${collectionName} < ${triggerEth} ETH`);
}

export function removeWatcher(id: string) {
  mutateEngine((s) => {
    s.watchers = s.watchers.filter((w) => w.id !== id);
  });
}

export function removeDca(id: string) {
  mutateEngine((s) => {
    s.dcas = s.dcas.filter((d) => d.id !== id);
  });
}

/* ————— execution ————— */

function cadenceMs(c: "daily" | "weekly"): number {
  return c === "daily" ? 86_400_000 : 604_800_000;
}

async function settle(
  payload: IntentPayload,
  live: LiveData,
  checks: PolicyCheck[],
  amountUsd: number,
): Promise<Receipt> {
  const at = Date.now();
  const hash = payloadHash(payload, at);
  const key = getEngineState().sessionKey;
  const sig = key ? await signHash(key, hash) : "";
  const feeUsd = amountUsd * FEE_RATE;

  const receipt: Receipt = {
    id: uid(),
    at,
    kind: payload.kind,
    summary: payload.summary,
    amountUsd,
    feeUsd,
    status: "executed",
    checks,
    hash,
    sig,
    signer: key?.address ?? "",
  };

  mutateEngine((s) => {
    const px = (sym: Sym) => (sym === "USDC" ? 1 : live.prices[sym] ?? 0);

    if (payload.kind === "SWAP" || payload.kind === "DCA") {
      const from = payload.fromSym!;
      const to = payload.toSym!;
      if (px(from) > 0 && px(to) > 0) {
        s.balances[from] = Math.max(0, s.balances[from] - amountUsd / px(from));
        s.balances[to] += (amountUsd * (1 - FEE_RATE)) / px(to);
      }
    } else if (payload.kind === "SNIPE_NFT") {
      const floor = live.floors[payload.collectionId!];
      const eth = floor?.eth ?? amountUsd / (px("ETH") || 1);
      s.balances.ETH = Math.max(0, s.balances.ETH - eth);
      s.trophies = [
        {
          id: uid(),
          collectionId: payload.collectionId!,
          name: payload.collectionName ?? payload.collectionId!,
          paidEth: eth,
          paidUsd: amountUsd,
          at,
        },
        ...s.trophies,
      ].slice(0, 24);
    } else if (payload.kind === "YIELD") {
      s.balances.USDC = Math.max(0, s.balances.USDC - amountUsd);
      s.vaultUsd += amountUsd * (1 - FEE_RATE);
    } else if (payload.kind === "AGENT_PAY") {
      s.balances.USDC = Math.max(0, s.balances.USDC - amountUsd);
    }

    if (payload.kind === "DCA" && payload.cadence) {
      const exists = s.dcas.some(
        (d) => d.sym === payload.toSym && d.cadence === payload.cadence,
      );
      if (!exists) {
        s.dcas = [
          {
            id: uid(),
            sym: payload.toSym!,
            amountUsd,
            cadence: payload.cadence,
            nextAt: at + cadenceMs(payload.cadence),
            createdAt: at,
          },
          ...s.dcas,
        ].slice(0, 8);
      } else {
        s.dcas = s.dcas.map((d) =>
          d.sym === payload.toSym && d.cadence === payload.cadence
            ? { ...d, nextAt: at + cadenceMs(payload.cadence) }
            : d,
        );
      }
    }

    s.treasuryUsd += feeUsd;
    s.volumeUsd += amountUsd;
    s.policy = { ...s.policy, spentTodayUsd: s.policy.spentTodayUsd + amountUsd };
    s.receipts = [receipt, ...s.receipts].slice(0, MAX_RECEIPTS);
    s.activity = [
      {
        id: uid(),
        at,
        kind: "Execution" as const,
        detail: `LOOSED · ${payload.summary} · $${amountUsd.toFixed(2)} · fee $${feeUsd.toFixed(2)} · sig ${sig.slice(0, 12)}…`,
      },
      ...s.activity,
    ].slice(0, MAX_ACTIVITY);
  });

  return receipt;
}

export interface ExecuteResult {
  verdict: "cleared" | "approval" | "blocked";
  checks: PolicyCheck[];
  reason: string;
  receipt?: Receipt;
  approval?: ApprovalRequest;
}

export async function executePayload(
  payload: IntentPayload,
  live: LiveData,
): Promise<ExecuteResult> {
  const s = getEngineState();
  const { checks, verdict, resolvedUsd, reason } = judge(payload, s, live);

  if (verdict === "blocked") {
    const at = Date.now();
    const receipt: Receipt = {
      id: uid(),
      at,
      kind: payload.kind,
      summary: payload.summary,
      amountUsd: resolvedUsd,
      feeUsd: 0,
      status: "blocked",
      checks,
      hash: payloadHash(payload, at),
      sig: "",
      signer: "",
    };
    mutateEngine((st) => {
      st.receipts = [receipt, ...st.receipts].slice(0, MAX_RECEIPTS);
      st.activity = [
        { id: uid(), at, kind: "Block" as const, detail: `HELD · ${payload.summary} — ${reason}` },
        ...st.activity,
      ].slice(0, MAX_ACTIVITY);
    });
    return { verdict, checks, reason, receipt };
  }

  if (verdict === "approval") {
    const approval: ApprovalRequest = {
      id: uid(),
      at: Date.now(),
      payload,
      checks,
      reason,
      status: "pending",
    };
    mutateEngine((st) => {
      st.approvals = [approval, ...st.approvals].slice(0, 40);
      st.activity = [
        {
          id: uid(),
          at: approval.at,
          kind: "Approval" as const,
          detail: `DRAWN & HELD · ${payload.summary} — ${reason}`,
        },
        ...st.activity,
      ].slice(0, MAX_ACTIVITY);
    });
    return { verdict, checks, reason, approval };
  }

  const receipt = await settle(payload, live, checks, resolvedUsd);
  return { verdict, checks, reason, receipt };
}

export async function decideApproval(
  id: string,
  approve: boolean,
  live: LiveData,
): Promise<void> {
  const s = getEngineState();
  const req = s.approvals.find((a) => a.id === id);
  if (!req || req.status !== "pending") return;

  mutateEngine((st) => {
    st.approvals = st.approvals.map((a) =>
      a.id === id ? { ...a, status: approve ? "approved" : "rejected" } : a,
    );
  });

  if (!approve) {
    logActivity("Approval", `REFUSED by hand · ${req.payload.summary}`);
    return;
  }

  // Re-resolve at current live prices, then settle regardless of the cap
  // (human confirmation IS the override), but never through a hard block.
  const fresh = getEngineState();
  const resolved = resolveAmountUsd(req.payload, fresh, live);
  if (resolved == null) {
    logActivity("Block", `Approved but oracle went dark · ${req.payload.summary} — not settled.`);
    return;
  }
  await settle(req.payload, live, req.checks, resolved);
}

export function expireApprovals() {
  const now = Date.now();
  const s = getEngineState();
  if (!s.approvals.some((a) => a.status === "pending" && now - a.at > 600_000)) return;
  mutateEngine((st) => {
    st.approvals = st.approvals.map((a) =>
      a.status === "pending" && now - a.at > 600_000 ? { ...a, status: "expired" } : a,
    );
  });
  logActivity("Approval", "Stale approval(s) expired after 10 minutes at full draw.");
}

/* ————— watchers & schedules: runtime hooks ————— */

export async function fireWatcher(w: Watcher, live: LiveData): Promise<void> {
  mutateEngine((s) => {
    s.watchers = s.watchers.map((x) => (x.id === w.id ? { ...x, active: false } : x));
  });
  const floor = live.floors[w.collectionId];
  logActivity(
    "Watcher",
    `TRIGGER · ${w.collectionName} floor ${floor?.eth.toFixed(2) ?? "?"} ETH ≤ ${w.triggerEth} ETH — loosing.`,
  );
  await executePayload(
    {
      kind: "SNIPE_NFT",
      summary: `Snipe ${w.collectionName} · floor hit ${floor?.eth.toFixed(2) ?? "?"} ETH`,
      collectionId: w.collectionId,
      collectionName: w.collectionName,
      triggerEth: w.triggerEth,
      immediate: true,
      amountUsd: 0,
    },
    live,
  );
}

export function markWatcherCheck(id: string, floorEth: number) {
  mutateEngine((s) => {
    s.watchers = s.watchers.map((w) =>
      w.id === id ? { ...w, lastFloorEth: floorEth, lastCheckAt: Date.now() } : w,
    );
  });
}

export async function runDueDcas(live: LiveData): Promise<void> {
  const now = Date.now();
  const due = getEngineState().dcas.filter((d) => d.nextAt <= now);
  for (const d of due) {
    mutateEngine((s) => {
      s.dcas = s.dcas.map((x) =>
        x.id === d.id ? { ...x, nextAt: now + cadenceMs(d.cadence) } : x,
      );
    });
    await executePayload(
      {
        kind: "DCA",
        summary: `DCA tranche $${d.amountUsd.toFixed(0)} → ${d.sym} (${d.cadence})`,
        fromSym: "USDC",
        toSym: d.sym,
        amountUsd: d.amountUsd,
        cadence: d.cadence,
      },
      live,
    );
  }
}

/* ————— misc ————— */

export function resetEngine() {
  state = seed();
  persist();
  listeners.forEach((l) => l());
}

export function exportReceipts(): string {
  const s = getEngineState();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      signer: s.sessionKey?.address ?? null,
      receipts: s.receipts,
      treasuryUsd: s.treasuryUsd,
      volumeUsd: s.volumeUsd,
    },
    null,
    2,
  );
}
