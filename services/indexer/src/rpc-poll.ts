import { Connection, PublicKey } from "@solana/web3.js";
import { MEMO_PROGRAM_ID, MEMO_PREFIX } from "@blinkshare/common";
import { indexerEnv } from "./env";
import { processTransaction, type ParsedTransaction } from "./processor";

export function startRpcPollIndexer(): void {
  const rpcUrl = indexerEnv.ORBITFLARE_RPC_URL ?? indexerEnv.SOLANA_RPC_URL;
  const connection = new Connection(rpcUrl, "confirmed");
  const interval = indexerEnv.POLL_INTERVAL_MS;

  // Track the last seen signature to avoid reprocessing
  let lastSignature: string | undefined;

  console.log(`[rpc-poll] Polling ${rpcUrl} every ${interval}ms`);
  console.log(`[rpc-poll] Watching Treasury: ${indexerEnv.TREASURY_PUBKEY}`);

  async function poll() {
    try {
      const treasuryPubkey = new PublicKey(indexerEnv.TREASURY_PUBKEY);

      // Get recent signatures for treasury address
      const signatures = await connection.getSignaturesForAddress(
        treasuryPubkey,
        {
          limit: 20,
          ...(lastSignature ? { until: lastSignature } : {}),
        },
        "confirmed"
      );

      if (signatures.length === 0) return;

      // Update last signature to the most recent
      lastSignature = signatures[0]!.signature;

      // Process in chronological order (oldest first)
      for (const sigInfo of signatures.reverse()) {
        if (sigInfo.err) continue;

        try {
          const tx = await connection.getParsedTransaction(
            sigInfo.signature,
            {
              maxSupportedTransactionVersion: 0,
              commitment: "confirmed",
            }
          );

          if (!tx?.meta || tx.meta.err) continue;

          // Look for our memo
          const logs = tx.meta.logMessages ?? [];
          let memoData: string | null = null;

          for (const log of logs) {
            if (log.includes(MEMO_PREFIX)) {
              const idx = log.indexOf(MEMO_PREFIX);
              memoData = log.slice(idx);
              // Clean trailing characters
              const braceEnd = memoData.lastIndexOf("}");
              if (braceEnd > 0) {
                memoData = memoData.slice(0, braceEnd + 1);
                // Re-add prefix if it was part of a larger string
                if (!memoData.startsWith(MEMO_PREFIX)) {
                  memoData = null;
                }
              }
              break;
            }
          }

          // Also check instructions
          if (!memoData && tx.transaction.message.instructions) {
            for (const ix of tx.transaction.message.instructions) {
              if ("programId" in ix && ix.programId.toBase58() === MEMO_PROGRAM_ID) {
                if ("parsed" in ix && typeof ix.parsed === "string") {
                  if (ix.parsed.startsWith(MEMO_PREFIX)) {
                    memoData = ix.parsed;
                    break;
                  }
                }
              }
            }
          }

          if (!memoData) continue;

          // Get signer
          const accountKeys = tx.transaction.message.accountKeys;
          const signer = accountKeys.find((k) => k.signer);
          if (!signer) continue;

          const parsed: ParsedTransaction = {
            signature: sigInfo.signature,
            memoData,
            signerWallet: signer.pubkey.toBase58(),
            lamports: 0,
          };

          await processTransaction(parsed);
        } catch (err) {
          console.error(
            `[rpc-poll] Error processing tx ${sigInfo.signature}:`,
            err
          );
        }
      }
    } catch (err) {
      console.error("[rpc-poll] Poll error:", err);
    }
  }

  // Initial poll
  poll();

  // Recurring poll
  const timer = setInterval(poll, interval);

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("[rpc-poll] Shutting down...");
    clearInterval(timer);
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    clearInterval(timer);
    process.exit(0);
  });
}
