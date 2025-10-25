import { Metadata } from "./types";
import CollectionInfoCard from "./CollectionInfoCard";

interface NFTImageSectionProps {
  metadata: Metadata;
}

export default function NFTImageSection({ metadata }: NFTImageSectionProps) {
  return (
    <div className="space-y-6">
      {/* Main Image */}
      {metadata.image_url && (
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
          <img
            src={metadata.image_url}
            alt={metadata.title || "NFT Image"}
            className="w-full h-full object-contain p-4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Animation/Video */}
      {metadata.animation_url && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
          <video
            src={metadata.animation_url}
            controls
            className="w-full h-full"
          />
        </div>
      )}

      {/* Collection Info Card */}
      {metadata.collection && (
        <CollectionInfoCard collection={metadata.collection} />
      )}
    </div>
  );
}
