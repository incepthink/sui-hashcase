// @/components/nft/NFTStatus.tsx
import { Metadata } from "./types";

interface NFTStatusProps {
  metadata: Metadata;
}

export default function NFTStatus({ metadata }: NFTStatusProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span
        className={`px-4 py-2 rounded-lg text-sm font-medium border ${
          metadata.is_active
            ? "bg-green-500/20 text-green-300 border-green-500/30"
            : "bg-red-500/20 text-red-300 border-red-500/30"
        }`}
      >
        {metadata.is_active ? "Active" : "Inactive"}
      </span>
      {metadata.probability && (
        <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium border border-purple-500/30">
          Probability: {metadata.probability}%
        </span>
      )}
    </div>
  );
}
