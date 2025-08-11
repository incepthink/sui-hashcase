"use client";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import { Work_Sans } from "next/font/google";
import { Hash, Download, Edit3, ArrowLeft } from "lucide-react";

import { useNftTransactions } from "@/app/hooks/useNftTransactions";
import axiosInstance from "@/utils/axios";
import UnlockableNft from "./UnlockableNft";
import toast from "react-hot-toast";
import {
  Collection,
  Metadata,
  MetadataInstanceWithMetadataSet,
} from "@/utils/modelTypes";

const workSans = Work_Sans({ subsets: ["latin"] });

const NftPage = () => {
  const params = useParams();
  const router = useRouter();

  //needed for the NFT modal to function
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { claimNFT, updateNftMetadata } = useNftTransactions();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [unlockableContent, setUnlockableContent] = useState<string>("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [upgradeData, setUpgradeData] =
    useState<MetadataInstanceWithMetadataSet | null>(null);

  const handleClaimNft = async (collection_id: string, nftId: string) => {
    if (!address.trim()) {
      toast.error("Please enter an address first");
      return;
    }
    
    setIsLoading(true);
    try {
      if (!nftData) return;
      
      // Claim NFT on the blockchain
      await claimNFT(collection_id, nftId);

      // Place the order
      await axiosInstance.post("/user/order/create", {
        collection_id: collection?.id,
        token_id: nftData.token_number,
        address: address,
        status: "order_placed",
      });
      
      toast.success("NFT claimed successfully!");
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to claim the NFT");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMetadata = async (collection_id: string, nftId: string) => {
    if (!upgradeData) {
      toast.error("No upgrade data available for this NFT");
      return;
    }
    
    setIsLoading(true);
    try {
      const updateForm = {
        name: upgradeData.title!,
        description: upgradeData.description,
        imageUrl: upgradeData.image_url,
        collectionId: collection_id,
        attributes: "super, good",
        nftId: nftId,
      };

      await updateNftMetadata(updateForm);
      toast.success("NFT metadata updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update NFT metadata");
    } finally {
      setIsLoading(false);
    }
  };

  const nft_address = (params.nft_address as string) || "";

  const { data: nft, isLoading: nftLoading } = useSuiClientQuery("getObject", {
    id: nft_address,
    options: {
      showContent: true,
    },
  });

  const nftData = (nft?.data?.content as any)?.fields;

  // Set collectionAddress only when nftData changes
  useEffect(() => {
    const getUnlockableContentForCollection = async () => {
      if (nftData?.collection_id) {
        try {
          const collectionData = await axiosInstance.get(
            "/platform/collection-by-address",
            {
              params: {
                contract_address: nftData.collection_id,
              },
            }
          );
          const { collection_instance } = collectionData.data;

          setCollection(collection_instance);
          setUnlockableContent(collection_instance.contract.unlockable_content);

          // Try to get upgrade data, but don't fail if it's not available
          try {
            const upgrade = await axiosInstance.get("/platform/metadata/next", {
              params: {
                collection_id: collection_instance.id,
                token_id: nftData.token_number,
              },
            });
            setUpgradeData(upgrade.data.metadata_instance);
          } catch (upgradeError) {
            console.log("Upgrade data not available for this NFT:", upgradeError);
            // Don't set upgrade data if the endpoint fails
            setUpgradeData(null);
          }
        } catch (error) {
          console.error("Error fetching collection data:", error);
        }
      }
    };

    getUnlockableContentForCollection();
  }, [nftData]);

  if (nftLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4DA2FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading NFT...</p>
        </div>
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <p className="text-white/80">NFT not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-gradient-to-b from-[#00041f] to-[#030828] ${workSans.className} min-h-screen`}>
      <div className="flex flex-col px-6 md:px-16 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-lg">Go Back</span>
          </button>
          
          {/* Token ID Badge */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
            <Hash className="text-[#4DA2FF]" size={20} />
            <span className="text-white font-medium text-sm">
              {nftData.id.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* NFT Image Section */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative group">
              <img
                src={nftData.image_url}
                alt={nftData.name}
                className="w-full max-w-md h-auto rounded-2xl shadow-2xl border border-white/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          {/* NFT Details Section */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* NFT Title and Creator */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {nftData.name}
              </h1>
              <p className="text-white/60">
                Created by{" "}
                <span className="text-[#4DA2FF] font-medium">
                  {nftData.creator.slice(0, 10)}...
                </span>
              </p>
            </div>

            {/* Description */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-white/80 leading-relaxed">
                {nftData.description || "No description available"}
              </p>
            </div>

            {/* NFT Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm">Token Number</p>
                <p className="text-white font-semibold">#{nftData.token_number}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-white/60 text-sm">Mint Price</p>
                <p className="text-white font-semibold">{nftData.mint_price}</p>
              </div>
            </div>

            {/* Address Input */}
            <div className="space-y-2">
              <label className="text-white/80 text-sm font-medium">
                Order Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter the order address"
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/50 focus:border-[#4DA2FF]/50 placeholder:text-white/40 text-white transition-all duration-200"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              {/* Claim NFT Button */}
              {/* <button
                onClick={() => handleClaimNft(nftData.collection_id, nftData.id.id)}
                disabled={isLoading || !address.trim()}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] hover:from-[#3a8fef] hover:to-[#6aa7f0] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-black transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Claim NFT
                  </>
                )}
              </button> */}

              {/* Update Metadata Button */}
              <button
                onClick={() => handleUpdateMetadata(nftData.collection_id, nftData.id.id)}
                disabled={isLoading || !upgradeData}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : !upgradeData ? (
                  <>
                    <Edit3 size={20} />
                    No Update Available
                  </>
                ) : (
                  <>
                    <Edit3 size={20} />
                    Update Metadata
                  </>
                )}
              </button>

              {/* Reveal Content Button (if available) */}
              {unlockableContent && (
                <button
                  onClick={openModal}
                  className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                
                  Reveal Unlockable Content
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <UnlockableNft
        isOpen={isModalOpen}
        unlockableContent={unlockableContent}
        closeModal={closeModal}
      />
    </div>
  );
};

export default NftPage;
