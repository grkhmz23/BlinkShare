"use client";

import { useWallet } from "@solana/wallet-adapter-react";

export default function ProfileOwnerBadge({
  profileWalletAddress,
}: {
  profileWalletAddress: string;
}) {
  const { publicKey } = useWallet();

  if (!publicKey) return null;
  if (publicKey.toBase58() !== profileWalletAddress) return null;

  return (
    <span
      className="badge"
      style={{
        background: "rgba(108, 92, 231, 0.15)",
        color: "var(--accent)",
        border: "1px solid rgba(108, 92, 231, 0.3)",
        fontSize: 12,
        marginLeft: 8,
      }}
    >
      Your Profile
    </span>
  );
}
