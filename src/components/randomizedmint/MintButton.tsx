// src/components/randomizedmint/MintButton.tsx

"use client";

import ConnectButton from "@/components/ConnectButton";

interface MintButtonProps {
  isConnected: boolean;
  onMint: () => void;
}

export default function MintButton({ isConnected, onMint }: MintButtonProps) {
  if (!isConnected) {
    return (
      <>
        <ConnectButton mid={true} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={onMint}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-white/10 flex items-center justify-center gap-3"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Mint Random NFT
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </button>

      <p className="text-center text-gray-400 text-sm mt-3">
        Get a random NFT from this Set
      </p>
    </>
  );
}
