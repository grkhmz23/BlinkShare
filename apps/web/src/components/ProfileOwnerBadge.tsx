"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Shield } from "lucide-react";

export default function ProfileOwnerBadge({
  profileWalletAddress,
}: {
  profileWalletAddress: string;
}) {
  const { publicKey } = useWallet();

  if (!publicKey) return null;
  if (publicKey.toBase58() !== profileWalletAddress) return null;

  return (
    <div className="ml-3">
      <div className="bg-[#0a0a0f] rounded-full p-1">
        <div className="bg-gradient-to-r from-[#8B5CF6] to-[#F59E0B] p-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]">
          <Shield className="h-4 w-4 text-white fill-white" />
        </div>
      </div>
    </div>
  );
}
