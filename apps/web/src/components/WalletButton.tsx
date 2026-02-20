"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  if (publicKey) {
    const base58 = publicKey.toBase58();
    const short = `${base58.slice(0, 4)}...${base58.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <span className="mono" style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {short}
        </span>
        <button
          className="btn btn-secondary"
          style={{ fontSize: 13, padding: "8px 16px" }}
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn btn-secondary"
      style={{ fontSize: 13, padding: "8px 16px" }}
      onClick={() => setVisible(true)}
      disabled={connecting}
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
