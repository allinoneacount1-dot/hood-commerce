# HOOD COMMERCE — Commerce that hunts

Autonomous AI-agent commerce on Robinhood Chain. A natural-language intent is
compiled into a structured payload, drawn through a simulation and policy
gauntlet, and — only inside your guardrails — loosed as a settlement signed by
a real session key.

**Aim → Draw → Loose.**

## What is real

No mock data anywhere. Custody is a sandbox; everything else is live:

- **Prices & floors** — CoinGecko free API, including real NFT floor prices
  (Pudgy Penguins, BAYC, Azuki, CryptoPunks, Milady, Doodles, Lil Pudgys, MAYC)
- **Contract scanning** — GoPlus security intelligence (honeypot, taxes, owner
  privileges, mint authority), with honeypot.is as fallback
- **DEX quotes** — a genuine `eth_call` to Uniswap V3 QuoterV2 on Ethereum
  mainnet over a public RPC, and Jupiter's live routing on Solana
- **Sentiment** — alternative.me Fear & Greed index, enforced as a policy floor
- **Gas & blocks** — direct JSON-RPC reads from PublicNode
- **Cryptography** — session keys are real secp256k1 keypairs forged in the
  browser (viem); every settlement receipt carries a keccak256 content hash and
  a verifiable ECDSA signature

All APIs are free and keyless. No sign-up, no wallet, no environment variables.

## The desk

| Module | What it does |
| --- | --- |
| **Command** | Intent terminal — real NL parser → payload → policy checks → sandbox execution → signed receipt |
| **Snipe** | Live NFT floor watchers: "buy when floor < X ETH", evaluated against real floors |
| **Scanner** | Live GoPlus contract sweeps with a composite risk grade |
| **Routes** | Real Uniswap V3 + Jupiter quotes, spread vs mid |
| **Quiver** | Session keys: forge, scope, cap, sign, verify, revoke, killswitch |
| **Ledger** | Sandbox holdings priced live, signed receipts, fee accrual, export |

Guardrails: daily ceiling, per-shot cap, sentiment floor, scoped delegation,
24h key expiry, killswitch, and human-in-the-loop approvals above the cap.

## Stack

Next.js 14 (App Router, fully static) · TypeScript strict · Tailwind ·
three.js / react-three-fiber (the murmuration — 2,290 instanced agents forming
scroll-keyed formations) · framer-motion · Lenis · viem · TanStack Query.
Typography: Fraunces · Archivo · Martian Mono.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # production build (static)
```

Deploys on Vercel with zero configuration.

---

Sandbox protocol — simulated custody, live data, real signatures.
Robinhood Chain Testnet (7070).
