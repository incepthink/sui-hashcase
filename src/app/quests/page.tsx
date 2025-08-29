"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import ConnectButton from "@/components/ConnectButton";
import { ArrowRight } from "lucide-react";

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

// Separate component for the back button that uses search params
const BackButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  return (
    <div className="absolute top-4 left-4 z-10">
      <button
        onClick={() => {
           const cid = searchParams.get('collection_id')
           if (cid) {
             router.push(`/loyalties/${cid}`)
           } else {
             router.push('/loyalties')
           }
        }}
        className="text-white hover:text-gray-300 font-semibold transition-colors duration-300 flex items-center gap-2"
      >
        ← Back
      </button>
    </div>
  );
};

const QuestsPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);

  // Check localStorage for global NFT minted status, but only if quests are completed
  useEffect(() => {
    if (quests.length > 0) {
      const completedQuests = quests.filter(quest => quest.is_completed).length;
      const totalQuests = quests.length;
      const completionPercentage = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
      
      const savedNftStatus = localStorage.getItem('nft_minted_ns_daily');
      
      if (savedNftStatus === 'true' && completionPercentage === 100) {
        setNftMinted(true);
      } else if (completionPercentage < 100) {
        // Reset NFT minted status if quests are not completed
        setNftMinted(false);
        localStorage.removeItem('nft_minted_ns_daily');
      }
    }
  }, [quests]);
  const [showNftModal, setShowNftModal] = useState(false);
  const [mintedNftData, setMintedNftData] = useState<{
    name: string;
    description: string;
    image_url: string;
    recipient: string;
  } | null>(null);
  const { user } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();
  
  // Wallet connection state based on actual addresses
  const isWalletConnected = !!(currentAccount?.address || zkAddress);

  useEffect(() => setMounted(true), []);



  // Calculate progress only when wallet is connected
  const walletAddress = currentAccount?.address || zkAddress;
  const isConnected = mounted && !!walletAddress;
  const completedQuests = isConnected ? quests.filter(quest => quest.is_completed).length : 0;
  const totalQuests = quests.length;
  const completionPercentage = isConnected && totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

  useEffect(() => {
    fetchQuests();
  }, [user?.id, walletAddress]);

  // No individual quest claiming on this page - only NFT claiming

  const fetchQuests = async () => {
    try {
      setLoading(true);
      
      // Fetch quests from a higher owner_id (likely your local admin-created ones)
      // Use wallet address as user identifier for quest completion status
      const walletAddress = currentAccount?.address || zkAddress;
      console.log("Fetching quests for wallet:", walletAddress);
      
      const response = await axiosInstance.get("/platform/quest/by-owner", { 
        params: { 
          owner_id: 35, // Production admin-created quests (was 2 for local)
          user_id: user?.id || 1,
          wallet_address: walletAddress // Add wallet address for completion tracking
        } 
      });
      
      console.log(`Local quests found: ${response.data.quests?.length || 0}`);
      
      // Transform quests using ONLY backend data for completion status
      const transformedQuests = (response.data.quests || []).map((quest: any) => {
        const isCompleted = quest.userProgress?.isCompleted || false;
        
        return {
          id: quest.id,
          title: quest.title,
          description: quest.description,
          quest_code: quest.quest_code,
          points_reward: quest.reward_loyalty_points,
          owner_id: quest.owner_id,
          created_at: quest.createdAt,
          updated_at: quest.updatedAt,
          is_completed: walletAddress ? isCompleted : false
        };
      });
      setQuests(transformedQuests);
    } catch (error) {
      console.error("Error fetching quests:", error);
      toast.error("Failed to load quests");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white">Loading Quests...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation */}
      <div className="relative">
        {/* Back Button - Top Left */}
        {/* <Suspense fallback={
          <div className="absolute top-4 left-4 z-10">
            <button className="text-white hover:text-gray-300 font-semibold transition-colors duration-300 flex items-center gap-2">
              ← Back
            </button>
          </div>
        }>
          <BackButton />
        </Suspense> */}
        
        {/* Wallet Connect - Top Right */}
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
                  <Image 
                    src="https://client-uploads.nyc3.digitaloceanspaces.com/images/3b1daaad-c7dc-4884-a78b-739a3ce3dfaa/2025-08-28T12-25-58-895Z-38bc0eae.png" 
                    alt="NS Daily NFT" 
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* NFT Info */}
              <div className="flex-1 max-w-md">
                <h2 className="text-3xl font-bold text-white mb-3">NS Daily</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Complete the tasks for the day to claim this reward.
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Available Quests
            </h1>
            {/* Progress Bar - Only show when wallet is connected */}
            {isConnected && (
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
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Horizontal Quest Cards */}
          <div className="space-y-2">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="group bg-gray-900 border border-gray-700 rounded-lg p-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  {/* Left side - Quest info */}
                  <div className="flex items-center space-x-4">
                   {/* <h3 className="text-base font-bold text-white">
                      #{quest.quest_code}
                      </h3> */}
                   <div className="flex flex-col">
                 
                      <h3 className="text-base font-bold text-white">
                        {quest.title}
                      </h3>
                      <p className="text-gray-400 text-xs hidden md:block">
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Points and status */}
                  <div className="flex items-center space-x-4">
                    {quest.is_completed ? (
                      <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-700">
                        ✓ Completed
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

          {quests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-2">No Quests Available</h3>
              <p className="text-gray-400">Check back later for new quests!</p>
            </div>
          )}

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
                  if (!isWalletConnected) {
                    toast.error("Please connect your wallet to claim the NFT", {
                      duration: 5000,
                      style: {
                        background: '#1f2937',
                        color: '#fff',
                        border: '1px solid #374151',
                      },
                    });
                    return;
                  }

                  setClaiming(true);
                  try {
                    const nftData = {
                      collection_id: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290",
                      name: "NS Daily",
                      description: "Complete the tasks for the day to claim this reward.",
                      image_url: "https://client-uploads.nyc3.digitaloceanspaces.com/images/3b1daaad-c7dc-4884-a78b-739a3ce3dfaa/2025-08-28T12-25-58-895Z-38bc0eae.png",
                      attributes: ["quest_reward", "daily_completion", "loyalty"],
                      recipient: currentAccount?.address || zkAddress,
                    };
                    
                    const response = await axiosInstance.post("/platform/sui/mint-nft", nftData);
                    
                    if (response.data.success) {
                      // Store NFT data and show modal
                      setMintedNftData({
                        name: nftData.name,
                        description: nftData.description,
                        image_url: nftData.image_url,
                        recipient: nftData.recipient!
                      });
                      setNftMinted(true);
                      
                      // Save to localStorage for global state across pages
                      localStorage.setItem('nft_minted_ns_daily', 'true');
                      
                      setShowNftModal(true);
                      
                      // Still show the toast for immediate feedback
                      toast.success("🎉 NS Daily NFT minted successfully!");
                    } else {
                      toast.error(response.data.message || "Failed to claim NFT");
                    }
                  } catch (error: any) {
                    console.error("Error claiming NFT:", error);
                    const errorMessage = error.response?.data?.message || "Failed to claim NFT";
                    if (errorMessage.includes("already minted") || errorMessage.includes("already claimed")) {
                      setNftMinted(true);
                      localStorage.setItem('nft_minted_ns_daily', 'true');
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
                  ${nftMinted
                    ? 'bg-white text-black cursor-default'
                    : !isWalletConnected
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-60'
                    : completionPercentage === 100 && !claiming
                    ? 'bg-white text-black hover:bg-white/80 transition duration-300  shadow-lg hover:shadow-xl  cursor-pointer' 
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {nftMinted
                  ? ' NFT Minted'
                  : claiming 
                  ? ' Minting NFT...' 
                  : !isWalletConnected
                    ? 'Login to Claim NFT'
                  : completionPercentage === 100 
                    ? 'Claim NFT' 
                    : `Complete ${totalQuests - completedQuests} more quests to Claim NFT`
                }
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
                  animationDuration: `${2 + Math.random() * 2}s`
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
                <Image 
                  src={mintedNftData.image_url} 
                  alt={mintedNftData.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-white mb-2">{mintedNftData.name}</h2>
              <p className="text-green-400 text-sm mb-4">Successfully minted! ✨</p>

              {/* Wallet */}
              <div className="bg-white/5 rounded-lg p-3 mb-6">
                <p className="text-gray-400 text-xs mb-1">Sent to:</p>
                <p className="text-white font-mono text-xs break-all">
                  {mintedNftData.recipient.slice(0, 8)}...{mintedNftData.recipient.slice(-8)}
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

export default QuestsPage;
