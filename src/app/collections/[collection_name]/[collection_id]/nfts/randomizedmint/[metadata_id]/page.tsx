// src/app/randomizedmint/[metadata_id]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Work_Sans } from "next/font/google";

import axiosInstance from "@/utils/axios";
import notify, { notifyPromise, notifyResolve } from "@/utils/notify";
import { useGlobalAppStore } from "@/store/globalAppStore";
import {
  Metadata,
  MetadataSetWithAllMetadataInstances,
} from "@/utils/modelTypes";
import { selectRandomMetadata } from "@/utils/probabilityUtils";

import { LoadingSpinner, MintButton, MintSuccessModal, NFTImageDisplay, DualMintButton } from "@/components/common";
import ImageCarousel from "@/components/randomizedmint/ImageCarousel";
import NFTSetDetails from "@/components/randomizedmint/NFTSetDetails";
import { usePaidMint } from "@/app/hooks/usePaidMint";

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
  const [freeMinting, setFreeMinting] = useState(false);
  const [paidMinting, setPaidMinting] = useState(false);

  const { mintPaidNFT } = usePaidMint();

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

    setFreeMinting(true);
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
      // Log full error for debugging, but don't show technical details to user
      console.error("Error minting NFT:", error);
      notifyResolve(notifyId, "Failed to mint NFT. Please try again.", "error");
    } finally {
      setFreeMinting(false);
    }
  };

  const handlePaidMint = async () => {
    if (!metadataSet || !isWalletConnected || !walletAddress) {
      return;
    }

    setPaidMinting(true);

    try {
      // Use probability-based selection for paid mint
      const nftData = selectRandomMetadata(metadataSet.metadata);
      setSelectedMetadata(nftData);

      const nftForm = {
        collection_id: String(nftData.collection_id),
        title: nftData.title,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes || "",
        package_id: nftData.package_id,  // Get from metadata
      };

      console.log("💰 Processing paid randomized mint");

      // Resolve package id from the instance or parent collection
      const packageId = nftForm.package_id || (metadataSet as any)?.Collection?.package_id || (nftData as any)?.collection?.package_id;
      if (!packageId) {
        console.error("❌ Paid mint aborted: package_id missing for metadata", nftData);
        notify("Contract package id missing. Contact the owner or admin.", "error");
        setPaidMinting(false);
        return;
      }

      const paidForm = { ...nftForm, package_id: packageId } as any;
      const result = await mintPaidNFT(paidForm, walletAddress);

      if (result.success) {
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error("❌ Paid mint failed:", error);
    } finally {
      setPaidMinting(false);
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
              <DualMintButton
                isConnected={isWalletConnected}
                onFreeMint={handleMint}
                onPaidMint={handlePaidMint}
                freeLoading={freeMinting}
                paidLoading={paidMinting}
                freeDisabled={!isWalletConnected}
                paidDisabled={!isWalletConnected}
                freeLabel="Free Randomized Mint"
                paidLabel="Paid Randomized Mint"
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
