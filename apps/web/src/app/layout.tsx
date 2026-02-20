import type { Metadata } from "next";
import ClientProviders from "@/components/ClientProviders";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlinkShare — Onchain Reputation via Blinks",
  description:
    "A reputation and endorsement layer stored in Tapestry, activated via Solana Actions/Blinks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Syne:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col relative">
        {/* Noise overlay */}
        <div className="bg-noise" />

        <ClientProviders>
          <Navbar />
          <main className="flex-1 relative z-10">{children}</main>
          <footer className="border-t border-white/[0.03] bg-[#030305] mt-auto relative z-10">
            <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-[var(--font-mono)] uppercase tracking-widest text-zinc-600">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                BlinkShare Systems &copy; {new Date().getFullYear()}
              </div>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">
                  X / Twitter
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Discord
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Github
                </a>
              </div>
            </div>
          </footer>
        </ClientProviders>
      </body>
    </html>
  );
}
