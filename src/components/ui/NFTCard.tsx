"use client";

import React from "react";
import Link from "next/link";
import { NFTMetadata } from "@/utils/modelTypes";
import { MapPin, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";

interface NFTCardProps {
  nft: NFTMetadata;
  collectionName: string;
  collectionId: string;
  basePath?: string;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  collectionName,
  collectionId,
  basePath = "/collections",
}) => {
  // Check if this is a location-based NFT
  const hasLocation = "location" in nft && nft.location === true;

  const { user } = useGlobalAppStore();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let baseUrl = `${window.location.origin}${basePath}/${collectionName}/${collectionId}/nfts/freemint/${nft.id}`;
    console.log(user);
    try {
      if (user?.id) {
        const { data } = await axiosInstance.get("/user/referral/code", {
          params: { user_id: user.id },
        });
        baseUrl += `?code=${data.referral_code.code}`;
      }
      await navigator.clipboard.writeText(baseUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Link
      href={`${basePath}/${collectionName}/${collectionId}/nfts/freemint/${nft.id}`}
    >
      <div className="group relative bg-gradient-to-br from-[#0a0f3b] to-[#050a2e] shadow-xl rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:from-[#141a52] hover:to-[#0a0f3b] cursor-pointer border border-gray-700/30 h-full">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={
              nft.image_url ||
              "https://via.placeholder.com/400x300?text=No+Image"
            }
            alt={nft.title}
            className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "https://via.placeholder.com/400x300?text=Image+Not+Found";
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Title + Share */}
          <div className="flex items-center justify-between mb-2 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-1">
              {nft.title}
            </h2>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 shrink-0 bg-green-500 hover:bg-green-600 text-white text-xs px-2.5 py-1 rounded-full font-medium transition-colors duration-200"
              title="Copy share link"
            >
              Share <Share2 className="w-3 h-3" />
            </button>
          </div>

          {/* Location Badge */}
          {hasLocation && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/30">
                <MapPin className="w-3 h-3" />
                Location
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
            {nft.description}
          </p>

          {/* Attributes */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {nft.attributes &&
                nft.attributes
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
              {nft.attributes && nft.attributes.split(",").length > 2 && (
                <span className="inline-block bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded-full">
                  +{nft.attributes.split(",").length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="space-y-2 pt-2 border-t border-gray-700/30">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Collection #{nft.collection_id}</span>
              <span>{new Date(nft.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date(nft.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Mint Button Hint */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {hasLocation ? "View Location" : "Mint"}
          </div>
        </div>
      </div>
    </Link>
  );
};
