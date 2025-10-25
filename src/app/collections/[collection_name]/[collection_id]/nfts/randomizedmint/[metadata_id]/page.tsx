// sui-hashcase/src/app/randomizedmint/[metadata_id]/page.tsx
"use client";

import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import Eye from "@/assets/images/eye_Icon.png";
import { Work_Sans } from "next/font/google";
import { notifyPromise, notifyResolve } from "@/utils/notify";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";

import { useZkLogin } from "@mysten/enoki/react";

import { useSponsorSignAndExecute } from "../../../../../../hooks/useSponsorSignandExecute";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

import axiosInstance from "@/utils/axios";
import UnlockableNft from "./UnlockableNft";
import MintSuccessModal from "./MintSuccessModal";

import Slider from "react-slick"; // For carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  EmittedNFTInfo,
  Metadata,
  MetadataSetWithAllMetadataInstances,
} from "@/utils/modelTypes";
import ConnectButton from "@/components/ConnectButton";
import { useGlobalAppStore } from "@/store/globalAppStore";

const workSans = Work_Sans({ subsets: ["latin"] });

const mainnet_loyalty =
  process.env.MAINNET_LOYALTY_PACKAGE_ID ||
  "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";

const ImageCarousel = ({ images }: { images: Metadata[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Main Image Display */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
        <img
          src={images[currentIndex].image_url}
          alt={images[currentIndex].title}
          className="w-full h-full object-contain p-4"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm border border-white/10"
              aria-label="Previous"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 backdrop-blur-sm border border-white/10"
              aria-label="Next"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-3 mt-5 justify-center pb-2">
          {images.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                index === currentIndex
                  ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#00041F] scale-110"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NFTSetPage() {
  const params = useParams();
  const [metadataSet, setMetadataSet] =
    useState<MetadataSetWithAllMetadataInstances | null>(null);
  const [selectedMetadata, setSelectedMetadata] = useState<Metadata | null>(
    null
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const currentAccount = useCurrentAccount();
  const { userWalletAddress, hasWalletForChain } = useGlobalAppStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWalletConnected = mounted && hasWalletForChain("sui");

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        const metadata_set = await axiosInstance.get(
          "/platform/metadata-set/by-id",
          {
            params: {
              metadata_set_id: params.metadata_id,
            },
          }
        );

        setMetadataSet(metadata_set.data.metadataSet);
      } catch (error) {
        console.error("Error fetching metadata set:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.metadata_id) {
      fetchNFTData();
    }
  }, [params.metadata_id]);

  const createFreeMintNft = async () => {
    if (!metadataSet || !isWalletConnected) return;

    const notifyId = notifyPromise("Minting NFT...", "info");

    try {
      const randomNum = Math.floor(Math.random() * 1000);
      const selectedIndex = randomNum % metadataSet.metadata.length;
      const nftData = metadataSet.metadata[selectedIndex];

      setSelectedMetadata(nftData);

      const nftForm = {
        collection_id: nftData.collection_id,
        name: nftData.title,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes || "",
        recipient: userWalletAddress,
        metadata_id: nftData.id,
      };
      console.log(nftForm);

      const mintAndTransferResponse = await axiosInstance.post(
        "/platform/sui/mint-nft",
        nftForm,
        {
          params: {
            user_address: userWalletAddress || currentAccount?.address,
          },
        }
      );

      notifyResolve(notifyId, "NFT Minted Successfully!", "success");
      setShowSuccessModal(true);
    } catch (error: any) {
      notifyResolve(notifyId, error.response.data.error, "error");
      console.error("Error minting NFT:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading NFT Set...</p>
        </div>
      </div>
    );
  }

  if (!metadataSet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">NFT Set not found</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] ${workSans.className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Image Carousel */}
          <div className="w-full">
            <ImageCarousel images={metadataSet.metadata} />
          </div>

          {/* Right Column - Set Details */}
          <div className="w-full space-y-6">
            {/* Set Title & Info */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                {metadataSet.name}
              </h1>

              <div className="flex flex-wrap gap-3">
                {metadataSet.isRandomized && (
                  <div className="flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-lg border border-orange-500/30">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                    <span className="font-medium">Randomized</span>
                  </div>
                )}
                {metadataSet.isUpgradable && (
                  <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-lg border border-green-500/30">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Upgradable</span>
                  </div>
                )}
              </div>
            </div>

            {/* NFT List */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white/90">
                Available NFTs ({metadataSet.metadata.length})
              </h2>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {metadataSet.metadata.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mint Button */}
            <div className="pt-4">
              {isWalletConnected ? (
                <button
                  onClick={createFreeMintNft}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-white/10 flex items-center justify-center gap-3"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Mint Random NFT
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              ) : (
                <ConnectButton mid={true} />
              )}
              <p className="text-center text-gray-400 text-sm mt-3">
                {isWalletConnected && "Get a random NFT from this Set"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && selectedMetadata && (
        <MintSuccessModal
          onClose={() => setShowSuccessModal(false)}
          nftData={selectedMetadata}
          userAddress={(userWalletAddress || currentAccount?.address)!}
          metadataId={selectedMetadata.id}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
