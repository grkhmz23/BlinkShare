import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0,transparent_40%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-[10rem] font-display font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent mb-4 select-none relative">
          404
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] to-transparent z-10" />
        </h1>
        <h2 className="text-2xl font-display uppercase tracking-widest text-zinc-300 mb-4 z-20">
          Anomaly Detected
        </h2>
        <p className="text-zinc-500 mb-10 max-w-sm font-[var(--font-mono)] text-xs leading-relaxed z-20">
          The requested path does not exist in the current protocol registry.
          Verify the endpoint and retry.
        </p>
        <Link
          href="/"
          className="z-20 inline-flex items-center justify-center rounded-xl border border-white/10 text-white h-14 px-10 text-xs font-[var(--font-mono)] uppercase tracking-widest transition-all hover:bg-white/5 no-underline"
        >
          Return to Hub
        </Link>
      </div>
    </div>
  );
}
