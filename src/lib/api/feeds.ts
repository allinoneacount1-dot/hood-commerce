/** Small free feeds — alternative.me Fear & Greed. Keyless, CORS-open. */

export interface FearGreed {
  value: number;
  label: string;
}

export async function fetchFearGreed(): Promise<FearGreed> {
  const res = await fetch("https://api.alternative.me/fng/", { cache: "no-store" });
  if (!res.ok) throw new Error(`fng ${res.status}`);
  const j = await res.json();
  const row = j?.data?.[0];
  if (!row) throw new Error("fng empty");
  return { value: parseInt(row.value, 10), label: row.value_classification ?? "" };
}
