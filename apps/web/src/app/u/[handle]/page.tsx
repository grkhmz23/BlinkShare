import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { notFound } from "next/navigation";
import ProfileOwnerBadge from "@/components/ProfileOwnerBadge";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;

  // Look up profile by username, id, or tapestryId
  const profile = await prisma.profile.findFirst({
    where: {
      OR: [
        { username: handle },
        { id: handle },
        { tapestryId: handle },
        { walletAddress: handle },
      ],
    },
    include: {
      endorsementsReceived: {
        where: { status: "verified" },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const endorseUrl = `${appUrl}/api/actions/endorse?profile=${encodeURIComponent(
    profile.username ?? profile.id
  )}`;
  const blinkUrl = `https://dial.to/?action=solana-action:${encodeURIComponent(
    endorseUrl
  )}`;

  const displayName = profile.displayName ?? profile.username ?? profile.walletAddress;
  const shortWallet = profile.walletAddress
    ? `${profile.walletAddress.slice(0, 4)}...${profile.walletAddress.slice(-4)}`
    : null;

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="card animate-in" style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="flex items-center gap-4" style={{ marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent) 0%, #a29bfe 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {(displayName)[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div className="flex items-center">
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>{displayName}</h1>
              {profile.walletAddress && (
                <ProfileOwnerBadge profileWalletAddress={profile.walletAddress} />
              )}
            </div>
            {shortWallet && (
              <p className="mono text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                {shortWallet}
              </p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            {profile.bio}
          </p>
        )}

        <div className="flex gap-4 flex-wrap" style={{ marginBottom: 24 }}>
          <div className="badge badge-karma" style={{ fontSize: 16, padding: "8px 20px" }}>
            {profile.karma} Karma
          </div>
          <div className="badge badge-pending" style={{ fontSize: 14, padding: "6px 16px" }}>
            {profile.endorsementsReceived.length} endorsement{profile.endorsementsReceived.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 20,
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Share Blinks
          </h3>
          <div className="flex gap-2 flex-wrap">
            <a
              href={`/generate?profile=${encodeURIComponent(profile.username ?? profile.id)}&action=endorse`}
              className="btn btn-primary"
              style={{ fontSize: 13, padding: "8px 16px" }}
            >
              Generate Endorse Blink
            </a>
            <a
              href={`/generate?profile=${encodeURIComponent(profile.username ?? profile.id)}&action=follow`}
              className="btn btn-secondary"
              style={{ fontSize: 13, padding: "8px 16px" }}
            >
              Generate Follow Blink
            </a>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Direct Action URL
          </h3>
          <div className="copy-box">{endorseUrl}</div>
          <p className="text-muted mt-2" style={{ fontSize: 12 }}>
            Paste this in any Blink-enabled client or test in{" "}
            <a
              href={blinkUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Blinks Inspector
            </a>
          </p>
        </div>

        {profile.endorsementsReceived.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, marginTop: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Recent Endorsements
            </h3>
            <div className="flex flex-col gap-2">
              {profile.endorsementsReceived.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: "8px 12px",
                    background: "var(--bg)",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  <span className="mono">
                    {e.fromWallet.slice(0, 4)}...{e.fromWallet.slice(-4)}
                  </span>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
