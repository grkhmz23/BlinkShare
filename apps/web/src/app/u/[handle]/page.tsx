import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Share2, ArrowRight } from "lucide-react";
import ProfileOwnerBadge from "@/components/ProfileOwnerBadge";
import CopyBox from "@/components/ui/CopyBox";
import Badge from "@/components/ui/Badge";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;

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
    profile.username ?? profile.id,
  )}`;
  const blinkUrl = `https://dial.to/?action=solana-action:${encodeURIComponent(
    endorseUrl,
  )}`;

  const displayName =
    profile.displayName ?? profile.username ?? profile.walletAddress;
  const shortWallet = profile.walletAddress
    ? `${profile.walletAddress.slice(0, 6)}...${profile.walletAddress.slice(-4)}`
    : null;
  const initial = (displayName ?? "?")[0]?.toUpperCase() ?? "?";

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 min-h-[calc(100vh-80px)]">
      {/* Profile header card */}
      <div className="relative mb-12">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#8B5CF6]/10 to-transparent -z-10 rounded-3xl" />

        <div className="glass-card rounded-2xl p-10 md:p-14 border border-white/5 relative overflow-hidden animate-in">
          {/* Dot grid background */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
            {/* Avatar with spinning aura */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-full border border-[#8B5CF6]/30 border-t-[#F59E0B]/50 animate-[spin_8s_linear_infinite] opacity-50" />
              <div className="absolute -inset-2 rounded-full border border-[#F59E0B]/20 border-b-[#8B5CF6]/50 animate-[spin_6s_linear_infinite_reverse] opacity-50" />

              <div className="w-36 h-36 rounded-full bg-[#0a0a0f] border-4 border-[#1a1a24] overflow-hidden flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                <span className="text-6xl font-display font-bold text-gradient-gold uppercase">
                  {initial}
                </span>
              </div>

              {profile.walletAddress && (
                <div className="absolute bottom-0 right-0 z-20 translate-x-1/4 translate-y-1/4">
                  <ProfileOwnerBadge
                    profileWalletAddress={profile.walletAddress}
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center">
              <div className="flex flex-col md:flex-row md:items-end gap-4 mb-3">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                  {displayName}
                </h1>
                {shortWallet && (
                  <Badge className="font-[var(--font-mono)] bg-black/50 mb-1 md:mb-2 border-white/5">
                    {shortWallet}
                  </Badge>
                )}
              </div>

              {profile.bio && (
                <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed font-light mb-6">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 mt-auto">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-[var(--font-mono)] mb-1">
                    Accumulated Karma
                  </p>
                  <p className="text-3xl font-[var(--font-mono)] text-gradient-gold tracking-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    {profile.karma.toLocaleString()}{" "}
                    <span className="text-sm text-zinc-600">krm</span>
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10 hidden md:block" />
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-[var(--font-mono)] mb-1">
                    Verified Endorsements
                  </p>
                  <p className="text-3xl font-[var(--font-mono)] text-white tracking-tight">
                    {profile.endorsementsReceived.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actions sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/5 animate-in">
            <h3 className="text-sm font-display font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-zinc-300">
              <Share2 className="h-4 w-4 text-[#8B5CF6]" />{" "}
              Broadcast Node
            </h3>
            <div className="space-y-4">
              <Link
                href={`/generate?profile=${encodeURIComponent(profile.username ?? profile.id)}&action=endorse`}
                className="no-underline block"
              >
                <div className="relative overflow-hidden inline-flex items-center justify-between w-full rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6c5ce7] text-white h-12 px-6 text-xs font-medium uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-white/10 group">
                  <span className="relative z-10">Generate Blink</span>
                  <ArrowRight className="h-4 w-4 opacity-70 relative z-10" />
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                </div>
              </Link>

              <div className="pt-6 border-t border-white/5">
                <CopyBox value={endorseUrl} label="Raw Action URI" />
                <p className="text-zinc-600 mt-2 text-[10px] font-[var(--font-mono)]">
                  Paste in any Blink client or test in{" "}
                  <a
                    href={blinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inspector
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger log */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-display font-bold uppercase tracking-widest mb-6 border-b border-white/5 pb-4 text-zinc-400">
            Public Ledger Events
          </h3>

          {profile.endorsementsReceived.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center border border-white/5">
              <p className="text-zinc-600 text-xs font-[var(--font-mono)] uppercase tracking-widest">
                No endorsements yet. Share your Blink to start accruing karma.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.endorsementsReceived.map((e, i) => (
                <div
                  key={e.id}
                  className="relative group overflow-hidden rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.04] hover:border-[#8B5CF6]/30 transition-all duration-300 animate-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Hover gradient line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8B5CF6] to-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center gap-4 pl-2">
                    <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center text-xs font-[var(--font-mono)] font-bold text-zinc-400 group-hover:text-white transition-colors shadow-inner">
                      {e.fromWallet.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-[var(--font-mono)] text-xs tracking-wider text-zinc-300 group-hover:text-white transition-colors">
                        {e.fromWallet.slice(0, 4)}...{e.fromWallet.slice(-4)}
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest font-[var(--font-mono)]">
                        Endorsement Transmitted
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pl-2 sm:pl-0">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-[var(--font-mono)] text-[#F59E0B] drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                        +10 KRM
                      </span>
                      <span className="text-[10px] text-zinc-600 font-[var(--font-mono)] mt-1">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
