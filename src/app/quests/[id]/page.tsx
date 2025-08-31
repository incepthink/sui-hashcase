"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import ConnectButton from "@/components/ConnectButton";
import { ArrowRight } from "lucide-react";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";
import Image, { StaticImageData } from "next/image";

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

const QuestDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const activeQuestCode = String(params?.id || "");
  const allowClaim = true;

  const [mounted, setMounted] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimingQuestId, setClaimingQuestId] = useState<number | null>(null);
  const [nftMinted, setNftMinted] = useState(false);

  const isSuper = activeQuestCode === "Q5541" || "Q9866" || "Q1257";

  useEffect(() => {
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
        setNftMinted(false);
        localStorage.removeItem("nft_minted_ns_daily");
      }
    }
  }, [quests]);

  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<{
    name: string;
    description: string;
    image_url: string | StaticImageData;
    recipient: string;
  } | null>(null);
  const { user } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();

  const nftData = isSuper
    ? {
        collection_id: "215",
        name: "Hashcase Super Cool Collection",
        description: "Collection for cool NFTS by Hashcase",
        image_url: backgroundImageHeroSection,
        attributes: ["Rarity: Common", "Type: Digital Art", "Network: Mainnet"],
        recipient: currentAccount?.address || zkAddress,
      }
    : {
        collection_id: "214",
        name: "NS Daily",
        description: "Complete the tasks for the day to claim this reward.",
        image_url:
          "https://client-uploads.nyc3.digitaloceanspaces.com/images/3b1daaad-c7dc-4884-a78b-739a3ce3dfaa/2025-08-28T12-25-58-895Z-38bc0eae.png",
        attributes: ["quest_reward", "daily_completion", "loyalty"],
        recipient: currentAccount?.address || zkAddress,
      };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "quest_progress_ping" && e.newValue) {
        console.log("🔄 Cross-tab sync triggered:", e.newValue);
        fetchQuests();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const walletAddress = currentAccount?.address || zkAddress;
  const isWalletConnected = mounted && !!walletAddress;

  const prevIsConnectedRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!mounted) return;

    const prev = prevIsConnectedRef.current;
    prevIsConnectedRef.current = isWalletConnected;

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

  const completedQuests =
    mounted && isWalletConnected && !loading
      ? quests.filter((quest) => quest.is_completed).length
      : 0;
  const totalQuests = !loading ? quests.length : 0;
  const completionPercentage =
    mounted && isWalletConnected && !loading && totalQuests > 0
      ? Math.round((completedQuests / totalQuests) * 100)
      : 0;

  useEffect(() => {
    if (mounted) {
      setLoading(true);
      fetchQuests();
    }
  }, [user?.id, walletAddress]);

  useEffect(() => {
    if (mounted && activeQuestCode) {
      setLoading(true);
      fetchQuests();
    }
  }, [activeQuestCode, mounted]);

  const handleClaimQuest = async (questId: number) => {
    const walletAddress = currentAccount?.address || zkAddress;
    if (!walletAddress) {
      toast.error("Please connect your wallet to claim quests", {
        duration: 5000,
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid #374151",
        },
      });
      return;
    }

    try {
      setClaimingQuestId(questId);

      const quest = quests.find((q) => q.id === questId);
      if (!quest?.quest_code) {
        toast.error("Quest not found");
        return;
      }

      setQuests((prevQuests) => {
        const updatedQuests = prevQuests.map((q) =>
          q.id === questId ? { ...q, is_completed: true } : q
        );
        return updatedQuests;
      });

      try {
        const sessionKey = `quest_progress_session_${walletAddress}`;
        const sessionProgress: number[] = JSON.parse(
          sessionStorage.getItem(sessionKey) || "[]"
        );
        if (!sessionProgress.includes(questId)) {
          sessionProgress.push(questId);
          sessionStorage.setItem(sessionKey, JSON.stringify(sessionProgress));
        }
      } catch {}

      toast.success("Quest completed!");

      try {
        const response = await axiosInstance.post("/platform/quests/complete", {
          quest_id: questId,
          owner_id: quest.owner_id,
          wallet_address: walletAddress,
        });

        const latest = await fetchQuests();
        const verified = Array.isArray(latest)
          ? latest.find((q) => q.id === questId)?.is_completed === true
          : false;
        if (verified) {
          toast.success("Quest saved to your account");
        } else {
          toast("Recorded locally. Syncing with server...", { icon: "⏳" });
        }

        try {
          localStorage.setItem(
            "quest_progress_ping",
            JSON.stringify({ ts: Date.now(), wallet: walletAddress })
          );
          localStorage.removeItem("quest_progress_ping");
        } catch {}
      } catch (apiError) {
        console.log(
          "⚠️ Backend persistence failed (using localStorage fallback):",
          apiError
        );
      }
      fetchQuests();
    } catch (error: any) {
      console.error("Error claiming quest:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to claim quest";
      toast.error(errorMessage);
    } finally {
      setClaimingQuestId(null);
    }
  };

  const fetchQuests = async () => {
    try {
      setLoading(true);

      const {
        data: { quest },
      } = await axiosInstance.get("/platform/quests/data/" + activeQuestCode);
      if (!quest) {
        throw new Error("Quest code Invalid");
      }

      const walletAddress = currentAccount?.address || zkAddress;

      const params: { owner_id: number; wallet_address?: string } = {
        owner_id: quest.owner_id,
      };
      if (walletAddress) {
        params.wallet_address = walletAddress;
      }

      const response = await axiosInstance.get("/platform/quest/by-owner", {
        params,
      });

      let sessionCompleted: number[] = [];
      try {
        const sessionKey = walletAddress
          ? `quest_progress_session_${walletAddress}`
          : null;
        sessionCompleted = sessionKey
          ? JSON.parse(sessionStorage.getItem(sessionKey) || "[]")
          : [];
      } catch {}

      const transformedQuests = response.data.quests.map((quest: any) => {
        const isCompletedFromAPI = quest.userProgress?.isCompleted || false;
        const isCompletedFromSession = sessionCompleted.includes(quest.id);
        const isCompleted = isCompletedFromAPI || isCompletedFromSession;

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
        };
      });

      if (transformedQuests.length > 0) {
        setQuests(transformedQuests);
        return transformedQuests;
      } else {
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching quests:", error);
      toast.error("Failed to load quests");
      return [];
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  if (initialLoad || loading || quests.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-6"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Loading Quests...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        {/* Navigation - Mobile: Centered, Desktop: Corners */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-10">
          <div className="flex items-center justify-between sm:justify-start">
            {/* Back Button */}
            <button
              onClick={() => {
                try {
                  const searchParams = new URLSearchParams(
                    window.location.search
                  );
                  const cid = searchParams.get("collection_id");
                  if (cid) {
                    router.push(`/loyalties/${cid}`);
                    return;
                  }
                  router.push("/loyalties/214");
                } catch {
                  if (
                    typeof window !== "undefined" &&
                    window.history.length > 1
                  ) {
                    window.history.back();
                  } else {
                    router.push("/loyalties");
                  }
                }
              }}
              className="text-white hover:text-gray-300 font-semibold transition-colors duration-300 flex items-center gap-2 text-sm sm:text-base"
            >
              ← Back
            </button>

            {/* Connect Button - Mobile: Same row, Desktop: Positioned absolutely */}
            <div className="sm:hidden">
              <ConnectButton />
            </div>
          </div>
        </div>

        {/* Desktop Connect Button */}
        <div className="hidden sm:block absolute top-3 sm:top-4 right-3 sm:right-4 z-[9999]">
          <ConnectButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 sm:pt-20 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* NFT Display Section */}
          <div className="mb-12 sm:mb-16 md:mb-24">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-6 md:space-x-8 space-y-6 sm:space-y-0">
              {/* NFT Image */}
              <div className="w-full sm:flex-shrink-0 sm:w-auto">
                <div className="w-full sm:w-40 sm:h-40 md:w-48 md:h-48 aspect-square rounded-2xl shadow-2xl border-2 border-purple-300/30 overflow-hidden">
                  <Image
                    src={nftData.image_url}
                    alt="NFT Reward"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* NFT Info */}
              <div className="flex-1 text-center sm:text-left max-w-lg">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  {nftData.name}
                </h2>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                  {nftData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Quest Section Header */}
          <div className="text-center mb-6">
            {/* Wallet connection message */}
            {!isWalletConnected && (
              <div className="mb-6">
                <p className="text-lg sm:text-xl text-white mb-4">
                  * Wallet not connected
                </p>
              </div>
            )}

            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Available Quests
            </h1>

            {/* Progress Bar */}
            {mounted && isWalletConnected && !loading && (
              <div className="max-w-md mx-auto mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-gray-400">
                    Progress
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {completedQuests}/{totalQuests} ({completionPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 sm:h-3 overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quest List */}
          <div className="space-y-2 sm:space-y-3">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="group bg-gray-900 border border-gray-700 rounded-lg p-3 sm:p-4 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  {/* Quest Info */}
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-white mb-1 sm:mb-0">
                      {quest.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      {quest.description}
                    </p>
                  </div>

                  {/* Quest Status */}
                  <div className="flex-shrink-0">
                    {quest.is_completed ? (
                      <span className="text-xs sm:text-sm text-green-400 bg-green-900/20 px-2 sm:px-3 py-1 rounded border border-green-700 inline-block">
                        ✓ Completed
                      </span>
                    ) : allowClaim &&
                      activeQuestCode &&
                      quest.quest_code === activeQuestCode ? (
                      <button
                        onClick={() => {
                          if (!isWalletConnected) {
                            const {
                              setOpenModal,
                            } = require("@/store/globalAppStore");
                            const store = require("@/store/globalAppStore");
                            store.useGlobalAppStore
                              .getState()
                              .setOpenModal(true);
                            return;
                          }
                          handleClaimQuest(quest.id);
                        }}
                        disabled={claimingQuestId === quest.id}
                        className={`text-xs sm:text-sm px-3 sm:px-4 py-1 rounded border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-block ${
                          !isWalletConnected
                            ? "text-gray-300 bg-gray-600/60 border-gray-500"
                            : "text-black bg-white hover:bg-white/90 border-purple-500 cursor-pointer"
                        }`}
                      >
                        {claimingQuestId === quest.id
                          ? "Claiming..."
                          : !isWalletConnected
                          ? "Connect Wallet"
                          : "Claim"}
                      </button>
                    ) : allowClaim ? (
                      <span className="text-xs sm:text-sm text-gray-500 bg-gray-800/40 px-2 sm:px-3 py-1 rounded border border-gray-700 inline-block">
                        Complete other quests first
                      </span>
                    ) : !isWalletConnected ? (
                      <span className="text-xs sm:text-sm text-gray-400 bg-gray-800/20 px-2 sm:px-3 py-1 rounded border border-gray-600 inline-block">
                        Connect Wallet to Claim
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm text-gray-400 bg-gray-800/20 px-2 sm:px-3 py-1 rounded border border-gray-600 inline-block">
                        Not Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {quests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl sm:text-6xl mb-4">🎯</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                No Quests Available
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Check back later for new quests!
              </p>
            </div>
          )}

          {/* Claim NFT Button */}
          {quests.length > 0 && (
            <div className="text-center mt-6 sm:mt-8">
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
                    const response = await axiosInstance.post(
                      "/platform/sui/mint-nft",
                      nftData
                    );

                    if (response.data.success) {
                      setMintedNftData({
                        name: nftData.name,
                        description: nftData.description,
                        image_url: nftData.image_url,
                        recipient: nftData.recipient!,
                      });
                      setNftMinted(true);
                      localStorage.setItem("nft_minted_ns_daily", "true");
                      setShowNftModal(true);
                      toast.success("🎉 NFT minted successfully!");
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
                  w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 transform
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
                <span className="block sm:hidden">
                  {nftMinted
                    ? "✓ NFT Minted"
                    : claiming
                    ? "Minting..."
                    : !isWalletConnected
                    ? "Connect Wallet"
                    : completionPercentage === 100
                    ? "Claim NFT"
                    : `Complete ${totalQuests - completedQuests} more`}
                </span>
                <span className="hidden sm:block">
                  {nftMinted
                    ? "✓ NFT Minted"
                    : claiming
                    ? "🎨 Minting NFT..."
                    : !isWalletConnected
                    ? "Connect Wallet to Claim NFT"
                    : completionPercentage === 100
                    ? "🎉 Claim NFT"
                    : `Complete ${
                        totalQuests - completedQuests
                      } more quests to Claim NFT`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NFT Minted Success Modal */}
      {showNftModal && mintedNftData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md p-4">
          {/* Particle Effects Background */}
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

          {/* Modal Content */}
          <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 border border-white/10 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowNftModal(false)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-white transition-colors text-lg"
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
              className="absolute top-3 sm:top-4 right-12 sm:right-16 text-gray-400 hover:text-blue-400 transition-colors flex flex-row items-center gap-1"
              title="View in Profile"
            >
              <span className="text-xs hidden sm:inline">View in Profile</span>
              <span className="text-xs sm:hidden">Profile</span>
              <ArrowRight size={14} className="sm:hidden" />
              <ArrowRight size={16} className="hidden sm:block" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* NFT Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-2xl overflow-hidden border border-white/20">
                <Image
                  src={mintedNftData.image_url}
                  alt={mintedNftData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                {mintedNftData.name}
              </h2>
              <p className="text-green-400 text-sm mb-4">
                Successfully minted! ✨
              </p>

              {/* Wallet */}
              <div className="bg-white/5 rounded-lg p-3 mb-6">
                <p className="text-gray-400 text-xs mb-1">Sent to:</p>
                <p className="text-white font-mono text-xs break-all">
                  <span className="sm:hidden">
                    {mintedNftData.recipient.slice(0, 6)}...
                    {mintedNftData.recipient.slice(-6)}
                  </span>
                  <span className="hidden sm:inline">
                    {mintedNftData.recipient.slice(0, 8)}...
                    {mintedNftData.recipient.slice(-8)}
                  </span>
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowNftModal(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
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

export default QuestDetailPage;
