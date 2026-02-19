import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { z } from "zod";
import {
  ACTIONS_CORS_HEADERS,
  MEMO_PROGRAM_ID,
  encodeMemo,
  generateNonce,
} from "@blinkshare/common";
import type {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from "@blinkshare/common";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

// --- CORS preflight ---
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: ACTIONS_CORS_HEADERS,
  });
}

// --- GET: return action metadata ---
const GetQuerySchema = z.object({
  profile: z.string().min(1, "profile parameter is required"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = GetQuerySchema.safeParse({
      profile: searchParams.get("profile"),
    });

    if (!query.success) {
      return NextResponse.json(
        { message: query.error.errors[0]?.message ?? "Invalid query" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const profileId = query.data.profile;

    // Try to find profile in local cache
    const cachedProfile = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: profileId },
          { username: profileId },
          { tapestryId: profileId },
        ],
      },
    });

    const displayName = cachedProfile?.displayName ?? cachedProfile?.username ?? profileId;
    const appUrl = env.NEXT_PUBLIC_APP_URL;

    const response: ActionGetResponse = {
      title: `Endorse ${displayName} on BlinkShare`,
      icon: `${appUrl}/icon.png`,
      description: `Send an onchain endorsement to ${displayName}. Your endorsement is recorded on Solana and stored in their Tapestry social graph, boosting their reputation karma.`,
      label: "Endorse",
      links: {
        actions: [
          {
            label: `Endorse ${displayName}`,
            href: `${appUrl}/api/actions/endorse?profile=${encodeURIComponent(profileId)}`,
          },
        ],
      },
    };

    return NextResponse.json(response, { headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    console.error("GET /api/actions/endorse error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}

// --- POST: build and return transaction ---
const PostBodySchema = z.object({
  account: z.string().min(1, "account (public key) is required"),
});

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileParam = searchParams.get("profile");
    if (!profileParam) {
      return NextResponse.json(
        { message: "profile query parameter is required" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = PostBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message ?? "Invalid body" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    const userPubkey = new PublicKey(parsed.data.account);
    const nonce = generateNonce();
    const ts = Math.floor(Date.now() / 1000);

    // Build memo instruction
    const memoText = encodeMemo({
      action: "endorse",
      profileId: profileParam,
      nonce,
      ts,
    });

    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: userPubkey, isSigner: true, isWritable: false }],
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from(memoText, "utf-8"),
    });

    const instructions: TransactionInstruction[] = [memoInstruction];

    // Optional: tiny SOL transfer for anti-spam
    const lamports = env.ENDORSE_SOL_LAMPORTS;
    if (lamports > 0) {
      const treasuryPubkey = new PublicKey(env.TREASURY_PUBKEY);
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: treasuryPubkey,
          lamports,
        })
      );
    }

    // Get recent blockhash
    const rpcUrl = env.SOLANA_RPC_URL;
    const connection = new Connection(rpcUrl, "confirmed");
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");

    // Build transaction
    const tx = new Transaction();
    tx.feePayer = userPubkey;
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.add(...instructions);

    // Serialize (no signatures — wallet will sign)
    const serialized = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    // Store pending endorsement in DB
    // First ensure profile exists
    let profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: profileParam },
          { username: profileParam },
          { tapestryId: profileParam },
        ],
      },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          walletAddress: profileParam,
          username: profileParam,
          tapestryId: profileParam,
        },
      });
    }

    const response: ActionPostResponse = {
      transaction: serialized,
      message: `Endorsing ${profile.displayName ?? profile.username ?? profileParam}`,
    };

    return NextResponse.json(response, { headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    console.error("POST /api/actions/endorse error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { message },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}
