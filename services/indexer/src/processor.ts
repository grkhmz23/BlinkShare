import { decodeMemo, MEMO_PREFIX } from "@blinkshare/common";
import {
  upsertProfile,
  createPendingEndorsement,
  markEndorsementVerified,
  markEndorsementFailed,
  prisma,
} from "./db";
import { writeEndorsementToTapestry } from "./tapestry";

export interface ParsedTransaction {
  signature: string;
  memoData: string;
  signerWallet: string;
  lamports: number;
}

export async function processTransaction(tx: ParsedTransaction): Promise<void> {
  const { signature, memoData, signerWallet, lamports } = tx;

  // Check if already processed
  const existing = await prisma.endorsement.findUnique({
    where: { txSignature: signature },
  });
  if (existing && existing.status === "verified") {
    return;
  }

  // Decode memo
  const payload = decodeMemo(memoData);
  if (!payload) {
    console.warn(`[processor] Invalid memo in tx ${signature}`);
    return;
  }

  if (payload.action !== "endorse") {
    console.log(`[processor] Skipping non-endorse action: ${payload.action}`);
    return;
  }

  console.log(
    `[processor] Processing endorsement: ${signerWallet} -> ${payload.profileId} (tx: ${signature.slice(0, 8)}...)`
  );

  // Ensure profiles exist
  await upsertProfile(signerWallet);

  // Find or create target profile
  let targetProfile = await prisma.profile.findFirst({
    where: {
      OR: [
        { username: payload.profileId },
        { id: payload.profileId },
        { tapestryId: payload.profileId },
        { walletAddress: payload.profileId },
      ],
    },
  });

  if (!targetProfile) {
    targetProfile = await prisma.profile.create({
      data: {
        walletAddress: payload.profileId,
        username: payload.profileId,
      },
    });
  }

  // Create pending endorsement
  await createPendingEndorsement({
    txSignature: signature,
    fromWallet: signerWallet,
    toProfileId: targetProfile.id,
    nonce: payload.nonce,
    memo: memoData,
    lamports,
  });

  // Write to Tapestry
  const tapestryEventId = await writeEndorsementToTapestry({
    fromWallet: signerWallet,
    toProfileId: payload.profileId,
    txSignature: signature,
  });

  // Mark verified
  await markEndorsementVerified(signature, tapestryEventId);

  console.log(
    `[processor] Endorsement verified: ${signature.slice(0, 8)}... (karma+1 for ${targetProfile.username})`
  );
}

export function extractMemoFromLogs(logs: string[]): string | null {
  for (const log of logs) {
    // Memo program logs the data as "Program log: Memo (len X): <data>"
    if (log.includes(MEMO_PREFIX)) {
      const idx = log.indexOf(MEMO_PREFIX);
      return log.slice(idx);
    }
  }
  return null;
}
