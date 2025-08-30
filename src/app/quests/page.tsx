"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import ConnectButton from "@/components/ConnectButton";
import { ArrowRight } from "lucide-react";
import { useCollectionById } from "@/hooks/useCollections";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";
import Image from "next/image";

interface Quest {
  id: number;
  title: string;
  description: string;
  quest_code: string;
  points_reward: number;
  is_completed?: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

const QuestsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();

  const [mounted, setMounted] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<{
    name: string;
    description: string;
    image_url: string;
    recipient: string;
  } | null>(null);

  // Ensure component is mounted before accessing browser APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only compute wallet state after mounting to prevent hydration mismatch
  const walletAddress = mounted ? currentAccount?.address || zkAddress : null;
  const isWalletConnected = mounted && !!walletAddress;

  const cid = searchParams.get("collection_id");
  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(cid!);
  console.log("collection", collection);

  // Check localStorage for global NFT minted status when quests are loaded
  useEffect(() => {
    if (!mounted) return; // Don't access localStorage before mounting

    if (quests.length > 0) {
      const completedQuests = quests.filter(
        (quest) => quest.is_completed
      ).length;
      const totalQuests = quests.length;
      const currentCompletionPercentage =
        totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

      const savedNftStatus = localStorage.getItem("nft_minted_ns_daily");
      if (savedNftStatus === "true" && currentCompletionPercentage === 100) {
        setNftMinted(true);
      } else if (currentCompletionPercentage < 100) {
        // Reset minted status if quests aren't completed
        setNftMinted(false);
        localStorage.removeItem("nft_minted_ns_daily");
      }
    }
  }, [quests, mounted]);

  const prevIsConnectedRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!mounted) return;
    const prev = prevIsConnectedRef.current;
    prevIsConnectedRef.current = isWalletConnected;

    // Show spinner when wallet state changes
    if (prev !== isWalletConnected) {
      setLoading(true);
      setInitialLoad(true);
    }

    if (prev === true && isWalletConnected === false) {
      if (quests.length > 0) {
        setQuests((prevQuests) =>
          prevQuests.map((q) => ({ ...q, is_completed: false }))
        );
      }
      setNftMinted(false);
      try {
        localStorage.removeItem("nft_minted_ns_daily");
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith("quest_progress_session_"))
            keysToRemove.push(k);
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
  }, [mounted, isWalletConnected, quests.length]);

  // Only compute these values after mounting to prevent hydration mismatch
  const completedQuests =
    mounted && isWalletConnected && !loading
      ? quests.filter((q) => q.is_completed).length
      : 0;
  const totalQuests = !loading ? quests.length : 0;
  const completionPercentage =
    mounted && isWalletConnected && !loading && totalQuests > 0
      ? Math.round((completedQuests / totalQuests) * 100)
      : 0;

  const fetchQuests = async () => {
    // SAFETY CHECK: Don't proceed if collection is not available
    if (!collection || !collection.owner_id) {
      console.log("⚠️ Collection not available yet, skipping quest fetch");
      return [];
    }

    try {
      setLoading(true);
      const walletAddress = currentAccount?.address || zkAddress;
      console.log(
        "🔍 fetchQuests called with wallet:",
        walletAddress,
        "mounted:",
        mounted,
        "isWalletConnected:",
        isWalletConnected,
        "collection:",
        collection
      );

      const params: { owner_id: number; wallet_address?: string } = {
        owner_id: collection.owner_id, // Now safe because we checked above
      };
      if (walletAddress) {
        params.wallet_address = walletAddress;
      }

      const response = await axiosInstance.get("/platform/quest/by-owner", {
        params,
      });
      console.log("📡 Raw API response:", response.data.quests);

      let sessionCompleted: number[] = [];
      try {
        const sessionKey = walletAddress
          ? `quest_progress_session_${walletAddress}`
          : null;
        sessionCompleted = sessionKey
          ? JSON.parse(sessionStorage.getItem(sessionKey) || "[]")
          : [];
        console.log("📦 Session completed quests:", sessionCompleted);
      } catch {}

      const transformedQuests = (response.data.quests || []).map(
        (quest: any) => {
          const isCompletedFromAPI = quest.userProgress?.isCompleted || false;
          const isCompletedFromSession = sessionCompleted.includes(quest.id);
          const isCompleted = isCompletedFromAPI || isCompletedFromSession;

          console.log(`🎯 Quest ${quest.quest_code}:`, {
            id: quest.id,
            userProgress: quest.userProgress,
            isCompletedFromAPI,
            isCompletedFromSession,
            finalCompleted: isCompleted,
            walletConnected: !!walletAddress,
          });

          return {
            id: quest.id,
            title: quest.title,
            description: quest.description,
            quest_code: quest.quest_code,
            points_reward: quest.reward_loyalty_points,
            owner_id: quest.owner_id,
            created_at: quest.createdAt,
            updated_at: quest.updatedAt,
            is_completed: walletAddress ? isCompleted : false,
          } as Quest;
        }
      );

      const completedCount = transformedQuests.filter(
        (q: Quest) => q.is_completed
      ).length;
      console.log(
        `📊 Final quest state: ${completedCount}/${transformedQuests.length} completed`
      );

      // Only set quests if we have valid data
      if (transformedQuests.length > 0) {
        setQuests(transformedQuests);
        return transformedQuests;
      } else {
        console.log("⚠️ No quests returned from API, keeping spinner active");
        return [];
      }
    } catch (err) {
      console.error("❌ Error fetching quests:", err);
      toast.error("Failed to load quests");
      return [];
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // FIXED: Added collection to dependencies and proper safety checks
  useEffect(() => {
    if (mounted && collection && collection.owner_id) {
      console.log("🚀 Collection available, fetching quests...", collection);
      setLoading(true);
      fetchQuests();
    }
  }, [user?.id, walletAddress, mounted, collection]); // Added collection to dependencies

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "quest_progress_ping" && e.newValue) {
        console.log("🔄 Cross-tab sync triggered:", e.newValue);
        fetchQuests();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [collection]); // Added collection dependency

  useEffect(() => {
    if (mounted && isWalletConnected && collection && collection.owner_id) {
      fetchQuests();
    }
  }, [mounted, isWalletConnected, collection]); // Added collection dependency

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  // Show loading while collection is being fetched
  if (isCollectionLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white">
            Loading Collection...
          </h2>
        </div>
      </div>
    );
  }

  // Show error if collection failed to load
  if (isCollectionError || !collection) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Collection Not Found
          </h2>
          <p className="text-gray-400 mb-6">Unable to load collection data</p>
          <button
            onClick={() => router.push("/collections")}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  // Show loading while quests are being fetched
  if (initialLoad || loading || quests.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white">Loading Quests...</h2>
          <p className="text-gray-400 mt-2">Collection: {collection?.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        {/* Back Button - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => {
              try {
                const cid = searchParams.get("collection_id");
                if (cid) {
                  router.push(`/loyalties/${cid}`);
                  return;
                }
                router.push("/loyalties/214");
              } catch {
                if (typeof window !== "undefined" && window.history.length > 1)
                  window.history.back();
                else router.push("/loyalties");
              }
            }}
            className="text-white hover:text-gray-300 font-semibold transition-colors duration-300 flex items-center gap-2"
          >
            ← Back
          </button>
        </div>
        <div className="absolute top-4 right-4 z-[9999]">
          <ConnectButton />
        </div>
      </div>

      {/* NFT Reward Section - Above Header */}
      <div className="pt-32 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Large NFT Display */}
          <div className="max-w-4xl mx-auto mb-24">
            <div className="flex items-center space-x-8">
              {/* Large NFT Image */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-2xl shadow-2xl border-2 border-purple-300/30 overflow-hidden">
                  {collection.name === "NS" ? (
                    <img
                      src="https://client-uploads.nyc3.digitaloceanspaces.com/images/3b1daaad-c7dc-4884-a78b-739a3ce3dfaa/2025-08-28T12-25-58-895Z-38bc0eae.png"
                      alt="NS Daily NFT"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={backgroundImageHeroSection}
                      alt="NS Daily NFT"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              {/* NFT Info */}
              <div className="flex-1 max-w-lg">
                <h2 className="text-3xl font-bold text-white mb-3">
                  {collection.name}
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Complete the tasks for the day to claim this reward.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Available Quests
            </h1>
            {mounted && isWalletConnected && !loading && (
              <div className="max-w-md mx-auto mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-semibold text-white">
                    {completedQuests}/{totalQuests} ({completionPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="group bg-gray-900 border border-gray-700 rounded-lg p-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-white">
                        {quest.title}
                      </h3>
                      <p className="text-gray-400 text-xs hidden md:block">
                        {quest.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {quest.is_completed ? (
                      <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-700">
                        ✓ Completed
                      </span>
                    ) : !isWalletConnected ? (
                      <span className="text-sm text-gray-400 bg-gray-800/20 px-4 py-1 rounded border border-gray-600">
                        Connect Wallet to Claim
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 bg-gray-800/20 px-4 py-1 rounded border border-gray-600">
                        Not Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Claim NFT Button */}
          {quests.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={async () => {
                  if (nftMinted) {
                    toast("NFT already minted for today's quests!");
                    return;
                  }
                  if (completionPercentage !== 100) {
                    toast.error("Complete all quests to claim the NFT");
                    return;
                  }
                  if (!currentAccount?.address && !zkAddress) {
                    toast.error("Please connect your wallet to claim the NFT", {
                      duration: 5000,
                      style: {
                        background: "#1f2937",
                        color: "#fff",
                        border: "1px solid #374151",
                      },
                    });
                    return;
                  }

                  setClaiming(true);
                  try {
                    const walletAddress = currentAccount?.address || zkAddress;
                    const nftData = {
                      collection_id: cid,
                      name: collection.name,
                      description: collection.description,
                      image_url: collection.image_uri,
                      attributes: collection.attributes.split(", "),
                      recipient: walletAddress!,
                    };

                    const response = await axiosInstance.post(
                      "/platform/sui/mint-nft",
                      nftData
                    );

                    if (response.data.success) {
                      // Store NFT data and show modal
                      setMintedNftData({
                        name: nftData.name,
                        description: nftData.description,
                        image_url: nftData.image_url,
                        recipient: nftData.recipient,
                      });
                      setNftMinted(true);

                      // Save to localStorage for global state across pages
                      localStorage.setItem("nft_minted_ns_daily", "true");

                      setShowNftModal(true);

                      // Still show the toast for immediate feedback
                      toast.success("🎉 NS Daily NFT minted successfully!");
                    } else {
                      toast.error(
                        response.data.message || "Failed to claim NFT"
                      );
                    }
                  } catch (error: any) {
                    console.error("Error claiming NFT:", error);
                    const errorMessage =
                      error.response?.data?.message || "Failed to claim NFT";
                    if (
                      errorMessage.includes("already minted") ||
                      errorMessage.includes("already claimed")
                    ) {
                      setNftMinted(true);
                      localStorage.setItem("nft_minted_ns_daily", "true");
                      toast.error("NFT already minted for today's quests!");
                    } else {
                      toast.error(errorMessage);
                    }
                  } finally {
                    setClaiming(false);
                  }
                }}
                disabled={claiming || !isWalletConnected}
                className={`
                    px-8 py-2 rounded-lg font-semibold text-lg transition-all duration-300 transform
                    ${
                      nftMinted
                        ? "bg-white text-black cursor-default"
                        : !isWalletConnected
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60"
                        : completionPercentage === 100 && !claiming
                        ? "bg-white text-black shadow-lg hover:shadow-xl cursor-pointer"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                    }
                  `}
              >
                {nftMinted
                  ? " NFT Minted"
                  : claiming
                  ? " Minting NFT..."
                  : !isWalletConnected
                  ? "Connect Wallet to Claim NFT"
                  : completionPercentage === 100
                  ? "Claim NFT"
                  : `Complete ${
                      totalQuests - completedQuests
                    } more quests to Claim NFT`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NFT Minted Success Modal */}
      {showNftModal && mintedNftData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md">
          {/* Particle Effects Background - Around the modal */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full animate-ping"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Minimal Modal Content */}
          <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full mx-4 border border-white/10 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowNftModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            {/* Profile Navigation Arrow */}
            <button
              onClick={() => {
                const userAddress = currentAccount?.address || zkAddress;
                if (userAddress) {
                  router.push(`/profile/${userAddress}`);
                  setShowNftModal(false);
                }
              }}
              className="absolute top-4 right-16 text-gray-400 hover:text-blue-400 transition-colors flex flex-row items-center gap-1"
              title="View in Profile"
            >
              <span className="text-xs">View in Profile</span>
              <ArrowRight size={16} />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* NFT Image */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden border border-white/20">
                <img
                  src={mintedNftData.image_url}
                  alt={mintedNftData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-white mb-2">
                {mintedNftData.name}
              </h2>
              <p className="text-green-400 text-sm mb-4">
                Successfully minted! ✨
              </p>

              {/* Wallet */}
              <div className="bg-white/5 rounded-lg p-3 mb-6">
                <p className="text-gray-400 text-xs mb-1">Sent to:</p>
                <p className="text-white font-mono text-xs break-all">
                  {mintedNftData.recipient.slice(0, 8)}...
                  {mintedNftData.recipient.slice(-8)}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowNftModal(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuestsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white">Loading...</h2>
          </div>
        </div>
      }
    >
      <QuestsPageContent />
    </Suspense>
  );
};

export default QuestsPage;
