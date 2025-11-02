"use client";

import { ReactNode } from "react";
import ConnectButton from "@/components/ConnectButton";

interface MintButtonProps {
  isConnected: boolean;
  onMint: () => void;
  label?: string;
  helperText?: string;
  icon?: ReactNode;
  loading?: boolean;
}

export default function MintButton({
  isConnected,
  onMint,
  label = "Mint NFT",
  helperText,
  icon,
  loading = false,
}: MintButtonProps) {
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
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-white/10 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg
              className="w-6 h-6 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
              />
            </svg>
            Minting...
          </>
        ) : (
          <>
            {icon || (
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
            )}
            {label}
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
          </>
        )}
      </button>

      {helperText && (
        <p className="text-center text-gray-400 text-sm mt-3">{helperText}</p>
      )}
    </>
  );
}
