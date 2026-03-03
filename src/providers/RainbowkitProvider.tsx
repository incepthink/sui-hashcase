"use client";
import React, { ReactNode } from "react";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";

const config = getDefaultConfig({
  appName: "Your App",
  projectId: "ecf169f1ed1534b70ed647ce6910990a",
  chains: [baseSepolia],
  ssr: true,
});

export default function RainbowkitProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}
