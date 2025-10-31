// src/components/randomizedmint/NFTList.tsx

"use client";

import { Metadata } from "@/utils/modelTypes";
import {
  formatProbability,
  hasProbabilityWeights,
} from "@/utils/probabilityUtils";

interface NFTListProps {
  metadata: Metadata[];
}

export default function NFTList({ metadata }: NFTListProps) {
  const showProbability = hasProbabilityWeights(metadata);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white/90">
          Available NFTs ({metadata.length})
        </h2>
        {showProbability && (
          <span className="text-sm text-gray-400">Mint Probability</span>
        )}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {metadata.map((item) => {
          const probability = formatProbability(item.probability);
          const probabilityValue = parseFloat(item.probability || "0");

          return (
            <div
              key={item.id}
              className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-semibold truncate">
                      {item.title}
                    </h3>

                    {showProbability && (
                      <span
                        className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-bold ${
                          probabilityValue >= 50
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : probabilityValue >= 30
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                        }`}
                      >
                        {probability}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
