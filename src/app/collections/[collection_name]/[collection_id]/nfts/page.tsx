"use client";

import axiosInstance from "@/utils/axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ArrowW from "@/assets/images/arrowW.svg";
import { SetCard } from "@/components/ui/SetCard";
import { NFTCard } from "@/components/ui/NFTCard";
import { isSetGroup } from "@/utils/modelTypes";

interface NFTMetadata {
  id: number;
  title: string;
  description: string;
  animation_url: string;
  image_url: string;
  collection_id: number;
  token_uri: string;
  attributes: string;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
  set_id?: number | null;
  location?: boolean;
}

interface SetGroup {
  id: number;
  name: string;
  collection_id: number;
  isRandomized: boolean;
  isUpgradable: boolean;
  createdAt: string;
  updatedAt: string;
  set_nfts: NFTMetadata[];
}

type MetadataItem = NFTMetadata | SetGroup;

const NFTMetadataPage = () => {
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axiosInstance.get(
          "platform/metadata/by-collection",
          {
            params: {
              collection_id: params.collection_id,
            },
          }
        );

        console.log("RESPONSE", response);
        setMetadata(response.data.metadata_instances);
      } catch (error) {
        console.error("Error fetching metadata", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [params.collection_id]);

  if (loading) {
    return (
      <div className="py-10 bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading metadata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gradient-to-b from-[#00041f] to-[#030828] px-4 sm:px-6 lg:px-8 pb-16 text-white min-h-screen">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-8 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Mintable NFTs
          </h1>
        </div>
      </div>

      {/* NFT Grid Container */}
      <div className="max-w-7xl mx-auto">
        {metadata.length === 0 ? (
          <div className="text-center text-gray-300 py-12">
            <p className="text-lg">No NFTs found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {metadata.map((item) => {
              if (isSetGroup(item)) {
                return (
                  <SetCard
                    key={`set-${item.id}`}
                    setGroup={item}
                    collectionName={params.collection_name as string}
                    collectionId={params.collection_id as string}
                  />
                );
              } else {
                return (
                  <NFTCard
                    key={item.id}
                    nft={item}
                    collectionName={params.collection_name as string}
                    collectionId={params.collection_id as string}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMetadataPage;
