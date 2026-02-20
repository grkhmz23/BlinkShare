"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export default function Toast({ message, isVisible }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-[var(--color-bg-surface)]/90 backdrop-blur-xl px-5 py-4 text-sm text-white shadow-2xl"
        >
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-medium tracking-wide">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
