"use client";

import dynamic from "next/dynamic";

const WalletProviderWrapper = dynamic(
  () => import("@/components/WalletProviderWrapper"),
  { ssr: false }
);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletProviderWrapper>{children}</WalletProviderWrapper>;
}
