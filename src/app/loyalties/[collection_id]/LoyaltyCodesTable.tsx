"use client";
import { useEffect, useState } from "react";

import axiosInstance from "@/utils/axios";

import { Flame } from "lucide-react";
import toast from "react-hot-toast";
import { useGlobalAppStore } from "@/store/globalAppStore";

type Loyalty = {
  id: number;
  owner_id: number;
  code: string;
  value: number;
  type: string;
};

type LoyaltyTransaction = {
  id: number;
  user_id: number;
  owner_id: number;
  code: string;
  points: number;
  type: string;
  status: string;
  created_at: string;
};

interface User {
  // Define the shape of the user object
  id: number;
  walletAddress: string;
  email: string | null;
  badges: string;
}

const LoyaltyCodesTable = ({ owner_id }: { owner_id: number }) => {
  const { user } = useGlobalAppStore();
  
  // to store the fetched loyalty codes, points data & active streak
  const [loyaltyCodes, setLoyaltyCodes] = useState<Loyalty[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [offChainPointsState, setOffChainPointsState] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const getLoyaltyCodesAndPoints = async () => {
    const loyaltyResponse = await axiosInstance.get("/platform/get-loyalties", {
      params: {
        owner_id: owner_id,
      },
    });

    setLoyaltyCodes(loyaltyResponse.data.loyalties);
  };

  const getUsedLoyaltyCodes = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axiosInstance.get("/devapi/user/gettransactions", {
        params: {
          user_id: user.id,
          owner_id: owner_id,
        },
      });

      // Extract used codes from transactions
      const usedCodesList = response.data.data.map((transaction: LoyaltyTransaction) => transaction.code);
      setUsedCodes(usedCodesList);
    } catch (error) {
      console.error("Error fetching used loyalty codes:", error);
      // If no transactions found, set empty array
      setUsedCodes([]);
    }
  };

  const handleAddLoyalty = async (code: string, value: number | undefined) => {
    try {
      const loyaltyResponse = await axiosInstance.post(
        "/user/achievements/add-points",
        { code, value },
        {
          params: {
            owner_id: owner_id,
          },
        }
      );

      toast.success(
        `${loyaltyResponse.data.message} : Total Points - ${loyaltyResponse.data.user.total_points}`
      );

      setOffChainPointsState(loyaltyResponse.data.user.total_points);
      
      // Add the code to used codes list
      setUsedCodes(prev => [...prev, code]);
    } catch (error: any) {
      if (error.response?.data?.message === 'Loyalty code already claimed') {
        toast.error("Loyalty Code has already been used");
        // Add to used codes if it's already claimed
        setUsedCodes(prev => [...prev, code]);
      } else {
        toast.error("Failed to redeem loyalty code");
      }
      console.log(error);
    }
  };

  const performDailyCheckIn = async () => {
    try {
      const checkInResponse = await axiosInstance.post(
        "/user/achievements/extend-streak",
        null,
        {
          params: {
            owner_id: owner_id,
          },
        }
      );

      const user_achievements = checkInResponse.data.user_achievements;

      console.log("this is the user achievement");
      console.log(user_achievements);

      setCurrentStreak(user_achievements.current_streak);
      setOffChainPointsState(user_achievements.total_loyalty_points);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOffChainPoints = async () => {
    try {
      const response = await axiosInstance.get(
        "/user/achievements/get-points",
        {
          params: { owner_id },
        }
      );
      const total = (response.data?.total_points ?? response.data?.points) || 0;
      setOffChainPointsState(total);
    } catch (error) {
      console.error("Error fetching off-chain points:", error);
    }
  };

  useEffect(() => {
    getLoyaltyCodesAndPoints();
    fetchOffChainPoints();
    performDailyCheckIn();
    getUsedLoyaltyCodes(); // Fetch used codes on mount

    // if (user.id) handleDailyCheckIn();
  }, [user?.id]); // Add user.id as dependency

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] flex flex-col items-center justify-start p-8 text-white">
      {/* Off-Chain Points */}
      <h1 className="text-4xl  font-semibold mb-6 bg-clip-text text-transparent text-white/90 drop-shadow-lg">
        {`Off-Chain Points: ${offChainPointsState}`}
      </h1>

      {/* Streak Display */}
      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-md shadow-md mb-6">
        <Flame className="text-red-600 w-8 h-8" />
        <span className="text-xl font-semibold">{`Streak: ${currentStreak} days`}</span>
      </div>

      {/* Loyalty Codes */}
      <h1 className="text-4xl font-extrabold mb-6 text-blue-300 drop-shadow-md">
        Loyalty Codes
      </h1>

      <div className="w-full max-w-6xl overflow-x-auto">
        <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-lg">
          <thead>
            <tr className="text-left bg-[#3f54b4] text-white">
              <th className="p-4">Code</th>
              <th className="p-4">Value</th>
              <th className="p-4">Type</th>
            </tr>
          </thead>
          <tbody>
            {loyaltyCodes?.map((loyalty) => {
              const isUsed = usedCodes.includes(loyalty.code);
              
              return (
                <tr
                  key={loyalty.id}
                  className="border-b border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <td className="p-4 font-semibold">
                    {isUsed ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-600 px-2 py-1 rounded-md opacity-60">
                          {loyalty.code}
                        </span>
                        <span className="text-green-400 text-sm">✓ Used</span>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleAddLoyalty(loyalty.code, loyalty.value)
                        }
                        className="bg-[#3f54b4] hover:bg-[#3f54b4]/80 px-2 py-1 rounded-md transition-colors"
                      >
                        {loyalty.code}
                      </button>
                    )}
                  </td>
                  <td className="p-4">{loyalty.value}</td>
                  <td className="p-4">{loyalty.type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoyaltyCodesTable;
