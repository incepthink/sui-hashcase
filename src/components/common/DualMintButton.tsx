"use client";

import React from "react";
import ConnectButton from "@/components/ConnectButton";

interface DualMintButtonProps {
  isConnected?: boolean;
  onFreeMint: () => void | Promise<void>;
  onPaidMint: () => void | Promise<void>;
  freeLoading?: boolean;
  paidLoading?: boolean;
  freeDisabled?: boolean;
  paidDisabled?: boolean;
  freeLabel?: string;
  paidLabel?: string;
  helperText?: string;
  showHelper?: boolean;
}

export const DualMintButton: React.FC<DualMintButtonProps> = ({
  isConnected = true,
  onFreeMint,
  onPaidMint,
  freeLoading = false,
  paidLoading = false,
  freeDisabled = false,
  paidDisabled = false,
  freeLabel = "Free Mint",
  paidLabel = "Paid Mint",
  helperText,
  showHelper = true,
}) => {
  const isFreeMinting = freeLoading;
  const isPaidMinting = paidLoading;

  // If wallet not connected, show connect button only
  if (!isConnected) {
    return (
      <div className="flex flex-col gap-4 items-start w-full">
        {helperText && showHelper && (
          <p className="text-sm text-gray-300">{helperText}</p>
        )}
        <ConnectButton mid={true} />
      </div>
    );
  }

  const getFreeMintButtonClass = () => {
    const baseClass =
      "flex items-center justify-center gap-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200";
    const stateClass = freeDisabled
      ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-60 border-[1px] border-gray-400"
      : isFreeMinting
        ? "bg-white text-black cursor-not-allowed opacity-70 border-[1px] border-b-2 border-[#4DA2FF]"
        : "bg-white text-black hover:bg-gray-300 border-[1px] border-b-2 border-[#4DA2FF]";

    return `${baseClass} ${stateClass}`;
  };

  const getPaidMintButtonClass = () => {
    const baseClass =
      "flex items-center justify-center gap-x-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200";
    const stateClass = paidDisabled
      ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-60 border-none"
      : isPaidMinting
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-not-allowed opacity-70 border-none"
        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:from-blue-700 hover:to-purple-700 border-none";

    return `${baseClass} ${stateClass}`;
  };

  return (
    <div className="flex flex-col gap-4 items-start w-full">
      {helperText && showHelper && (
        <p className="text-sm text-gray-300">{helperText}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Free Mint Button */}
        <button
          onClick={onFreeMint}
          disabled={freeDisabled || isFreeMinting}
          className={getFreeMintButtonClass()}
        >
          {isFreeMinting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Minting...
            </>
          ) : (
            <>
              {freeLabel}
              <svg
                className="w-3 h-3"
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

        {/* Paid Mint Button - Gradient with Lightning Bolt */}
        <button
          onClick={onPaidMint}
          disabled={paidDisabled || isPaidMinting}
          className={getPaidMintButtonClass()}
        >
          {isPaidMinting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Minting...
            </>
          ) : (
            <>
              {/* Lightning Bolt Icon */}
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              {paidLabel}
              <svg
                className="w-3 h-3"
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
      </div>
    </div>
  );
};
