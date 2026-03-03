"use client";

import React from "react";
import Link from "next/link";
import { SetGroup } from "@/utils/modelTypes";
import { ImageCarousel } from "./ImageCarousel";
import { Share2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";

interface SetCardProps {
  setGroup: SetGroup;
  collectionName: string;
  collectionId: string;
  basePath?: string;
}

export const SetCard: React.FC<SetCardProps> = ({
  setGroup,
  collectionName,
  collectionId,
  basePath = "/collections",
}) => {
  // Extract all images from set NFTs
  const images = setGroup.set_nfts.map((nft) => nft.image_url).filter(Boolean);

  const { user } = useGlobalAppStore();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const type = setGroup.isRandomized ? "randomizedmint" : "upgradablemint";
    let baseUrl = `${window.location.origin}${basePath}/${collectionName}/${collectionId}/nfts/${type}/${setGroup.id}`;
    try {
      if (user?.id) {
        const { data } = await axiosInstance.get("/user/referral/code", {
          params: { user_id: user.id },
        });
        if (data?.code) {
          baseUrl += `?code=${data.code}`;
        }
      }
      await navigator.clipboard.writeText(baseUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Get first NFT's attributes for display
  const firstNft = setGroup.set_nfts[0];
  const attributes = firstNft?.attributes || "";

  return (
    <Link
      href={`${basePath}/${collectionName}/${collectionId}/nfts/${
        setGroup.isRandomized ? "randomizedmint" : "upgradablemint"
      }/${setGroup.id}`}
    >
      <div className="group relative bg-gradient-to-br from-[#0a0f3b] to-[#050a2e] shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-[#141a52] hover:to-[#0a0f3b] cursor-pointer border border-gray-700/30 h-full">
        {/* Image Carousel */}
        <div className="relative overflow-hidden">
          <ImageCarousel images={images} alt={setGroup.name} />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Title + Share */}
          <div className="flex items-center justify-between mb-2 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-1">
              {setGroup.name}
            </h2>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 shrink-0 bg-green-500 hover:bg-green-600 text-white text-xs px-2.5 py-1 rounded-full font-medium transition-colors duration-200"
              title="Copy share link"
            >
              Share <Share2 className="w-3 h-3" />
            </button>
          </div>

          {/* Set Type Info */}
          <div className="mb-3 flex flex-wrap gap-2">
            {setGroup.isRandomized && (
              <span className="inline-block bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded-full border border-orange-500/30">
                Randomized
              </span>
            )}
            {setGroup.isUpgradable && (
              <span className="inline-block bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-500/30">
                Upgradable
              </span>
            )}
          </div>

          {/* NFT Count */}
          <p className="text-gray-300 text-sm mb-3 leading-relaxed">
            Contains {setGroup.set_nfts.length} NFT
            {setGroup.set_nfts.length !== 1 ? "s" : ""}
          </p>

          {/* Sample Attributes from first NFT */}
          {attributes && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {attributes
                  .split(",")
                  .slice(0, 2)
                  .map((attr, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/30"
                    >
                      {attr.trim().split(":")[1]?.trim() || attr.trim()}
                    </span>
                  ))}
                {attributes.split(",").length > 2 && (
                  <span className="inline-block bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded-full">
                    +{attributes.split(",").length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="space-y-2 pt-2 border-t border-gray-700/30">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Collection #{setGroup.collection_id}</span>
              <span>{new Date(setGroup.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date(setGroup.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Mint Button Hint */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Mint Set
          </div>
        </div>

      </div>
    </Link>
  );
};
