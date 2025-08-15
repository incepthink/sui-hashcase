"use client";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import { Work_Sans } from "next/font/google";
import { Hash, Download, Edit3, ArrowLeft } from "lucide-react";

import { useNftTransactions } from "@/app/hooks/useNftTransactions";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";

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
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      
      toast.success("NFT claimed successfully!");
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to claim the NFT");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMetadata = async (collection_id: string, nftId: string) => {
    setIsLoading(true);
    try {
      const updateForm = {
        name: nftData.name + " (Updated)",
        description: nftData.description + " (Updated)",
        imageUrl: nftData.image_url,
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
                disabled={true}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gray-600 rounded-xl font-semibold text-white/50 cursor-not-allowed"
              >
                <Edit3 size={20} />
                No Update Available
              </button>

              {/* Reveal Content Button (if available) */}
              {/* The unlockableContent functionality is removed, so this button is no longer relevant */}
            </div>
          </div>
        </div>
      </div>

      {/* The UnlockableNft component is removed as unlockable content functionality is removed */}
    </div>
  );
};

export default NftPage;
