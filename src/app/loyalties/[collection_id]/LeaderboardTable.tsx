"use client";
import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";

import { LeaderboardPeriod } from "@/utils/enums";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";
import toast from "react-hot-toast";

type LeaderboardEntry = {
  user_id: number;
  total_loyalty_points: number;
  rank: number;
  user?: {
    username?: string;
    email?: string;
    sui_wallet_address?: string;
    eth_wallet_address?: string;
    fuel_wallet_address?: string;
  };
};

type UserRank = {
  rank: number;
  dense_rank: number;
  points: number;
  username?: string;
};

type LeaderboardResponse = {
  rows: LeaderboardEntry[];
  count: number;
  userRank?: UserRank;
};

const LeaderboardTable = ({ 
  owner_id 
}: { 
  owner_id: number;
}) => {
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();
  const { user } = useGlobalAppStore();
  const [period, setPeriod] = useState<LeaderboardPeriod>(
    LeaderboardPeriod.MONTHLY
  );

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if any wallet is connected (Sui wallet or zk Google login)
  const isWalletConnected = !!(currentAccount?.address || zkAddress);

  // Function to manually refresh leaderboard data
  const refreshLeaderboard = async () => {
    if (!isWalletConnected) return;
    
    setIsLoading(true);
    try {
      const userId = user?.id;
      
      console.log("Manually refreshing leaderboard for user:", userId, "owner:", owner_id);

      const response = await axiosInstance.get("/platform/new-leaderboard", {
        params: {
          owner_id: owner_id,
          user_id: userId,
          page: 1,
          page_size: 10,
        },
      });
      
      const leaderboard: LeaderboardResponse = response.data.leaderboard;
      console.log("Refreshed leaderboard data:", leaderboard);
      
      setLeaderboardData(leaderboard.rows || []);
      setUserRank(leaderboard.userRank || null);
      
      // Show success toast
      toast.success("Leaderboard updated with latest rankings!");
    } catch (error: any) {
      console.error("Error refreshing leaderboard:", error);
      toast.error("Failed to refresh leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getLeaderboardData = async () => {
      if (!isWalletConnected) return;
      
      setIsLoading(true);
      try {
        // Use the current user's ID from the global store
        const userId = user?.id;
        
        if (!userId) {
          console.log("User not found, showing leaderboard without user rank");
          console.log("Current user state:", user);
        }

        console.log("Fetching leaderboard for user:", userId, "owner:", owner_id);
        console.log("User authentication state:", { 
          userId, 
          isWalletConnected, 
          currentAccount: currentAccount?.address, 
          zkAddress 
        });

        // Use the new leaderboard endpoint that includes user rank
        const response = await axiosInstance.get("/platform/new-leaderboard", {
          params: {
            owner_id: owner_id,
            user_id: userId,
            page: 1,
            page_size: 10,
          },
        });
        
        const leaderboard: LeaderboardResponse = response.data.leaderboard;
        console.log("Leaderboard data:", leaderboard);
        console.log("User rank data:", leaderboard.userRank);
        
        setLeaderboardData(leaderboard.rows || []);
        setUserRank(leaderboard.userRank || null);

        // Also fetch user's current points directly to debug
        if (userId) {
          try {
            const pointsResponse = await axiosInstance.get("/user/achievements/get-points", {
              params: { owner_id },
            });
            console.log("Direct points fetch:", pointsResponse.data);
          } catch (pointsError: any) {
            console.error("Error fetching direct points:", pointsError);
            console.error("Points error response:", pointsError.response?.data);
            if (pointsError.response?.data?.message === "Auth Token Not Found") {
              console.error("User is not properly authenticated for points API");
            }
          }
        }
      } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        console.error("Leaderboard error response:", error.response?.data);
        // Fallback to old endpoint if new one fails
        try {
          const response = await axiosInstance.get("/platform/leaderboard", {
            params: {
              owner_id: owner_id,
              period: period,
            },
          });
          const leaderboard = response.data.leaderboard;
          console.log("Fallback leaderboard data:", leaderboard);
          setLeaderboardData(leaderboard);
          setUserRank(null);
        } catch (fallbackError) {
          console.error("Fallback leaderboard also failed:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    getLeaderboardData();
  }, [owner_id, isWalletConnected, user?.id]);

  // Format wallet address to show first 6 and last 4 characters
  const formatWalletAddress = (address: string | undefined | null) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get the best available identifier for a user
  const getUserIdentifier = (entry: LeaderboardEntry) => {
    if (entry.user?.sui_wallet_address) {
      return formatWalletAddress(entry.user.sui_wallet_address);
    }
    if (entry.user?.eth_wallet_address) {
      return formatWalletAddress(entry.user.eth_wallet_address);
    }
    if (entry.user?.fuel_wallet_address) {
      return formatWalletAddress(entry.user.fuel_wallet_address);
    }
    if (entry.user?.username) {
      return entry.user.username;
    }
    if (entry.user?.email) {
      return entry.user.email;
    }
    return `User ${entry.user_id}`;
  };

  // Get current user's address for display
  const getCurrentUserAddress = () => {
    if (currentAccount?.address) {
      return formatWalletAddress(currentAccount.address);
    }
    if (zkAddress) {
      return formatWalletAddress(zkAddress);
    }
    return "Unknown";
  };

  return (
    <div className="flex flex-col justify-start items-center gap-6 w-full h-full  bg-gradient-to-b from-[#00041f] to-[#030828] p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-white/90 drop-shadow-md">
          Leaderboard
          {isLoading && (
            <span className="ml-3 text-blue-400 text-sm">
              <span className="animate-spin">⟳</span> Refreshing...
            </span>
          )}
        </h1>
        {/* <button
          onClick={refreshLeaderboard}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span className={isLoading ? "animate-spin" : ""}>⟳</span>
          Refresh
        </button> */}
      </div>

      {/* Time Period Buttons */}
      <div className="flex justify-start items-center gap-6 w-full max-w-6xl mx-auto">
        <button
          onClick={() => setPeriod(LeaderboardPeriod.MONTHLY)}
          className="bg-[#3f54b4] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md"
        >
          Monthly
        </button>
        <button
          onClick={() => setPeriod(LeaderboardPeriod.WEEKLY)}
          className="bg-[#3f54b4] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md"
        >
          Weekly
        </button>
        <button
          onClick={() => setPeriod(LeaderboardPeriod.DAILY)}
          className="bg-[#3f54b4] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md"
        >
          Daily
        </button>
      </div>

      {/* Debug Info */}
      

      {/* User Status Summary */}
     

      {/* Leaderboard Table */}
      <div className="w-full flex flex-col justify-start items-start gap-4 max-w-6xl mx-auto ">
        {/* Table Header */}
        <div className="flex justify-between items-center w-full px-6 py-3 rounded-md text-lg font-semibold text-white bg-white/10 backdrop-blur-lg shadow-lg">
          <p className="w-1/3 text-center">Rank</p>
          <p className="w-1/3 text-center">Wallet Address</p>
          <p className="w-1/3 text-center">Loyalty Points</p>
        </div>

        {/* Current User's Entry (if not in top list) */}
        {userRank && !leaderboardData.some(entry => entry.user_id === user?.id) && (
          <div className="flex justify-between items-center w-full px-6 py-3 rounded-md text-lg text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-400/30 backdrop-blur-lg shadow-lg">
            <p className="w-1/3 text-center">{userRank.rank}</p>
            <p className="w-1/3 text-center">{getCurrentUserAddress()}</p>
            <p className="w-1/3 text-center">{typeof userRank.points === 'number' ? userRank.points.toFixed(2) : '0.00'}</p>
          </div>
        )}

        {/* Show message if user is connected but not authenticated for points */}
        {isWalletConnected && !userRank && user?.id && (
          <div className="flex justify-between items-center w-full px-6 py-3 rounded-md text-lg text-white bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 backdrop-blur-lg shadow-lg">
            <p className="w-1/3 text-center">-</p>
            <p className="w-1/3 text-center">{getCurrentUserAddress()}</p>
            <p className="w-1/3 text-center text-yellow-300">Authentication required</p>
          </div>
        )}

        {/* Leaderboard Entries */}
        {leaderboardData.map((entry, index) => {
          console.log(`Entry ${index}: total_loyalty_points = ${entry.total_loyalty_points}, type = ${typeof entry.total_loyalty_points}`);
          return (
            <div
              key={index}
              className={`flex justify-between items-center w-full px-6 py-3 rounded-md text-lg text-white bg-white/10 backdrop-blur-lg shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105 ${
                userRank && entry.user_id === user?.id ? 'ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-600/20 to-orange-600/20' : ''
              }`}
            >
              <p className="w-1/3 text-center">{entry.rank}</p>
              <p className="w-1/3 text-center">
                {getUserIdentifier(entry)}
                {userRank && entry.user_id === user?.id && (
                  <span className="ml-2 text-yellow-300 text-sm">(You)</span>
                )}
              </p>
              <p className="w-1/3 text-center">{typeof entry.total_loyalty_points === 'number' ? entry.total_loyalty_points.toFixed(2) : '0.00'}</p>
            </div>
          );
        })}

        {/* No Data Message */}
        {!isLoading && leaderboardData.length === 0 && !userRank && (
          <div className="w-full text-center py-8">
            <p className="text-blue-300 text-lg">No leaderboard data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTable;