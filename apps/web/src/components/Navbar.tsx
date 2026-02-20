"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import WalletButton from "./WalletButton";

const navLinks = [
  { name: "Core", path: "/" },
  { name: "Synthesize", path: "/generate" },
  { name: "Registry", path: "/u/toly" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/[0.02]">
      <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group no-underline">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#F59E0B] p-px shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-500">
            <div className="w-full h-full bg-[#0a0a0f] rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" fill="currentColor" />
            </div>
          </div>
          <span className="font-display font-bold text-xl tracking-wide hidden sm:block text-white hover:no-underline">
            Blink<span className="text-zinc-500 font-light">Share</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 bg-black/40 rounded-full p-1.5 border border-white/5 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`px-5 py-2 rounded-full text-xs font-[var(--font-mono)] tracking-widest uppercase transition-all duration-300 no-underline ${
                pathname === link.path
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-200 hover:no-underline"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <WalletButton />
          <button
            className="md:hidden p-2 text-zinc-400 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="space-y-1.5">
              <span
                className={`block w-5 h-px bg-current transition-transform ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-5 h-px bg-current transition-opacity ${mobileMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-px bg-current transition-transform ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b border-white/5 bg-[#030305]/95 backdrop-blur-xl"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-[var(--font-mono)] tracking-widest uppercase text-zinc-400 hover:text-white transition-colors no-underline"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
