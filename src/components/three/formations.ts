/** Formation point-sets for the murmuration.
 *  Deterministic (seeded PRNG) so every visitor sees the same flock. */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Tri = [number, number, number, number, number, number];

function triArea([ax, ay, bx, by, cx, cy]: Tri): number {
  return Math.abs((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) / 2;
}

/** Sample n points uniformly across a triangle soup, with z jitter. */
function sampleTris(
  tris: Tri[],
  n: number,
  rng: () => number,
  zSpread: number,
  scale = 1,
  dx = 0,
  dy = 0,
): Float32Array {
  const areas = tris.map(triArea);
  const total = areas.reduce((a, b) => a + b, 0);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let r = rng() * total;
    let ti = 0;
    while (ti < areas.length - 1 && r > areas[ti]) {
      r -= areas[ti];
      ti++;
    }
    const [ax, ay, bx, by, cx, cy] = tris[ti];
    let u = rng();
    let v = rng();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const x = ax + (bx - ax) * u + (cx - ax) * v;
    const y = ay + (by - ay) * u + (cy - ay) * v;
    out[i * 3] = (x + dx) * scale;
    out[i * 3 + 1] = (y + dy) * scale;
    out[i * 3 + 2] = (rng() + rng() - 1) * zSpread;
  }
  return out;
}

/** Broadhead arrow silhouette (pointing +X): kite head, shaft, twin fletching. */
const ARROW_TRIS: Tri[] = [
  // kite head
  [5.4, 0, 2.2, 1.55, 0.95, 0],
  [5.4, 0, 0.95, 0, 2.2, -1.55],
  // shaft
  [-4.6, 0.2, 1.1, 0.2, 1.1, -0.2],
  [-4.6, 0.2, 1.1, -0.2, -4.6, -0.2],
  // fletching top
  [-2.9, 0.22, -3.55, 1.35, -4.65, 1.1],
  [-2.9, 0.22, -4.65, 1.1, -4.05, 0.22],
  // fletching bottom
  [-2.9, -0.22, -4.65, -1.1, -3.55, -1.35],
  [-2.9, -0.22, -4.05, -0.22, -4.65, -1.1],
];

export function formArrowHero(n: number): Float32Array {
  const rng = mulberry32(101);
  const pts = sampleTris(ARROW_TRIS, n, rng, 0.6, 1.02, 3.1, 0.9);
  return pts;
}

export function formStreams(n: number): Float32Array {
  // A braided slipstream on the right half — the reading column stays clear.
  const rng = mulberry32(202);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const strand = i % 2 === 0 ? 0 : Math.PI;
    const y = rng() * 15 - 7.5;
    const x = 7.4 + Math.sin(y * 0.5 + strand) * 1.15 + (rng() - 0.5) * 0.55;
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = Math.cos(y * 0.5 + strand) * 0.9 + (rng() + rng() - 1) * 0.5;
  }
  return out;
}

export function formTarget(n: number): Float32Array {
  const rng = mulberry32(303);
  const out = new Float32Array(n * 3);
  const rings = [
    { r: 0.5, w: 0.1, jitter: 0.3 },
    { r: 1.35, w: 0.2, jitter: 0.13 },
    { r: 2.45, w: 0.3, jitter: 0.13 },
    { r: 3.55, w: 0.4, jitter: 0.13 },
  ];
  for (let i = 0; i < n; i++) {
    let r = rng();
    let ring = rings[rings.length - 1];
    for (const rr of rings) {
      if (r < rr.w) {
        ring = rr;
        break;
      }
      r -= rr.w;
    }
    const a = rng() * Math.PI * 2;
    const rad =
      ring.r === 0.5 ? Math.sqrt(rng()) * ring.r : ring.r + (rng() + rng() - 1) * ring.jitter;
    out[i * 3] = Math.cos(a) * rad;
    out[i * 3 + 1] = Math.sin(a) * rad;
    out[i * 3 + 2] = (rng() + rng() - 1) * 0.4;
  }
  return out;
}

export function formPerimeter(n: number): Float32Array {
  const rng = mulberry32(404);
  const out = new Float32Array(n * 3);
  const tilt = 1.02;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2;
    const rad = 5.2 + (rng() + rng() - 1) * 0.22;
    const x = Math.cos(a) * rad;
    let y = Math.sin(a) * rad;
    let z = (rng() + rng() - 1) * 0.3;
    // tilt around X
    const y2 = y * ct - z * st;
    const z2 = y * st + z * ct;
    y = y2;
    z = z2;
    out[i * 3] = x;
    out[i * 3 + 1] = y * 0.6;
    out[i * 3 + 2] = z;
  }
  return out;
}

export function formGrid(n: number): Float32Array {
  const rng = mulberry32(505);
  const out = new Float32Array(n * 3);
  const cols = 62;
  const rows = Math.ceil(n / cols);
  const sx = 0.215;
  const sy = 0.215;
  const rx = -0.42;
  const cx = Math.cos(rx);
  const sxn = Math.sin(rx);
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = (c - (cols - 1) / 2) * sx + (rng() - 0.5) * 0.03;
    let y = (r - (rows - 1) / 2) * sy + (rng() - 0.5) * 0.03;
    let z = (rng() - 0.5) * 0.1;
    const y2 = y * cx - z * sxn;
    const z2 = y * sxn + z * cx;
    y = y2;
    z = z2;
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z - 2.6; // pushed back — a ghost ledger behind the cards
  }
  return out;
}

export function formArrowFinale(n: number): Float32Array {
  const rng = mulberry32(606);
  const flat = sampleTris(ARROW_TRIS, n, rng, 0.6, 1.05, 0.35, 0);
  // rotate -90°: point DOWN  (x,y) → (y, -x)
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = flat[i * 3 + 1];
    out[i * 3 + 1] = -flat[i * 3] + 1.1;
    out[i * 3 + 2] = flat[i * 3 + 2];
  }
  return out;
}

export interface FormationSet {
  forms: Float32Array[];
  /** per-instance stagger hash 0..1 */
  hash: Float32Array;
  /** per-instance drift phase */
  phase: Float32Array;
}

export function buildFormations(n: number): FormationSet {
  const rng = mulberry32(777);
  const hash = new Float32Array(n);
  const phase = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    hash[i] = rng();
    phase[i] = rng() * Math.PI * 2;
  }
  return {
    forms: [
      formArrowHero(n),
      formStreams(n),
      formTarget(n),
      formPerimeter(n),
      formGrid(n),
      formArrowFinale(n),
    ],
    hash,
    phase,
  };
}

/** Scroll keyframes: progress → formation index. */
export const FORM_KEYS: Array<{ p: number; f: number }> = [
  { p: 0.0, f: 0 },
  { p: 0.055, f: 0 },
  { p: 0.16, f: 1 },
  { p: 0.33, f: 1 },
  { p: 0.43, f: 2 },
  { p: 0.51, f: 2 },
  { p: 0.6, f: 3 },
  { p: 0.68, f: 3 },
  { p: 0.78, f: 4 },
  { p: 0.85, f: 4 },
  { p: 0.94, f: 5 },
  { p: 1.0, f: 5 },
];
