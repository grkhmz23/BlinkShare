import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function upsertProfile(walletAddress: string) {
  return prisma.profile.upsert({
    where: { walletAddress },
    update: {},
    create: {
      walletAddress,
      username: walletAddress.slice(0, 8),
    },
  });
}

export async function createPendingEndorsement(params: {
  txSignature: string;
  fromWallet: string;
  toProfileId: string;
  nonce: string;
  memo: string;
  lamports: number;
}) {
  return prisma.endorsement.upsert({
    where: { txSignature: params.txSignature },
    update: {},
    create: {
      ...params,
      status: "pending",
    },
  });
}

export async function markEndorsementVerified(
  txSignature: string,
  tapestryEventId: string | null
) {
  const endorsement = await prisma.endorsement.update({
    where: { txSignature },
    data: {
      status: "verified",
      tapestryEventId,
      verifiedAt: new Date(),
    },
  });

  // Increment karma
  await prisma.profile.update({
    where: { id: endorsement.toProfileId },
    data: { karma: { increment: 1 } },
  });

  return endorsement;
}

export async function markEndorsementFailed(txSignature: string) {
  return prisma.endorsement.update({
    where: { txSignature },
    data: { status: "failed" },
  });
}
