// src/app/randomizedmint/[metadata_id]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Work_Sans } from "next/font/google";

import axiosInstance from "@/utils/axios";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import { useGlobalAppStore } from "@/store/globalAppStore";
import {
  Metadata,
  MetadataSetWithAllMetadataInstances,
} from "@/utils/modelTypes";
import { selectRandomMetadata } from "@/utils/probabilityUtils";

import { LoadingSpinner, MintButton, MintSuccessModal, NFTImageDisplay } from "@/components/common";
import ImageCarousel from "@/components/randomizedmint/ImageCarousel";
import NFTSetDetails from "@/components/randomizedmint/NFTSetDetails";

const workSans = Work_Sans({ subsets: ["latin"] });

export default function NFTSetPage() {
  const params = useParams();
  const currentAccount = useCurrentAccount();
  const { userWalletAddress, hasWalletForChain } = useGlobalAppStore();

  const [metadataSet, setMetadataSet] =
    useState<MetadataSetWithAllMetadataInstances | null>(null);
  const [selectedMetadata, setSelectedMetadata] = useState<Metadata | null>(
    null
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isWalletConnected = mounted && hasWalletForChain("sui");
  const walletAddress = userWalletAddress || currentAccount?.address;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchNFTData = async () => {
      if (!params.metadata_id) return;

      try {
        const response = await axiosInstance.get(
          "/platform/metadata-set/by-id",
          {
            params: { metadata_set_id: params.metadata_id },
          }
        );
        setMetadataSet(response.data.metadataSet);
      } catch (error) {
        console.error("Error fetching metadata set:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [params.metadata_id]);

  const handleMint = async () => {
    if (!metadataSet || !isWalletConnected || !walletAddress) return;

    const notifyId = notifyPromise("Minting NFT...", "info");

    try {
      // Use probability-based selection
      const nftData = selectRandomMetadata(metadataSet.metadata);

      setSelectedMetadata(nftData);

      const nftForm = {
        collection_id: nftData.collection_id,
        name: nftData.title,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes || "",
        recipient: walletAddress,
        metadata_id: nftData.id,
      };

      await axiosInstance.post("/platform/sui/mint-nft", nftForm, {
        params: { user_address: walletAddress },
      });

      notifyResolve(notifyId, "NFT Minted Successfully!", "success");
      setShowSuccessModal(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Error minting NFT";
      notifyResolve(notifyId, errorMessage, "error");
      console.error("Error minting NFT:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading NFT Set..." />;
  }

  if (!metadataSet) {
    return <LoadingSpinner message="NFT Set not found" />;
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] ${workSans.className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <ImageCarousel images={metadataSet.metadata} />

          <div className="w-full space-y-6">
            <NFTSetDetails metadataSet={metadataSet} />

            <div className="">
              <MintButton 
                isConnected={isWalletConnected} 
                onMint={handleMint}
                label="Mint Random NFT"
                helperText="Get a random NFT from this Set"
              />
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && selectedMetadata && walletAddress && (
        <MintSuccessModal
          onClose={() => setShowSuccessModal(false)}
          nftData={selectedMetadata}
          userAddress={walletAddress}
          metadataId={selectedMetadata.id}
        />
      )}
    </div>
  );
}
