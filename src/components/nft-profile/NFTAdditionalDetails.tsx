// @/components/nft/NFTAdditionalDetails.tsx
import { Metadata } from "./types";
import { shortenAddress } from "./utils/blockchain";

interface NFTAdditionalDetailsProps {
  metadata: Metadata;
}

export default function NFTAdditionalDetails({
  metadata,
}: NFTAdditionalDetailsProps) {
  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
      <h3 className="font-semibold text-white/90 text-xl mb-4">Details</h3>
      <div className="text-sm space-y-3">
        {metadata.nft?.sui_object_id && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">NFT Object ID:</span>
            <span className="font-mono text-xs text-blue-300">
              {shortenAddress(metadata.nft.sui_object_id)}
            </span>
          </div>
        )}
        {metadata.nft?.token_id && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Token ID:</span>
            <span className="text-white">{metadata.nft.token_id}</span>
          </div>
        )}
        {metadata.token_uri && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Token URI:</span>
            <a
              href={metadata.token_uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors text-xs flex items-center gap-1"
            >
              View
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}
        {metadata.set_id && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Set ID:</span>
            <span className="text-white">{metadata.set_id}</span>
          </div>
        )}
      </div>
    </div>
  );
}
