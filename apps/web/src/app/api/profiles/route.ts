import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createProfile as tapestryCreateProfile } from "@/lib/tapestry";

const CreateProfileSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  username: z.string().min(1).max(32).optional(),
  displayName: z.string().max(64).optional(),
  bio: z.string().max(256).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { walletAddress, username, displayName, bio } = parsed.data;

    // Check existing
    const existing = await prisma.profile.findFirst({
      where: {
        OR: [
          { walletAddress },
          ...(username ? [{ username }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Profile already exists", profile: existing },
        { status: 409 }
      );
    }

    // Create in Tapestry (best-effort)
    let tapestryId: string | null = null;
    try {
      const tapProfile = await tapestryCreateProfile({
        id: username ?? walletAddress,
        walletAddress,
        properties: {
          ...(displayName ? { displayName } : {}),
          ...(bio ? { bio } : {}),
        },
      });
      tapestryId = tapProfile.id;
    } catch (err) {
      console.warn("Tapestry profile creation failed (continuing):", err);
    }

    const profile = await prisma.profile.create({
      data: {
        walletAddress,
        username: username ?? walletAddress.slice(0, 8),
        displayName: displayName ?? username ?? null,
        bio: bio ?? null,
        tapestryId,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    console.error("POST /api/profiles error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  const username = req.nextUrl.searchParams.get("username");

  if (!wallet && !username) {
    return NextResponse.json(
      { error: "Provide wallet or username query param" },
      { status: 400 }
    );
  }

  const profile = await prisma.profile.findFirst({
    where: {
      OR: [
        ...(wallet ? [{ walletAddress: wallet }] : []),
        ...(username ? [{ username }] : []),
      ],
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
