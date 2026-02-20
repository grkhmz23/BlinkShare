"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet, User, Check, Hexagon, Sparkles } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TiltCard from "@/components/ui/TiltCard";
import WalletButton from "@/components/WalletButton";

type ProfileState =
  | { kind: "disconnected" }
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "found"; username: string }
  | { kind: "created"; username: string }
  | { kind: "error"; message: string };

export default function CreateProfileForm() {
  const { publicKey } = useWallet();
  const [state, setState] = useState<ProfileState>({ kind: "disconnected" });
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setState({ kind: "disconnected" });
      return;
    }

    setState({ kind: "loading" });
    const wallet = publicKey.toBase58();

    fetch(`/api/profiles?wallet=${encodeURIComponent(wallet)}`)
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 404) return null;
        throw new Error("Failed to check profile");
      })
      .then((data) => {
        if (data?.profile) {
          setState({ kind: "found", username: data.profile.username });
        } else {
          setState({ kind: "not_found" });
        }
      })
      .catch((err) => {
        setState({ kind: "error", message: err.message });
      });
  }, [publicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          username: username || undefined,
          displayName: displayName || undefined,
          bio: bio || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setState({
          kind: "error",
          message: data.error ?? "Failed to create profile",
        });
        return;
      }

      setState({ kind: "created", username: data.profile.username });
    } catch {
      setState({ kind: "error", message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  const stateContent: Record<string, React.ReactNode> = {
    disconnected: (
      <div className="text-center py-10">
        <div className="mx-auto w-20 h-20 rounded-full border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full border border-[#8B5CF6]/30 animate-[spin_4s_linear_infinite]" />
          <Wallet className="h-8 w-8 text-zinc-400" />
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-3">
          Authentication Required
        </h3>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Initialize your cryptographic identity to interact with the BlinkShare
          reputation protocol.
        </p>
        <div className="flex justify-center">
          <WalletButton />
        </div>
      </div>
    ),

    loading: (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#8B5CF6] opacity-50"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-2 rounded-full border-b-2 border-l-2 border-[#F59E0B] opacity-50"
          />
          <Hexagon className="absolute inset-0 m-auto h-6 w-6 text-white/50" />
        </div>
        <p className="text-zinc-500 font-[var(--font-mono)] text-xs tracking-widest uppercase animate-pulse">
          Syncing State...
        </p>
      </div>
    ),

    found: (
      <div className="text-center py-10">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#F59E0B]/20 flex items-center justify-center mb-6 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute inset-0 rounded-full border border-white/20"
          />
          <Check className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-3">
          Identity Located
        </h3>
        <p className="text-zinc-400 font-[var(--font-mono)] text-sm">
          Wallet linked to{" "}
          <Link
            href={`/u/${encodeURIComponent((state as { kind: "found"; username: string }).username)}`}
            className="text-[#8B5CF6]"
          >
            @{(state as { kind: "found"; username: string }).username}
          </Link>
        </p>
      </div>
    ),

    created: (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#F59E0B]/20 flex items-center justify-center mb-6 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute inset-0 rounded-full border border-white/20"
          />
          <Check className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-3xl font-display font-bold text-white mb-2">
          Profile Minted
        </h3>
        <p className="text-zinc-400 font-[var(--font-mono)]">
          Welcome to the network,{" "}
          <Link
            href={`/u/${encodeURIComponent((state as { kind: "created"; username: string }).username)}`}
            className="text-white"
          >
            @{(state as { kind: "created"; username: string }).username}
          </Link>
        </p>
      </motion.div>
    ),

    error: (
      <div className="text-center py-10">
        <p className="text-[#e17055] text-sm font-[var(--font-mono)]">
          {(state as { kind: "error"; message: string }).message}
        </p>
      </div>
    ),

    not_found: (
      <form onSubmit={handleSubmit} className="space-y-8 py-4">
        <div className="text-center">
          <h3 className="text-3xl font-display font-bold mb-2">
            Initialize Profile
          </h3>
          <p className="text-zinc-500">
            Claim your unique namespace on the reputation graph.
          </p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-[var(--font-mono)] text-zinc-400 block">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-[var(--font-mono)]">
                @
              </span>
              <Input
                type="text"
                placeholder="satoshi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 font-[var(--font-mono)] text-lg h-14"
                maxLength={32}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-[var(--font-mono)] text-zinc-400 block">
              Display Name
            </label>
            <Input
              type="text"
              placeholder="Satoshi Nakamoto"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={64}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-[var(--font-mono)] text-zinc-400 block">
              Bio
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8B5CF6]/20 to-[#F59E0B]/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />
              <textarea
                placeholder="Your story..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={256}
                rows={3}
                className="relative w-full rounded-xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#8B5CF6]/50 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            variant="luxury"
            size="lg"
            disabled={submitting}
            className="w-full max-w-sm"
          >
            {submitting ? (
              "Minting..."
            ) : (
              <>
                Mint Profile <Sparkles className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    ),
  };

  return (
    <TiltCard glow className="max-w-2xl mx-auto mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.kind}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {stateContent[state.kind]}
        </motion.div>
      </AnimatePresence>
    </TiltCard>
  );
}
