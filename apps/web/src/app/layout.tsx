import type { Metadata } from "next";
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
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav
          style={{
            borderBottom: "1px solid var(--border)",
            padding: "16px 0",
          }}
        >
          <div className="container flex items-center justify-between">
            <a
              href="/"
              className="mono"
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.5px",
              }}
            >
              BlinkShare
            </a>
            <div className="flex gap-4 items-center">
              <a href="/generate" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>
                Generate Blink
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
