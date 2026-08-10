# HOOD COMMERCE — THE FLETCHER'S EXCHANGE
Design spec · 2026-08-10 · full overhaul of hood-commerce

## Thesis
Hood Commerce is an autonomous AI-agent commerce protocol: natural-language intent → compiled payload → simulation & guardrails → session-key execution → signed settlement. The overhaul expresses this as **archery**: Aim (compile) → Draw (simulate) → Loose (execute). Tagline: **"Commerce that hunts."**

Everything on the site must actually work. No mock data anywhere. Sandbox execution is honest (labeled SANDBOX), but every number on screen is live from free keyless APIs, and every receipt carries a real secp256k1 signature.

## Visual system
- Palette "Charred Umber × Ember": bg `#0B0908`, surface `#141110`, elevated `#1B1715`, hairline `#2A241F`, parchment text `#EDE6DA`, muted `#9A9188`, faint `#6E675F`, signal **EMBER `#FF4A1F`** (hover `#FF6A3D`, glow rgba), oxblood tint `#7A1F1B`, up `#8FA98B` moss, down `#B0685A` clay. No emerald, no navy, no purple gradients.
- Type: **Fraunces variable** (display, 600–900, tight, occasional WONK), **Archivo variable** (body), **Martian Mono variable** (labels/data, uppercase eyebrows, tabular numerals).
- Texture: film grain overlay, 1px hairlines, generous negative space, editorial numbering (01–09), corner tick marks on cards.
- Motion: Lenis smooth scroll; framer-motion reveals (wrapper-observed useInView pattern); ease `[0.16,1,0.3,1]`; preloader = bow-draw line + counter (sessionStorage-gated); ember cursor ring on desktop; route veil transitions.

## 3D — THE MURMURATION (landing only)
Fixed full-page canvas (z-1, content z-2 with translucent section tints). ~2,400 instanced cones ("agents") flock with per-instance noise drift and damped seek toward **scroll-keyed formations**:
hero ARROWHEAD (aimed at CTA) → side STREAMS along margins → TARGET rings (snipe section) → PERIMETER ring (guardrails) → LEDGER grid (settlement) → finale ARROWHEAD re-formed pointing at final CTA. Instance colors: parchment variance + ~8% ember embers. Cones orient along velocity. Gates: ≥768px, WebGL available, no prefers-reduced-motion; graceful static fallback. Desk has no 3D — instruments only.

## Information architecture
### Landing `/` — 9 acts
01 HERO wordmark + live tape (ETH/BTC/SOL, gas, F&G, block — all real) + CTAs "Open the desk" / doctrine
02 DOCTRINE pinned statement "Intent in. Arrow out." + AIM/DRAW/LOOSE triad
03 PIPELINE intent→brain→simulation→session key→settlement, with the REAL parser compiling rotating example intents live (typewriter → payload JSON)
04 SNIPE teaser — real NFT floors (CoinGecko NFT API) for curated collections + 24h change
05 GUARDRAILS policy matrix + session-key anatomy
06 SCANNER teaser — live GoPlus scan demo + risk grade
07 ROSTER four agents (ResearchBot, DataBot, CodeBot, DesignBot) as mercenary cards
08 BUSINESS fee share 0.25%, tiers Free/Pro/Enterprise
09 FINALE arrowhead re-forms → CTA
Footer: brand, ROBINHOOD CHAIN · TESTNET (7070), sandbox disclosure. No dead links.

### Desk `/desk` — 6 working modules (left rail + top status bar)
- **Command** `/desk` — intent terminal: REAL deterministic NL parser → payload JSON → policy checks vs live prices → verdict pass/approval/block → sandbox execution mutates balances, accrues 0.25% fee, emits receipt **signed with the session key (real ECDSA via viem)**. Right rail: telemetry (live-valued balances, spent-today bar), approval queue (human-in-the-loop for > per-tx cap), recent receipts.
- **Snipe** `/desk/snipe` — curated NFT collections with LIVE floor (ETH/USD, 24h%) from CoinGecko `/nfts/{id}`; arm watchers "buy when floor < X ETH"; runtime evaluates every 60s against real floors → execute/approval; distance-to-trigger meters.
- **Scanner** `/desk/scanner` — paste contract + chain (eth/bsc/base/arbitrum) → **GoPlus token_security live scan** → grade A–F + flags (honeypot, taxes, ownership, mintable, proxy, LP). Preset known tokens. Fallback honeypot.is.
- **Routes** `/desk/routes` — REAL quotes: EVM WETH→USDC via **on-chain eth_call to Uniswap V3 QuoterV2** (PublicNode RPC, viem), SOL→USDC via **Jupiter v6 quote API**; show out-amount, price impact, route hops, spread vs CoinGecko mid.
- **Quiver** `/desk/quiver` — session keys: generate real secp256k1 keypair in-browser (viem), address, 24h expiry, scopes, per-tx/daily caps, sign-test panel (sign message → verify → recovered address), revoke/regenerate, killswitch.
- **Ledger** `/desk/ledger` — sandbox balances (seed 2,500 USDC / 1.2 ETH / 30 SOL) valued live, allocation bars, receipts table with signature verify buttons, protocol fee accrual, total volume, JSON export, reset.

## Engine (local-first, PLU-proven architecture, rewritten for commerce)
`src/lib/engine/`: types, parser (intent → payload: SNIPE_NFT | SWAP | DCA | YIELD | AGENT_PAY with params + guards), policy (checks: killswitch, session active/expiry/scope, per-tx cap, daily limit w/ day rollover, category blocklist, optional risk/sentiment guards), keys (viem generate/sign/verify), store (localStorage `hood_engine_v1`, useSyncExternalStore), runtime (45s loop: refresh floors, evaluate watchers, DCA cadence, expire approvals/keys). Executions with amount > perTxCap → approval queue; approve executes, reject logs.

## Data sources (all free, keyless, CORS-open, called client-side)
CoinGecko simple/price + market_chart + `/nfts/{id}` (real floor prices) · alternative.me F&G · beaconcha.in gasnow · PublicNode RPCs (blockNumber, eth_call) · Uniswap V3 QuoterV2 `0x61fFE014bA17989E743c5F6cB21bF9697530B21e` · Jupiter v6 quote · GoPlus token_security (fallback honeypot.is) · DexScreener (spare). Every fetch has stale-while-error handling; panels degrade with honest "unreachable" states, never fake numbers.

## Stack changes
Keep: Next.js 14 App Router (Vercel zero-config), Tailwind 3, framer-motion, lucide, clsx/tailwind-merge, viem, @tanstack/react-query.
Remove: @rainbow-me/rainbowkit, wagmi, @x402/* (unused), mock Web3Provider, `ignoreBuildErrors` (TS must be strict-clean).
Add: three + @react-three/fiber@8 + @react-three/drei@9 (dynamic import, ssr:false), lenis, @fontsource-variable/{fraunces,archivo,martian-mono}, @types/three.
Branding: **HOOD COMMERCE** (drop CENTAURUS). Robinhood Chain Testnet (7070) identity retained. New arrowhead favicon.svg + og.png. README rewritten.

## Error handling & verification
- All API hooks: react-query retry 1, staleTime per source, `enabled` gating, no throw-to-UI — degraded chips instead.
- Parser: pure function, unit-tested via a script harness (representative intents → expected payloads).
- Verification gate: `tsc --noEmit` clean, `next build` clean, Playwright screenshots of landing (5 scroll positions) + all 6 desk modules, console-error audit, internal/external link audit, live-API smoke test in build env.
