"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyBoxProps {
  value: string;
  label?: string;
}

export default function CopyBox({ value, label }: CopyBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {label && (
        <span className="text-[10px] uppercase tracking-widest font-[var(--font-mono)] text-zinc-400 mb-2 block">
          {label}
        </span>
      )}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="rounded-lg bg-black/60 border border-white/5 px-3 py-3 font-[var(--font-mono)] text-[10px] text-zinc-500 break-all truncate">
            {value}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/60 to-transparent pointer-events-none rounded-r-lg" />
        </div>
        <button
          onClick={handleCopy}
          className="glass-card flex items-center rounded-lg px-4 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/5"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[#00b894]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
