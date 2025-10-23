"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NftCard from "@/components/NftCard";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";
import { getCollectionById } from "@/hooks/useCollections";

interface FetchedNFT {
  id: number;
  user_id: number;
  name: string;
  description: string;
  image_uri: string;
  collection_id: number;
  token_id: number;
  type: string;
  status: string;
  priority: number;
  attributes: string;
  metadata_id: number | null;
  createdAt: string;
  updatedAt: string;
}

interface NFTsTabProps {
  fetchedNfts: FetchedNFT[];
  searchQuery: string;
  density: "comfortable" | "compact";
  isOwnProfile: boolean;
  address: string;
}

const NFTsTab: React.FC<NFTsTabProps> = ({
  fetchedNfts,
  searchQuery,
  density,
  isOwnProfile,
  address,
}) => {
  const router = useRouter();
  const [collectionMap, setCollectionMap] = useState<Map<number, string>>(
    new Map()
  );

  useEffect(() => {
    const fetchCollectionNames = async () => {
      if (!fetchedNfts || fetchedNfts.length === 0) return;

      // Get unique collection IDs
      const uniqueCollectionIds = Array.from(
        new Set(fetchedNfts.map((nft) => nft.collection_id))
      );

      // Create map of collection_id -> collection_name
      const tempMap = new Map<number, string>();

      for (const collectionId of uniqueCollectionIds) {
        try {
          const collectionData = await getCollectionById(collectionId);
          if (collectionData?.collection?.name) {
            tempMap.set(collectionId, collectionData.collection.name);
          }
        } catch (error) {
          console.error(`Failed to fetch collection ${collectionId}:`, error);
        }
      }

      setCollectionMap(tempMap);
    };

    fetchCollectionNames();
  }, [fetchedNfts]);

  const handleNFTClick = (nft: FetchedNFT) => {
    router.push(`/profile/${address}/nft/${nft.metadata_id}`);
  };

  const getCollectionName = (collectionId: number): string => {
    return collectionMap.get(collectionId) || `collection-${collectionId}`;
  };

  return (
    <>
      {fetchedNfts && fetchedNfts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">
          {fetchedNfts
            .filter((nft) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                (nft.name || "").toLowerCase().includes(q) ||
                (nft.description || "").toLowerCase().includes(q) ||
                (nft.token_id || "").toString().includes(q)
              );
            })
            .map((nft: FetchedNFT) => (
              <NftCard
                key={nft.id}
                href={`/profile/${address}/nft/${nft.metadata_id}`}
                imageUrl={nft.image_uri}
                title={nft.name}
                description={nft.description}
                footer={
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Additional NFT info can go here */}
                    </div>
                    <button
                      onClick={() => handleNFTClick(nft)}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-400/60 ${
                        density === "compact"
                          ? "px-2 py-1.5 text-xs"
                          : "px-3 py-2 text-sm"
                      } font-medium text-white hover:bg-blue-400/10 transition-colors`}
                    >
                      View Collection <span className="text-white">→</span>
                    </button>
                  </div>
                }
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg mb-2">No NFTs found</p>
          <p className="text-gray-500 text-sm">
            {isOwnProfile
              ? "You don't own any NFTs yet."
              : "This user doesn't own any NFTs yet."}
          </p>
        </div>
      )}
    </>
  );
};

export default NFTsTab;
