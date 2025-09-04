// components/QuestsPageContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import { useAccount } from "wagmi";
import { useCollectionById } from "@/hooks/useCollections";
import { useQuests } from "@/hooks/useQuests";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

// Components
import { LoadingScreen } from "./LoadingScreen";
import { ErrorScreen } from "./ErrorScreen";
import { Navigation } from "./Navigation";
import { NFTDisplay } from "./NFTDisplay";
import { QuestHeader } from "./QuestHeader";
import { QuestList } from "./QuestList";
import { ClaimNFTButton } from "./ClaimNFTButton";
import { NFTSuccessModal } from "./NFTSuccessModal";

const QuestsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, getWalletForChain, hasWalletForChain, setOpenModal } =
    useGlobalAppStore();

  // Wallet connections
  const currentAccount = useCurrentAccount(); // Sui wallet
  const { address: zkAddress } = useZkLogin(); // Sui zkLogin
  const { address: evmAddress } = useAccount(); // EVM wallet

  const [mounted, setMounted] = useState(false);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<{
    name: string;
    description: string;
    image_url: string;
    recipient: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cid = searchParams.get("collection_id");

  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(cid!);

  // Determine required chain type based on collection
  const getRequiredChainType = (): "sui" | "evm" => {
    if (!collection?.contract?.Chain?.chain_type) return "sui"; // Default fallback
    return collection.contract.Chain.chain_type === "ethereum" ? "evm" : "sui";
  };

  // Get the appropriate wallet address for this collection
  const getWalletAddress = (): string | null => {
    if (!mounted) return null;

    const requiredChain = getRequiredChainType();
    const walletInfo = getWalletForChain(requiredChain);
    return walletInfo?.address || null;
  };

  // Check if user has the correct wallet connected
  const isCorrectWalletConnected = (): boolean => {
    if (!mounted) return false;
    const requiredChain = getRequiredChainType();
    return hasWalletForChain(requiredChain);
  };

  const walletAddress = getWalletAddress();
  const isWalletConnected = isCorrectWalletConnected();
  const requiredChainType = getRequiredChainType();

  const {
    quests,
    isLoading: questsLoading,
    completedQuests,
    totalQuests,
    completionPercentage,
    nftMinted,
    setNftMinted,
  } = useQuests({
    collection,
    walletAddress,
    isWalletConnected,
    mounted,
    requiredChainType, // Pass the chain type
  });

  const handleBack = () => {
    try {
      const cid = searchParams.get("collection_id");
      if (cid) {
        router.push(`/loyalties/${cid}`);
        return;
      }
      router.push("/loyalties/214");
    } catch {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        router.push("/loyalties");
      }
    }
  };

  const handleNFTMintSuccess = (nftData: any) => {
    setMintedNftData({
      name: nftData.name,
      description: nftData.description,
      image_url: nftData.image_url,
      recipient: nftData.recipient,
    });
    setShowNftModal(true);
  };

  // Loading states
  if (!mounted) {
    return (
      <LoadingScreen
        message="Loading..."
        isNSCollection={collection?.name === "NS"}
      />
    );
  }

  if (isCollectionLoading) {
    return (
      <LoadingScreen
        message="Loading Collection..."
        isNSCollection={collection?.name === "NS"}
      />
    );
  }

  if (isCollectionError || !collection) {
    return (
      <ErrorScreen
        title="Collection Not Found"
        message="Unable to load collection data"
        onBack={() => router.push("/collections")}
        isNSCollection={collection?.name === "NS"}
      />
    );
  }

  if (questsLoading || quests.length === 0) {
    return (
      <LoadingScreen
        message="Loading Quests..."
        collectionName={collection?.name}
        isNSCollection={collection?.name === "NS"}
      />
    );
  }

  const isNSCollection =
    collection.name === "NS" || collection.name === "Network School Collection";

  return (
    <div
      className={`min-h-screen ${isNSCollection ? "bg-black" : "bg-[#000421]"}`}
    >
      <Navigation onBack={handleBack} />

      {/* Main Content */}
      <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Chain Type Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20">
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isWalletConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-white">
                    {isWalletConnected
                      ? `Connected to ${requiredChainType.toUpperCase()} wallet`
                      : `${requiredChainType.toUpperCase()} wallet required`}
                  </span>
                  {!isWalletConnected && (
                    <button
                      onClick={() => setOpenModal(true)}
                      className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* NFT Display Section */}
          <NFTDisplay
            collection={collection}
            backgroundImage={backgroundImageHeroSection}
          />

          {/* Quest Section */}
          <QuestHeader
            completedQuests={completedQuests}
            totalQuests={totalQuests}
            completionPercentage={completionPercentage}
            showProgress={mounted && isWalletConnected && !questsLoading}
            requiredChainType={requiredChainType} // Pass chain type
          />

          {/* Quest List */}
          <QuestList
            quests={quests}
            isWalletConnected={isWalletConnected}
            requiredChainType={requiredChainType} // Pass chain type
          />

          {/* Claim NFT Button */}
          {quests.length > 0 && (
            <ClaimNFTButton
              nftMinted={nftMinted}
              completionPercentage={completionPercentage}
              totalQuests={totalQuests}
              completedQuests={completedQuests}
              collection={collection}
              collectionId={cid!}
              onSuccess={handleNFTMintSuccess}
              onNftMintedChange={setNftMinted}
              chain={requiredChainType === "evm" ? "ethereum" : "sui"}
              requiredChainType={requiredChainType} // Pass chain type
            />
          )}

          {/* Wallet Warning Section */}
          {/* {!isWalletConnected && quests.length > 0 && (
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-yellow-500 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-yellow-400">
                    {requiredChainType.toUpperCase()} Wallet Required
                  </h3>
                  <p className="text-sm text-yellow-300/80 mt-1">
                    This collection requires a{" "}
                    {requiredChainType === "evm"
                      ? "EVM wallet (MetaMask, Phantom, Coinbase)"
                      : "Sui wallet or Google login"}{" "}
                    to complete quests and claim NFTs.
                  </p>
                  <button
                    onClick={() => setOpenModal(true)}
                    className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-md transition-colors"
                  >
                    Connect {requiredChainType.toUpperCase()} Wallet
                  </button>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* NFT Success Modal */}
      <NFTSuccessModal
        isOpen={showNftModal}
        onClose={() => setShowNftModal(false)}
        mintedNftData={mintedNftData}
        walletAddress={walletAddress}
        isNSCollection={isNSCollection}
      />
    </div>
  );
};

export default QuestsPageContent;
