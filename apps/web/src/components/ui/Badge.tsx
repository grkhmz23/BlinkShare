import { clsx } from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export default function Badge({ children, className, glow = false }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-[var(--font-mono)] transition-colors",
        glow
          ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent-light)] shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          : "bg-white/5 border-white/10 text-zinc-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
