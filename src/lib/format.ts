export function fmtUsd(n: number | null | undefined, digits = 2): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (Math.abs(n) >= 1000)
    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function fmtNum(n: number | null | undefined, digits = 2): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function fmtEth(n: number | null | undefined, digits = 3): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toLocaleString("en-US", { maximumFractionDigits: digits })} ETH`;
}

export function shortHex(h: string, chars = 4): string {
  if (!h) return "—";
  return `${h.slice(0, chars + 2)}…${h.slice(-chars)}`;
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function clampText(t: string, max: number): string {
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
