import Image from "next/image";
import { Collection } from "./types";

interface CollectionBannerProps {
  collection?: Collection;
}

export default function CollectionBanner({
  collection,
}: CollectionBannerProps) {
  if (!collection?.banner_image) return null;

  return (
    <div className="relative w-full h-64 mb-8 rounded-2xl overflow-hidden">
      <Image
        src={collection.banner_image}
        alt={collection.name}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    </div>
  );
}
