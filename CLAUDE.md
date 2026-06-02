# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm start          # Start production server
next lint          # Run ESLint
```

No test suite is configured.

## What This Is

NFT claiming/minting platform for the **SUI blockchain**. Users connect a SUI (or EVM) wallet, browse NFT collections, and claim/mint NFTs. Key integrations: Hashcase SDK for collection management, Mysten Enoki for ZK login (gasless transactions via sponsored transactions), and Supabase for user data.

## Architecture

**Routing**: Next.js App Router (`src/app/`). Main flows:
- `/collections` → browse collections
- `/collections/[name]/[id]/nfts/` → mint flows (free, randomized, upgradeable, paid)
- `/quests`, `/loyalties`, `/events` — engagement features
- `/api/execute`, `/api/sponsor` — server-side SUI transaction execution/sponsorship

**State**: Zustand store at `src/store/globalAppStore.ts` is the source of truth for user identity, wallet address, auth tokens, and NFT claiming state. React Query (`@tanstack/react-query`) handles server data caching for collections, quests, and loyalty data.

**Blockchain layer** (`src/utils/`):
- `contractHelperFunctions.ts` — builds and executes SUI Move call transactions (minting, claiming, upgrading NFTs)
- `contractAnalyzer.ts` — analyzes SUI contract structure
- `suiApi.ts` — wraps Mysten SUI RPC calls
- `pinata.ts` — IPFS metadata uploads via Pinata

**Wallet connectivity**:
- SUI wallets: `@mysten/dapp-kit` + `@suiet/wallet-kit` + Enoki (ZK login / passkey)
- EVM wallets: RainbowKit + wagmi + viem (see `src/providers/RainbowkitProvider.tsx`)
- Wallet state unified through `src/hooks/useWalletAddress.ts`

**Custom hooks** (`src/hooks/`): All data fetching goes through React Query hooks — `useCollections`, `useNFTClaiming`, `useNFTMinting`, `useQuests`, `useLoyalty`. Prefer these over direct API calls.

**Path alias**: `@/*` maps to `src/*` (configured in `tsconfig.json`).

## Key Patterns

- **Sponsored transactions**: Gasless minting uses Enoki's `useEnokiFlow()` → ZK proof → sponsored transaction submitted via `/api/sponsor` route.
- **Move calls**: Always build transaction blocks via `contractHelperFunctions.ts` helpers rather than inline PTB construction.
- **Image sources**: Remote images are served from S3, Pinata (`gateway.pinata.cloud`), and Unsplash — all whitelisted in `next.config.mjs`.
- **Environment**: See `.env` for required keys — RPC URLs per chain, Google/Twitter OAuth, Hashcase API credentials, Supabase URL/key, Enoki API key.
- **SVGs**: Imported as React components via `@svgr/webpack` (configured in `next.config.mjs`).
