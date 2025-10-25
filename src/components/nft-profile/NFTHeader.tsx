// @/components/nft/NFTHeader.tsx
import { Metadata } from "./types";

interface NFTHeaderProps {
  metadata: Metadata;
}

export default function NFTHeader({ metadata }: NFTHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
        {metadata.title}
      </h1>
      {metadata.description && (
        <p className="text-gray-300 text-lg">{metadata.description}</p>
      )}
    </div>
  );
}
