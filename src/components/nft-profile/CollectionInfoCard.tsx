import { Collection } from "./types";
import { getExplorerUrl, shortenAddress } from "./utils/blockchain";

interface CollectionInfoCardProps {
  collection: Collection;
}

export default function CollectionInfoCard({
  collection,
}: CollectionInfoCardProps) {
  const collectionExplorerUrl = getExplorerUrl(
    collection.chain_name,
    collection.collection_address,
    "address"
  );

  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 space-y-4">
      <h3 className="text-xl font-semibold text-white/90">Collection</h3>

      <div className="flex items-center gap-4">
        {collection.image_uri && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={collection.image_uri}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-white">{collection.name}</h4>
          <p className="text-sm text-gray-400 capitalize">
            {collection.chain_name}
          </p>
        </div>
      </div>

      {collection.description && (
        <p className="text-sm text-gray-300">{collection.description}</p>
      )}

      {/* Collection Address */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">
          Collection Address
        </p>
        <a
          href={collectionExplorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
        >
          <span className="font-mono text-sm">
            {shortenAddress(collection.collection_address)}
          </span>
          <svg
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
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

      {/* Package ID */}
      {collection.package_id && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Package ID
          </p>
          <a
            href={getExplorerUrl(
              collection.chain_name,
              collection.package_id,
              "object"
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
          >
            <span className="font-mono text-sm">
              {shortenAddress(collection.package_id)}
            </span>
            <svg
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
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

      {collection.tags && (
        <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">
          {collection.tags}
        </div>
      )}
    </div>
  );
}
