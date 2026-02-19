# BlinkShare — Onchain Reputation via Blinks

A reputation and endorsement layer stored in **Tapestry**, activated via **Solana Actions/Blinks**, and indexed with **OrbitFlare**.

Users endorse each other by signing a tiny Solana transaction (Memo + optional SOL transfer). The indexer verifies the tx onchain, records it in Tapestry's social graph, and increments the recipient's karma score — all without anyone needing to install a new app.

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  X / Discord │     │   apps/web       │     │  Tapestry    │
│  (Blink)     │────>│   Next.js        │────>│  Social Graph│
└──────────────┘     │   Actions API    │     └──────────────┘
                     └────────┬─────────┘              ^
                              │ tx signed              │
                              v                        │
                     ┌──────────────────┐              │
                     │  Solana          │              │
                     │  (Memo Program)  │              │
                     └────────┬─────────┘              │
                              │                        │
                     ┌────────v─────────┐              │
                     │ services/indexer  │──────────────┘
                     │ OrbitFlare        │
                     │ Jetstream / RPC   │
                     └──────────────────┘
```

## Repo Structure

```
apps/web/                  Next.js App Router (UI + API routes)
  src/app/                 Pages: landing, profile (/u/[handle]), generate blink
  src/app/api/actions/     Solana Actions endpoints (GET/POST/OPTIONS)
  src/app/actions.json/    actions.json for Blink self-registration
  src/lib/                 Prisma client, Tapestry client, env config
services/indexer/          OrbitFlare streaming consumer + RPC polling fallback
  src/jetstream.ts         WebSocket subscription to Jetstream
  src/rpc-poll.ts          Fallback: poll treasury via getSignaturesForAddress
  src/processor.ts         Memo decode -> DB write -> Tapestry event
packages/common/           Shared types, memo encode/decode, constants
prisma/schema.prisma       SQLite schema (Profile, Endorsement)
tests/                     Vitest tests
```

## Prerequisites

- Node.js >= 18
- pnpm >= 9

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url> blinkshare
cd blinkshare
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Your app URL (default: `http://localhost:3000`) |
| `SOLANA_RPC_URL` | Solana RPC endpoint (OrbitFlare or devnet) |
| `SOLANA_CLUSTER` | `devnet` or `mainnet-beta` |
| `TAPESTRY_API_KEY` | Get one at [usetapestry.dev](https://usetapestry.dev) |
| `TAPESTRY_BASE_URL` | Tapestry API base (default: `https://api.usetapestry.dev/v1`) |
| `TAPESTRY_NAMESPACE` | Your Tapestry namespace (default: `blinkshare`) |
| `TREASURY_PUBKEY` | Wallet to receive optional anti-spam SOL |
| `ENDORSE_SOL_LAMPORTS` | Lamports per endorsement (default: `5000` = 0.000005 SOL) |
| `ORBITFLARE_JETSTREAM_URL` | OrbitFlare Jetstream WebSocket URL |
| `ORBITFLARE_RPC_URL` | OrbitFlare RPC URL (fallback polling) |
| `DATABASE_URL` | SQLite path (default: `file:./dev.db`) |

### 3. Set up database

```bash
pnpm db:push      # Push schema to SQLite
# or
pnpm db:migrate   # Create migration files
```

### 4. Run the web app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Run the indexer

In a separate terminal:

```bash
pnpm indexer
```

The indexer defaults to Jetstream mode. To use RPC polling instead:

```bash
INDEXER_MODE=rpc-poll pnpm indexer
```

## Getting a Tapestry API Key

1. Go to [usetapestry.dev](https://usetapestry.dev)
2. Create an account and a new project
3. Copy the API key to your `.env` as `TAPESTRY_API_KEY`
4. Set your namespace (e.g., `blinkshare`) as `TAPESTRY_NAMESPACE`

## Testing the Blink

### Using Blinks Inspector

1. Start the web app (`pnpm dev`)
2. Go to `/generate`, enter a profile ID, and click "Generate Blink"
3. Copy the "Blink Inspector / Share URL" link
4. Open it — this uses [dial.to](https://dial.to) to render the Blink
5. Connect your wallet and click "Endorse"
6. The indexer will pick up the tx and increment karma

### Using the Actions API directly

```bash
# GET metadata
curl http://localhost:3000/api/actions/endorse?profile=alice

# POST to build transaction
curl -X POST http://localhost:3000/api/actions/endorse?profile=alice \
  -H "Content-Type: application/json" \
  -d '{"account":"<YOUR_WALLET_PUBKEY>"}'
```

### Verify actions.json

```bash
curl http://localhost:3000/actions.json
```

## Dialect Blink Registry (Optional)

To have your Blinks unfurl on Twitter/X, register with the Dialect Blink Registry:

1. Visit [dial.to/register](https://dial.to/register)
2. Submit your domain and actions.json URL
3. See the [Dialect docs](https://docs.dialect.to/blinks/blinks-provider/blink-registry) for details

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build for production |
| `pnpm indexer` | Run the indexer (Jetstream by default) |
| `pnpm indexer:dev` | Run the indexer with hot-reload |
| `pnpm db:push` | Push Prisma schema to database |
| `pnpm db:migrate` | Create and run migrations |
| `pnpm db:studio` | Open Prisma Studio GUI |
| `pnpm test` | Run tests |

## How It Works

1. **User creates a profile** — linked to their Solana wallet and stored in Tapestry
2. **Generates a Blink** — a Solana Action URL that can be shared anywhere
3. **Someone endorses** — clicks the Blink, wallet builds a tx with:
   - A Memo instruction: `blinkshare:v1:{"action":"endorse","profileId":"...","nonce":"...","ts":...}`
   - An optional tiny SOL transfer to the treasury (anti-spam)
4. **Indexer verifies** — subscribes to Memo program txs via OrbitFlare Jetstream, parses the memo, marks the endorsement verified in the DB
5. **Tapestry event** — the indexer writes an endorsement event to Tapestry's social graph
6. **Karma increments** — the target profile's karma score goes up

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Solana Actions** (`@solana/actions`, `@solana/web3.js`)
- **Tapestry** social graph API
- **OrbitFlare** Jetstream (WebSocket) + RPC polling fallback
- **Prisma** + SQLite
- **Vitest** for testing
