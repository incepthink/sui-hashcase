// src/components/randomizedmint/ProbabilityBar.tsx

"use client";

import { Metadata } from "@/utils/modelTypes";
import { hasProbabilityWeights } from "@/utils/probabilityUtils";

interface ProbabilityBarProps {
  metadata: Metadata[];
}

export default function ProbabilityBar({ metadata }: ProbabilityBarProps) {
  const showProbability = hasProbabilityWeights(metadata);

  if (!showProbability) return null;

  return (
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl p-5 border border-blue-500/20">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        Mint Probability Distribution
      </h3>

      <div className="space-y-3">
        {metadata.map((item) => {
          const probability = parseFloat(item.probability || "0");

          return (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 truncate max-w-[70%]">
                  {item.title}
                </span>
                <span className="text-white font-bold">
                  {probability.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    probability >= 50
                      ? "bg-gradient-to-r from-green-500 to-green-400"
                      : probability >= 30
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                      : "bg-gradient-to-r from-orange-500 to-orange-400"
                  }`}
                  style={{ width: `${probability}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 flex items-start gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Each NFT has a weighted chance to be minted. Higher percentages mean
            better odds!
          </span>
        </p>
      </div>
    </div>
  );
}
