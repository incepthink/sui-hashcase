"use client";

import axiosInstance from "@/utils/axios";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { SetCard } from "@/components/ui/SetCard";
import { NFTCard } from "@/components/ui/NFTCard";
import { isSetGroup } from "@/utils/modelTypes";
import { useGlobalAppStore } from "@/store/globalAppStore";

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

const EventNFTsPage = () => {
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const { hasWalletForChain, setOpenModal } = useGlobalAppStore();
  const isWalletConnected =
    mounted && (hasWalletForChain("sui") || hasWalletForChain("evm"));

  useEffect(() => {
    setMounted(true);
  }, []);

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
        setMetadata(response.data.metadata_instances);
      } catch (error) {
        console.error("Error fetching metadata", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [params.collection_id]);

  const reversedMetadata = useMemo(
    () => metadata.slice().reverse(),
    [metadata]
  );

  if (loading) {
    return (
      <div className="py-10 bg-[#0d0d0d] flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-lg">Loading metadata...</p>
        </div>
      </div>
    );
  }

  if (!isWalletConnected) {
    return (
      <div className="bg-[#0d0d0d] min-h-screen pb-10">
        <div className="pt-2 pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">🔒</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Login or Connect Wallet
              </h3>
              <p className="text-gray-400 text-sm sm:text-base mb-6">
                Please connect your wallet to view mintable NFTs
              </p>
              <button
                onClick={() => setOpenModal(true)}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Connect Wallet or Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#0d0d0d] px-4 sm:px-6 lg:px-8 pb-16 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Mintable NFTs
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {reversedMetadata.length === 0 ? (
          <div className="text-center text-gray-300 py-12">
            <p className="text-lg">No NFTs found for this event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {reversedMetadata.map((item) => {
              if (isSetGroup(item)) {
                return (
                  <SetCard
                    key={`set-${item.id}`}
                    setGroup={item}
                    collectionName={params.collection_name as string}
                    collectionId={params.collection_id as string}
                    basePath="/event"
                  />
                );
              } else {
                return (
                  <NFTCard
                    key={`nft-${item.id}`}
                    nft={item}
                    collectionName={params.collection_name as string}
                    collectionId={params.collection_id as string}
                    basePath="/event"
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

export default EventNFTsPage;
