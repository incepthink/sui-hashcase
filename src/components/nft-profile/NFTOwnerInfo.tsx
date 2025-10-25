import { getExplorerUrl, shortenAddress } from "./utils/blockchain";

interface NFTOwnerInfoProps {
  ownerAddress: string;
  chainName?: string;
}

export default function NFTOwnerInfo({
  ownerAddress,
  chainName = "sui",
}: NFTOwnerInfoProps) {
  const explorerUrl = getExplorerUrl(chainName, ownerAddress, "address");

  return (
    <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
      <h3 className="font-semibold text-white/90 text-xl mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        Current Owner
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
            Wallet Address
          </p>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors group"
          >
            <span className="font-mono text-sm break-all">{ownerAddress}</span>
            <svg
              className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
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
      </div>
    </div>
  );
}
