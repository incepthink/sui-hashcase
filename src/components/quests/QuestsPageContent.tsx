// components/QuestsPageContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
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
  const { user } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();

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

  const walletAddress = mounted ? currentAccount?.address || zkAddress : null;
  const isWalletConnected = mounted && !!walletAddress;
  const cid = searchParams.get("collection_id");

  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(cid!);

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

  const isNSCollection = collection.name === "NS";

  return (
    <div
      className={`min-h-screen ${isNSCollection ? "bg-black" : "bg-[#000421]"}`}
    >
      <Navigation onBack={handleBack} />

      {/* Main Content */}
      <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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
          />

          {/* Quest List */}
          <QuestList quests={quests} isWalletConnected={isWalletConnected} />

          {/* Claim NFT Button */}
          {quests.length > 0 && (
            <ClaimNFTButton
              nftMinted={nftMinted}
              isWalletConnected={isWalletConnected}
              completionPercentage={completionPercentage}
              totalQuests={totalQuests}
              completedQuests={completedQuests}
              walletAddress={walletAddress}
              collection={collection}
              collectionId={cid!}
              onSuccess={handleNFTMintSuccess}
              onNftMintedChange={setNftMinted}
              chain={collection.chain_name} // You can change this or make it dynamic
            />
          )}
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
