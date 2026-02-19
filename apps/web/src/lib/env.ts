interface AppEnv {
  NEXT_PUBLIC_APP_URL: string;
  SOLANA_RPC_URL: string;
  SOLANA_CLUSTER: string;
  TAPESTRY_API_KEY: string;
  TAPESTRY_BASE_URL: string;
  TAPESTRY_NAMESPACE: string;
  TREASURY_PUBKEY: string;
  ENDORSE_SOL_LAMPORTS: number;
  DATABASE_URL: string;
}

function getEnv(): AppEnv {
  return {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
    SOLANA_CLUSTER: process.env.SOLANA_CLUSTER ?? "devnet",
    TAPESTRY_API_KEY: process.env.TAPESTRY_API_KEY ?? "",
    TAPESTRY_BASE_URL: process.env.TAPESTRY_BASE_URL ?? "https://api.usetapestry.dev/v1",
    TAPESTRY_NAMESPACE: process.env.TAPESTRY_NAMESPACE ?? "blinkshare",
    TREASURY_PUBKEY: process.env.TREASURY_PUBKEY ?? "11111111111111111111111111111111",
    ENDORSE_SOL_LAMPORTS: Number(process.env.ENDORSE_SOL_LAMPORTS ?? 5000),
    DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
  };
}

export const env = getEnv();
