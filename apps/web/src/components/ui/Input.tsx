"use client";

import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

export default function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-accent)]/20 to-[var(--color-gold)]/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur" />
      <input
        className={clsx(
          "relative flex h-12 w-full rounded-xl border border-white/10 bg-[var(--color-bg-surface)]/80 backdrop-blur-sm",
          "px-4 py-2 text-sm text-white placeholder:text-zinc-600",
          "focus:outline-none focus:border-[var(--color-accent)]/50 transition-all",
          className,
        )}
        {...props}
      />
    </div>
  );
}
