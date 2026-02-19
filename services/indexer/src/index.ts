import { indexerEnv } from "./env";
import { startJetstreamIndexer } from "./jetstream";
import { startRpcPollIndexer } from "./rpc-poll";

async function main() {
  console.log("========================================");
  console.log("  BlinkShare Indexer");
  console.log(`  Mode: ${indexerEnv.INDEXER_MODE}`);
  console.log(`  RPC: ${indexerEnv.SOLANA_RPC_URL}`);
  console.log(`  Treasury: ${indexerEnv.TREASURY_PUBKEY}`);
  console.log("========================================");

  if (indexerEnv.INDEXER_MODE === "jetstream") {
    console.log(`[main] Starting Jetstream indexer (${indexerEnv.ORBITFLARE_JETSTREAM_URL})`);
    startJetstreamIndexer();
  } else {
    console.log("[main] Starting RPC polling indexer");
    startRpcPollIndexer();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
