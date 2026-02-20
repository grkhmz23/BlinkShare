"use client";

import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "luxury" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]",
  luxury:
    "bg-gradient-to-r from-[var(--color-accent)] to-[#6c5ce7] text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-white/10",
  secondary: "glass-card text-white hover:bg-white/5 border border-white/5",
  ghost: "text-zinc-400 hover:text-white hover:bg-white/5",
  outline: "border border-white/10 text-white hover:bg-white/5",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "relative overflow-hidden inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300",
        "focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer group",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {/* Shimmer on hover */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
    </button>
  );
}
