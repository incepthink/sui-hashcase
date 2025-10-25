import { Contract } from "./types";
import { getExplorerUrl, shortenAddress } from "./utils/blockchain";

interface NFTContractInfoProps {
  contract: Contract;
  chainName: string;
}

export default function NFTContractInfo({
  contract,
  chainName,
}: NFTContractInfoProps) {
  const contractExplorerUrl = getExplorerUrl(
    chainName,
    contract.contract_address,
    "address"
  );

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <h3 className="font-semibold text-white/90 text-xl mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Contract Information
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
              Chain
            </p>
            <p className="text-white font-medium capitalize">
              {contract.chain_name}
            </p>
          </div>

          <div className="flex-1">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
              Contract Address
            </p>
            <a
              href={contractExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
            >
              <span className="font-mono text-sm">
                {shortenAddress(contract.contract_address)}
              </span>
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
    </div>
  );
}
