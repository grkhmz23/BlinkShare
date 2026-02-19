import WebSocket from "ws";
import { MEMO_PROGRAM_ID, MEMO_PREFIX } from "@blinkshare/common";
import { indexerEnv } from "./env";
import { processTransaction, type ParsedTransaction } from "./processor";

export function startJetstreamIndexer(): void {
  const wsUrl = indexerEnv.ORBITFLARE_JETSTREAM_URL;
  console.log(`[jetstream] Connecting to ${wsUrl}...`);

  let ws: WebSocket;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.on("open", () => {
      console.log("[jetstream] Connected");

      // Subscribe to transactions involving the Memo program
      const subscribeMsg = JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "transactionSubscribe",
        params: [
          {
            accountInclude: [MEMO_PROGRAM_ID],
            // Also include treasury if configured
            ...(indexerEnv.TREASURY_PUBKEY !== "11111111111111111111111111111111"
              ? { accountInclude: [MEMO_PROGRAM_ID, indexerEnv.TREASURY_PUBKEY] }
              : {}),
          },
          {
            commitment: "confirmed",
            encoding: "jsonParsed",
            transactionDetails: "full",
            maxSupportedTransactionVersion: 0,
          },
        ],
      });

      ws.send(subscribeMsg);
      console.log("[jetstream] Subscribed to Memo program transactions");
    });

    ws.on("message", async (data: WebSocket.Data) => {
      try {
        const msg = JSON.parse(data.toString());

        // Handle subscription confirmation
        if (msg.result !== undefined && !msg.method) {
          console.log(`[jetstream] Subscription confirmed: ${msg.result}`);
          return;
        }

        // Handle transaction notification
        if (msg.method === "transactionNotification" && msg.params?.result) {
          const result = msg.params.result;
          await handleJetstreamTransaction(result);
        }
      } catch (err) {
        console.error("[jetstream] Message parse error:", err);
      }
    });

    ws.on("error", (err: Error) => {
      console.error("[jetstream] WebSocket error:", err.message);
    });

    ws.on("close", (code: number, reason: Buffer) => {
      console.warn(
        `[jetstream] Disconnected (code=${code}, reason=${reason.toString()}). Reconnecting in 5s...`
      );
      reconnectTimer = setTimeout(connect, 5000);
    });
  }

  connect();

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("[jetstream] Shutting down...");
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
    process.exit(0);
  });
}

interface JetstreamTxResult {
  signature: string;
  transaction: {
    message: {
      accountKeys: Array<{ pubkey: string; signer: boolean; writable: boolean }> | string[];
      instructions: Array<{
        programId: string;
        parsed?: { type: string; info: { message?: string } };
        data?: string;
      }>;
    };
  };
  meta?: {
    logMessages?: string[];
    err?: unknown;
  };
}

async function handleJetstreamTransaction(result: JetstreamTxResult): Promise<void> {
  try {
    const { signature, transaction, meta } = result;

    // Skip failed transactions
    if (meta?.err) return;

    // Look for our memo in log messages
    const logs = meta?.logMessages ?? [];
    let memoData: string | null = null;

    // Check logs for our prefix
    for (const log of logs) {
      if (log.includes(MEMO_PREFIX)) {
        const idx = log.indexOf(MEMO_PREFIX);
        // Extract until end of line or closing quote
        let end = log.length;
        const quoteIdx = log.indexOf('"', idx);
        if (quoteIdx > idx) end = quoteIdx;
        memoData = log.slice(idx, end);
        break;
      }
    }

    // Also check instruction data directly
    if (!memoData) {
      for (const ix of transaction.message.instructions) {
        if (ix.programId === MEMO_PROGRAM_ID || ix.parsed?.type === "memo") {
          const msg = ix.parsed?.info?.message ?? ix.data;
          if (msg && typeof msg === "string") {
            // Try decoding base64 if it doesn't start with prefix
            let decoded = msg;
            if (!msg.startsWith(MEMO_PREFIX)) {
              try {
                decoded = Buffer.from(msg, "base64").toString("utf-8");
              } catch {
                decoded = msg;
              }
            }
            if (decoded.startsWith(MEMO_PREFIX)) {
              memoData = decoded;
              break;
            }
          }
        }
      }
    }

    if (!memoData) return;

    // Find signer
    const accountKeys = transaction.message.accountKeys;
    let signerWallet = "";
    if (accountKeys.length > 0) {
      const first = accountKeys[0];
      signerWallet = typeof first === "string" ? first : first.pubkey;
    }

    if (!signerWallet) return;

    const parsed: ParsedTransaction = {
      signature,
      memoData,
      signerWallet,
      lamports: 0,
    };

    await processTransaction(parsed);
  } catch (err) {
    console.error("[jetstream] Transaction processing error:", err);
  }
}
