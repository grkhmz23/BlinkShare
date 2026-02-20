"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet, ChevronDown, LogOut, User } from "lucide-react";
import Link from "next/link";

export default function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (publicKey) {
    const base58 = publicKey.toBase58();
    const short = `${base58.slice(0, 4)}...${base58.slice(-4)}`;
    const initial = base58.charAt(0).toUpperCase();

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="glass-card inline-flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5 text-white hover:bg-white/5 transition-all border border-white/5 cursor-pointer"
        >
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-gold)] p-px">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs font-bold text-white">
              {initial}
            </div>
          </div>
          <span className="font-[var(--font-mono)] text-sm tracking-wide">
            {short}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
                scale: 0.95,
                filter: "blur(10px)",
              }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.95,
                filter: "blur(10px)",
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[var(--color-bg-surface)]/95 backdrop-blur-xl p-2 shadow-2xl z-50"
            >
              <div className="px-3 py-3 text-xs text-zinc-500 font-[var(--font-mono)] border-b border-white/5 mb-2 uppercase tracking-widest flex items-center justify-between">
                Status
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
              </div>
              <Link
                href={`/u/${base58}`}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/5 hover:text-white transition-all no-underline"
              >
                <User className="h-4 w-4 text-[var(--color-accent)]" /> My
                Profile
              </Link>
              <button
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all mt-1 cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      className="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[#6c5ce7] text-white h-11 px-6 text-xs font-medium font-[var(--font-mono)] uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-white/10 disabled:opacity-50 cursor-pointer group"
      onClick={() => setVisible(true)}
      disabled={connecting}
    >
      <span className="relative z-10 flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        {connecting ? "Connecting..." : "Connect"}
      </span>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
    </button>
  );
}
