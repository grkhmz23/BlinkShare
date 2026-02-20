"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Hexagon, Coins, Sparkles } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TiltCard from "@/components/ui/TiltCard";

export default function HomePage() {
  const stats = [
    { label: "Total Endorsements", value: "14,029", icon: Activity, delay: 0.2 },
    { label: "Active Identities", value: "3,892", icon: Hexagon, delay: 0.4 },
    { label: "Karma Distributed", value: "1.2M", icon: Coins, delay: 0.6 },
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 overflow-hidden pt-20 pb-32">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#8B5CF6]/20 to-[#F59E0B]/10 rounded-full blur-[100px] -z-10 mix-blend-screen opacity-50" />

      <div className="max-w-5xl mx-auto text-center w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Badge
            glow
            className="mb-8 px-4 py-1.5 uppercase tracking-widest gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            Protocol Live on Solana
          </Badge>

          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-6 leading-[1.1]">
            Reputation,
            <br className="hidden md:block" />
            <span className="text-gradient inline-block pb-2">
              Distilled Onchain.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Mint your identity, endorse top peers, and accrue Karma. Transform
            your social capital into verifiable onchain assets via Blinks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/generate" className="w-full sm:w-auto no-underline">
              <Button
                variant="luxury"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-sm uppercase tracking-wider font-bold"
              >
                Generate Blink <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-14 px-8 text-sm uppercase tracking-wider"
            >
              Read Manifesto
            </Button>
          </div>
        </motion.div>

        {/* 3D Stat Cards */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.8 }}
            >
              <TiltCard className="text-left group cursor-default h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#8B5CF6]/50 transition-colors duration-500">
                    <stat.icon className="h-5 w-5 text-zinc-400 group-hover:text-[#8B5CF6] transition-colors" />
                  </div>
                  <Sparkles className="h-4 w-4 text-white/10 group-hover:text-[#F59E0B]/50 transition-colors" />
                </div>
                <div>
                  <h4 className="text-4xl font-display font-bold text-white mb-2 tracking-tight group-hover:text-gradient transition-all duration-500">
                    {stat.value}
                  </h4>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-[var(--font-mono)]">
                    {stat.label}
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
