"use client";

import type { ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { clsx } from "clsx";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export default function TiltCard({
  children,
  className,
  glow = false,
}: TiltCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);
  const shineOpacity = useTransform(mouseYSpring, [-0.5, 0.5], [0.1, 0.3]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        "relative glass-card rounded-2xl p-px",
        className,
      )}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
      {glow && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-2xl bg-[var(--color-accent)] blur-xl"
          style={{ opacity: shineOpacity }}
        />
      )}
      <div className="relative h-full w-full rounded-2xl bg-[var(--color-bg-surface)]/90 p-6 backdrop-blur-md overflow-hidden flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
