// sui-hashcase/src/app/upgradablemint/[metadata_id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Work_Sans } from "next/font/google";
import axiosInstance from "@/utils/axios";
import {
  MetadataSetWithAllMetadataInstances,
  Metadata,
} from "@/utils/modelTypes";
import ConnectButton from "@/components/ConnectButton";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import { MintSuccessModal, LoadingSpinner } from "@/components/common";

const workSans = Work_Sans({ subsets: ["latin"] });

type MetadataWithMintStatus = Metadata & {
  minted: boolean;
};

type MetadataSetWithProgress = Omit<
  MetadataSetWithAllMetadataInstances,
  "metadata"
> & {
  metadata: MetadataWithMintStatus[];
};

export default function UpgradableMintPage() {
  const params = useParams();
  const [metadataSet, setMetadataSet] =
    useState<MetadataSetWithProgress | null>(null);
  const [currentNFTIndex, setCurrentNFTIndex] = useState(0);
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
          "/platform/metadata-set/upgradable/by-id",
          {
            params: {
              metadata_set_id: params.metadata_id,
              user_address: userWalletAddress || currentAccount?.address,
            },
          }
        );

        const setData = metadata_set.data.metadataSet;
        setMetadataSet(setData);

        // Find the first non-minted NFT (current level)
        const firstUnmintedIndex = setData.metadata.findIndex(
          (m: MetadataWithMintStatus) => !m.minted
        );

        // If all minted, set to last index, otherwise set to first unminted
        setCurrentNFTIndex(
          firstUnmintedIndex === -1
            ? setData.metadata.length - 1
            : firstUnmintedIndex
        );
      } catch (error) {
        console.error("Error fetching metadata set:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.metadata_id && (userWalletAddress || currentAccount?.address)) {
      fetchNFTData();
    }
  }, [params.metadata_id, userWalletAddress, currentAccount?.address]);

  const createUpgradableMintNft = async () => {
    if (!metadataSet || !isWalletConnected) return;

    const notifyId = notifyPromise("Minting NFT...", "info");

    try {
      const nftData = metadataSet.metadata[currentNFTIndex];

      if (nftData.minted) {
        notifyResolve(notifyId, "This level is already minted!", "warning");
        return;
      }

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

      // Update the minted status locally
      setMetadataSet((prev) => {
        if (!prev) return prev;
        const updatedMetadata = [...prev.metadata];
        updatedMetadata[currentNFTIndex] = {
          ...updatedMetadata[currentNFTIndex],
          minted: true,
        };
        return { ...prev, metadata: updatedMetadata };
      });

      // Move to next level if not at the end
      if (currentNFTIndex < metadataSet.metadata.length - 1) {
        setCurrentNFTIndex((prev) => prev + 1);
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      notifyResolve(
        notifyId,
        error.response?.data?.error || "Failed to mint NFT",
        "error"
      );
      console.error("Error minting NFT:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading NFT Set..." />;
  }

  if (!metadataSet) {
    return <LoadingSpinner message="NFT Set not found" />;
  }

  const currentNFT = metadataSet.metadata[currentNFTIndex];
  const allMinted = metadataSet.metadata.every((m) => m.minted);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] ${workSans.className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Current NFT Display */}
          <div className="w-full">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
              <img
                src={currentNFT.image_url}
                alt={currentNFT.title}
                className="w-full h-full object-contain p-4"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

              {/* Level Badge */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10">
                Level {currentNFTIndex + 1} {currentNFT.minted && "✓"}
              </div>
            </div>
          </div>

          {/* Right Column - Set Details */}
          <div className="w-full space-y-6">
            {/* Set Title & Info */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                {metadataSet.name}
              </h1>

              <div className="flex flex-wrap gap-3">
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
              </div>
            </div>

            {/* All Levels List */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white/90">
                Available NFTs ({metadataSet.metadata.length})
              </h2>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {metadataSet.metadata.map((item, index) => (
                  <div
                    key={item.id}
                    className={`bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 transition-all duration-200 ${
                      index === currentNFTIndex
                        ? "border-2 border-purple-500/60 shadow-lg shadow-purple-500/20"
                        : "border border-blue-500/20 hover:border-blue-500/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-400">
                            Level {index + 1}
                          </span>
                          {item.minted && (
                            <span className="text-green-400 text-xs">✓</span>
                          )}
                          {index === currentNFTIndex && (
                            <span className="text-purple-400 text-xs font-semibold">
                              → Current
                            </span>
                          )}
                        </div>
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

            {/* Mint/Upgrade Button */}
            <div className="pt-4">
              {isWalletConnected ? (
                <button
                  onClick={createUpgradableMintNft}
                  disabled={allMinted || currentNFT.minted}
                  className={`w-full font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 transform border-2 flex items-center justify-center gap-3 ${
                    allMinted || currentNFT.minted
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed border-gray-500"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 shadow-lg hover:shadow-xl border-white/10"
                  }`}
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
                  {allMinted
                    ? "Max Level Reached"
                    : currentNFT.minted
                    ? "Level Already Minted"
                    : currentNFTIndex === 0
                    ? "Mint Level 1"
                    : `Upgrade to Level ${currentNFTIndex + 1}`}
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
                {isWalletConnected &&
                  (allMinted
                    ? "🎉 You've reached the max level!"
                    : `Mint to unlock Level ${currentNFTIndex + 1}`)}
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
