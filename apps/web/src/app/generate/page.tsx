"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Copy, Check, QrCode, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Toast from "@/components/ui/Toast";
import TiltCard from "@/components/ui/TiltCard";
import Badge from "@/components/ui/Badge";

const CreateProfileForm = dynamic(
  () => import("@/components/CreateProfileForm"),
  { ssr: false },
);

export default function GenerateBlinkPage() {
  const [profileId, setProfileId] = useState("");
  const [actionType, setActionType] = useState<"endorse" | "follow" | "tip">(
    "endorse",
  );
  const [generated, setGenerated] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Read query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const profile = params.get("profile");
    const action = params.get("action");
    if (profile) setProfileId(profile);
    if (action === "endorse" || action === "follow" || action === "tip") {
      setActionType(action);
    }
    if (profile) setGenerated(true);
  }, []);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const actionUrl = `${appUrl}/api/actions/endorse?profile=${encodeURIComponent(profileId)}`;
  const blinkUrl = `https://dial.to/?action=solana-action:${encodeURIComponent(actionUrl)}`;
  const profileUrl = `${appUrl}/u/${encodeURIComponent(profileId)}`;

  // Generate QR code
  useEffect(() => {
    if (!generated || !profileId) return;
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(blinkUrl, {
        width: 256,
        margin: 2,
        color: { dark: "#e4e4f0", light: "#0a0a0f" },
      }).then((url: string) => {
        if (!cancelled) setQrDataUrl(url);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [generated, profileId, blinkUrl]);

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setToastMsg(`${label} copied to clipboard`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const tabs = [
    { id: "endorse" as const, label: "Endorse" },
    { id: "follow" as const, label: "Follow" },
    { id: "tip" as const, label: "Tip" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-24 min-h-[calc(100vh-80px)]">
      <Toast message={toastMsg} isVisible={showToast} />

      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        className="mb-12 text-center md:text-left"
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Command Center
        </h1>
        <p className="text-zinc-400 font-light text-lg">
          Deploy interactive Solana Actions directly to any feed.
        </p>
      </motion.div>

      <CreateProfileForm />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main controls — 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          <TiltCard>
            <div className="mb-8">
              <label className="text-xs uppercase tracking-widest font-[var(--font-mono)] text-zinc-400 mb-2 block">
                Action Paradigm
              </label>
              <div className="flex p-1.5 bg-[#030305] rounded-xl border border-white/5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActionType(tab.id);
                      setGenerated(false);
                    }}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                      actionType === tab.id
                        ? "bg-white/10 text-white shadow-md border border-white/10"
                        : "text-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {actionType !== "endorse" && (
              <p className="text-zinc-600 text-xs italic mb-4 font-[var(--font-mono)]">
                {actionType === "follow" ? "Follow" : "Tip"} blinks are coming
                soon. Endorse is fully functional.
              </p>
            )}

            <div className="space-y-6 mb-10">
              <div>
                <label className="text-xs uppercase tracking-widest font-[var(--font-mono)] text-zinc-400 mb-2 block">
                  Target Namespace
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 z-10" />
                  <Input
                    placeholder="Search user to interact with..."
                    value={profileId}
                    onChange={(e) => {
                      setProfileId(e.target.value);
                      setGenerated(false);
                    }}
                    className="pl-12 h-14 text-lg"
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full h-14 text-sm tracking-widest uppercase font-bold"
              variant="luxury"
              onClick={() => {
                if (profileId.trim()) setGenerated(true);
              }}
              disabled={!profileId.trim()}
            >
              Synthesize Blink
            </Button>
          </TiltCard>

          {/* Results */}
          <AnimatePresence>
            {generated && profileId.trim() && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                className="relative rounded-2xl p-px overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/50 to-[#F59E0B]/50 blur-sm pointer-events-none" />
                <div className="relative bg-[#0a0a0f] rounded-2xl p-6 border border-white/10 backdrop-blur-2xl">
                  <div className="flex items-center gap-3 mb-6 text-[#FDE68A]">
                    <div className="h-8 w-8 rounded-full bg-[#F59E0B]/20 flex items-center justify-center border border-[#F59E0B]/30">
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="font-display font-bold tracking-wide">
                      Synthesis Complete
                    </span>
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: "Payload URI", value: actionUrl },
                      { label: "Inspector Link", value: blinkUrl },
                      { label: "Profile Path", value: profileUrl },
                    ].map((item) => (
                      <div key={item.label}>
                        <span className="text-[10px] uppercase tracking-widest font-[var(--font-mono)] text-zinc-400 mb-1.5 block">
                          {item.label}
                        </span>
                        <div className="flex gap-2">
                          <input
                            readOnly
                            value={item.value}
                            className="flex-1 bg-black/50 border border-white/5 rounded-lg px-3 py-2 font-[var(--font-mono)] text-xs text-zinc-400 focus:outline-none"
                          />
                          <button
                            onClick={() =>
                              handleCopy(item.value, item.label)
                            }
                            className="glass-card flex items-center rounded-lg px-3 py-2 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-8">
                    <a
                      href={blinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 no-underline"
                    >
                      <Button
                        variant="outline"
                        className="w-full text-xs tracking-wider"
                      >
                        Open Inspector
                      </Button>
                    </a>
                    <Link
                      href={`/u/${encodeURIComponent(profileId)}`}
                      className="flex-1 no-underline"
                    >
                      <Button className="w-full text-xs tracking-wider">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* QR Code sidebar — 5 cols */}
        <div className="lg:col-span-5 h-full">
          <TiltCard className="h-full min-h-[400px] flex flex-col items-center justify-center p-10">
            {generated && profileId.trim() ? (
              <motion.div
                initial={{
                  scale: 0.8,
                  opacity: 0,
                  filter: "blur(10px)",
                }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.2 }}
                className="w-full relative"
              >
                <div className="absolute -inset-10 bg-[#8B5CF6]/10 blur-3xl rounded-full pointer-events-none" />

                <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-white rounded-2xl p-2 mb-8 shadow-[0_0_40px_rgba(139,92,246,0.3)] overflow-hidden">
                  <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none" />
                  <div className="scanner-line z-20" />
                  <div className="w-full h-full border-4 border-black rounded-xl p-4 flex items-center justify-center relative">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="Blink QR Code"
                        className="w-full h-full rounded-lg"
                      />
                    ) : (
                      <QrCode
                        className="w-full h-full text-black opacity-90"
                        strokeWidth={0.5}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-2 rounded-lg shadow-lg">
                        <Zap className="h-6 w-6 text-black fill-black" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center relative z-10">
                  <Badge className="mb-3">Scan via Backpack/Phantom</Badge>
                  <h4 className="font-display font-bold text-xl text-white mb-2 tracking-wide capitalize">
                    {actionType} Node
                  </h4>
                  <p className="text-xs text-zinc-500 font-[var(--font-mono)]">
                    Point wallet camera to interact instantly.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="opacity-30 flex flex-col items-center">
                <QrCode
                  className="w-24 h-24 mb-6 text-zinc-600"
                  strokeWidth={1}
                />
                <p className="text-sm font-[var(--font-mono)] tracking-widest uppercase">
                  Awaiting Synthesis
                </p>
              </div>
            )}
          </TiltCard>
        </div>
      </div>
    </div>
  );
}
