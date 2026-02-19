import { config } from "dotenv";
import { resolve } from "path";
import { z } from "zod";

// Load .env from repo root
config({ path: resolve(process.cwd(), ".env") });

const envSchema = z.object({
  SOLANA_RPC_URL: z.string().url().default("https://api.devnet.solana.com"),
  ORBITFLARE_JETSTREAM_URL: z.string().default("ws://fra.jetstream.orbitflare.com"),
  ORBITFLARE_RPC_URL: z.string().url().optional(),
  TAPESTRY_API_KEY: z.string().default(""),
  TAPESTRY_BASE_URL: z.string().url().default("https://api.usetapestry.dev/v1"),
  TAPESTRY_NAMESPACE: z.string().default("blinkshare"),
  TREASURY_PUBKEY: z.string().default("11111111111111111111111111111111"),
  DATABASE_URL: z.string().default("file:./dev.db"),
  INDEXER_MODE: z.enum(["jetstream", "rpc-poll"]).default("jetstream"),
  POLL_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid indexer environment:", parsed.error.flatten().fieldErrors);
}

export const indexerEnv = parsed.success ? parsed.data : envSchema.parse({});
