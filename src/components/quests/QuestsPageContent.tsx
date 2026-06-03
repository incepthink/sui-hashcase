// sui components/QuestsPageContent.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";
import EmptyState from "@/components/collectionShell/EmptyState";
import ContentSkeleton from "@/components/collectionShell/ContentSkeleton";
import { collectionTheme, eventTheme } from "@/components/collectionShell/theme";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCollectionById } from "@/hooks/useCollections";
import { useQuests } from "@/hooks/useQuests";
import axiosInstance from "@/utils/axios";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

// Components
import { ErrorScreen } from "./ErrorScreen";
import { Navigation } from "./Navigation";
import { NFTDisplay } from "./NFTDisplay";
import { QuestHeader } from "./QuestHeader";
import { QuestList } from "./QuestList";
import { NFTSuccessModal } from "./NFTSuccessModal";

// ===== TYPE DEFINITIONS =====

interface MintedNftData {
  name: string;
  description: string;
  image_url: string;
  recipient: string;
}

interface MetadataInstance {
  id: number;
  title: string;
  description: string;
  image_url: string;
  token_uri: string;
  attributes: string;
  collection: {
    id: number;
    name: string;
    description: string;
    image_uri: string;
    chain_name: string;
  };
  collection_id: number;
  animation_url?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  set_id?: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RequirementRule {
  type: string;
  value: any;
}

interface Task {
  id: number;
  quest_id: number;
  owner_id: number;
  title: string;
  description: string | null;
  task_code: string | null;
  requirement_rules: RequirementRule[] | string;
  required_completions: number;
  reward_loyalty_points: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  isCompleted: boolean;
}

interface Quest {
  id: number;
  owner_id: number;
  title: string;
  description?: string;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  claimable_metadata?: number | null;
  tasksWithCompletion: Task[];
  total_tasks: number;
  completed_tasks: number;
  is_completed: boolean;
  total_points: number;
}

// ===== MAIN COMPONENT =====

const QuestsPageContent = ({ collectionId }: any) => {
  // ===== ROUTER & NAVIGATION =====
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isEventTheme = pathname?.startsWith("/event/");
  const shellTheme = isEventTheme ? eventTheme : collectionTheme;

  // ===== GLOBAL STATE =====
  const {
    user,
    getWalletForChain,
    hasWalletForChain,
    setOpenModal,
    isUserVerified,
    nftClaiming,
    setCanMintAgain,
    setIsMinting,
    connectedWallets,
  } = useGlobalAppStore();

  // ===== LOCAL STATE =====
  const [mounted, setMounted] = useState(false);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<MintedNftData | null>(
    null,
  );

  // Metadata states
  const [metadata, setMetadata] = useState<MetadataInstance | null>(null);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(true);
  const [metadataError, setMetadataError] = useState<string>("");

  // ===== COMPUTED VALUES =====

  // Use fallback collection_id if not present (SUI default: 215)
  const cid = collectionId || "215";

  // Get collection data
  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(cid);

  /**
   * Determine required chain type based on collection
   */
  const requiredChainType = useMemo((): "sui" | "evm" => {
    if (!collection?.contract?.Chain?.chain_type) return "sui"; // Default to SUI
    return collection.contract.Chain.chain_type === "ethereum" ? "evm" : "sui";
  }, [collection?.contract?.Chain?.chain_type]);

  /**
   * Get wallet info from global store
   */
  const walletInfo = mounted ? getWalletForChain(requiredChainType) : null;
  const walletAddress = walletInfo?.address || null;
  const isWalletConnected = mounted && hasWalletForChain(requiredChainType);

  /**
   * Check if this is NS Collection
   */
  const isNSCollection = useMemo(() => {
    return (
      collection?.name === "NS" ||
      collection?.name === "Network School Collection" ||
      collection?.name === "Network School Collection Base"
    );
  }, [collection?.name]);

  /**
   * Create collection-like object for NFTDisplay
   */
  const displayCollection = useMemo(() => {
    if (!metadata) return null;
    return {
      name: metadata.title,
      description: metadata.description,
      image_uri: metadata.image_url,
    };
  }, [metadata]);

  /**
   * Create collection-like object for ClaimNFTButton (when re-enabled)
   */
  const claimCollection = useMemo(() => {
    if (!metadata) return null;
    return {
      name: metadata.title,
      description: metadata.description,
      image_uri: metadata.image_url,
      image_url: metadata.image_url,
      attributes: metadata.attributes ? metadata.attributes.split(", ") : [],
    };
  }, [metadata]);

  /**
   * Check if minting is disabled
   */
  const isMintingDisabled = nftClaiming.isMinting;

  /**
   * Handle modal close with cleanup
   */
  const handleCloseModal = useCallback(() => {
    setShowNftModal(false);
    setTimeout(() => {
      setMintedNftData(null);
    }, 300);
  }, []);

  /**
   * Stable props for modal
   */
  const modalProps = useMemo(
    () => ({
      isOpen: showNftModal,
      onClose: handleCloseModal,
      mintedNftData,
      walletAddress,
      isNSCollection,
    }),
    [showNftModal, mintedNftData, walletAddress, isNSCollection],
  );

  // ===== DATA FETCHING =====

  /**
   * Get quests data with all completion information
   */
  const {
    quests,
    isLoading: questsLoading,
    completedQuests,
    totalQuests,
    completionPercentage,
    nftMinted,
    setNftMinted,
    refetch: refetchQuests,
  } = useQuests({
    collection,
    walletAddress,
    isWalletConnected,
    mounted,
    requiredChainType,
    userId: user?.id || null,
  });

  console.log("quests", quests);

  // ===== UTILITY FUNCTIONS =====

  /**
   * Fetch metadata from API
   */
  const fetchMetadata = async () => {
    if (!walletAddress) return;

    try {
      setMetadataLoading(true);
      setMetadataError("");

      // Note: You'll need to determine which metadata_id to use here
      // This might come from quest data or collection data
      const metadataId = 1; // Replace with actual logic

      const response = await axiosInstance.get(
        "/platform/metadata/geofenced-by-id",
        {
          params: {
            metadata_id: metadataId,
            user_address: walletAddress,
          },
        },
      );

      const { metadata_instance, can_mint_again } = response.data;

      console.log("can_mint_again", can_mint_again);
      setMetadata(metadata_instance);

      // Set minting availability based on API response
      setCanMintAgain(can_mint_again !== undefined ? can_mint_again : true);
    } catch (error: any) {
      console.error("Error fetching metadata:", error);
      setMetadataError("Failed to load NFT details");
    } finally {
      setMetadataLoading(false);
    }
  };

  // ===== EVENT HANDLERS =====

  /**
   * Handle back navigation with fallback logic
   */
  const handleBack = useCallback(() => {
    try {
      const cid = searchParams.get("collection_id");
      if (cid) {
        router.push(`/loyalties/${cid}`);
        return;
      }
      router.push("/loyalties/218"); // EVM fallback
    } catch {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        router.push("/loyalties");
      }
    }
  }, [searchParams, router]);

  /**
   * Handle successful NFT minting
   */
  const handleNFTMintSuccess = useCallback(
    (nftData: any) => {
      const formattedData: MintedNftData = {
        name: nftData.name,
        description: nftData.description,
        image_url: nftData.image_url,
        recipient: nftData.recipient,
      };
      setMintedNftData(formattedData);
      setShowNftModal(true);
      setCanMintAgain(false);
    },
    [setCanMintAgain],
  );

  // ===== EFFECTS =====

  /**
   * Set mounted state
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Fetch metadata when wallet is connected
   */
  useEffect(() => {
    if (mounted && isWalletConnected && walletAddress) {
      fetchMetadata();
    } else if (mounted && !isWalletConnected) {
      // Reset metadata when wallet disconnected
      setMetadata(null);
      setMetadataLoading(false); // Change from true to false
      setMetadataError("");
      setCanMintAgain(true);
    }
  }, [mounted, isWalletConnected, walletAddress, setCanMintAgain]);

  /**
   * Trigger quest refetch when wallet connection changes
   */
  useEffect(() => {
    if (mounted && refetchQuests) {
      refetchQuests();
    }
  }, [isWalletConnected, walletAddress, mounted, refetchQuests]);

  // ===== RENDER CONDITIONS =====

  // Loading states
  if (!mounted) {
    return <ContentSkeleton theme={shellTheme} variant="quests" />;
  }

  if (isCollectionLoading) {
    return <ContentSkeleton theme={shellTheme} variant="quests" />;
  }

  if (isCollectionError || !collection) {
    return (
      <ErrorScreen
        title="Collection Not Found"
        message="Unable to load collection data"
        onBack={() => router.push("/collections")}
        isNSCollection={isNSCollection}
      />
    );
  }

  // Show wallet connection required screen if not connected
  if (!isWalletConnected) {
    return (
      <EmptyState
        title="Login or Connect Wallet"
        description="Please Connect wallet to view quests and claim rewards"
        actionLabel="Connect Wallet or Login"
        onAction={() => setOpenModal(true)}
        accentClassName={
          isEventTheme
            ? "bg-purple-500/15 text-purple-400"
            : "bg-blue-500/15 text-blue-400"
        }
      />
    );
  }

  // Show loading screen while fetching metadata
  if (metadataLoading) {
    return <ContentSkeleton theme={shellTheme} variant="quests" />;
  }

  // Show error if metadata failed to load
  if (metadataError || !metadata) {
    return (
      <ErrorScreen
        title="Reward Details Not Found"
        message="Unable to load NFT reward details"
        onBack={handleBack}
        isNSCollection={isNSCollection}
      />
    );
  }

  if (questsLoading) {
    return <ContentSkeleton theme={shellTheme} variant="quests" />;
  }

  // ===== MAIN RENDER =====

  return (
    <div className={`py-10  pb-16`}>
      {/* <Navigation onBack={handleBack} /> */}

      {/* Main Content */}
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* NFT Display Section - Using Dynamic Metadata */}
          {/* <NFTDisplay
            collection={collection}
            backgroundImage={backgroundImageHeroSection}
          /> */}

          {/* Quest Section */}
          <QuestHeader
            completedQuests={completedQuests}
            totalQuests={totalQuests}
            completionPercentage={completionPercentage}
            showProgress={mounted && isWalletConnected && !questsLoading}
            requiredChainType={requiredChainType}
            theme={shellTheme}
          />

          {/* Quest List */}
          <QuestList
            quests={quests}
            isWalletConnected={isWalletConnected}
            requiredChainType={requiredChainType}
            collection={collection}
            theme={shellTheme}
          />

          {/* ========== COMMENTED OUT CLAIM NFT BUTTON ========== */}
          {/* {quests.length > 0 && claimCollection && (
            <ClaimNFTButton
              nftMinted={!nftClaiming.canMintAgain}
              completionPercentage={completionPercentage}
              totalQuests={totalQuests}
              completedQuests={completedQuests}
              collection={claimCollection}
              collectionId={cid}
              onSuccess={handleNFTMintSuccess}
              onNftMintedChange={(minted: boolean) => setCanMintAgain(!minted)}
              chain={requiredChainType === "evm" ? "ethereum" : "sui"}
              requiredChainType={requiredChainType}
              disabled={isMintingDisabled}
              onCustomClaim={handleCustomClaim}
            />
          )} */}
        </div>
      </div>

      {/* NFT Success Modal */}
      <NFTSuccessModal {...modalProps} />
    </div>
  );
};

export default QuestsPageContent;
