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

const LoyaltyCodesTable = ({ 
  owner_id, 
  onPointsUpdate
}: { 
  owner_id: number;
  onPointsUpdate?: (newPoints: number) => void;
}) => {
  const { user, isUserVerified } = useGlobalAppStore();
  
  // to store the fetched loyalty codes, points data & active streak
  const [loyaltyCodes, setLoyaltyCodes] = useState<Loyalty[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [offChainPointsState, setOffChainPointsState] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const getLoyaltyCodesAndPoints = async () => {
    setIsPageLoading(true);
    try {
      // Get loyalty codes
      const loyaltyResponse = await axiosInstance.get("/platform/get-loyalties", {
        params: {
          owner_id: owner_id,
        },
      });

      setLoyaltyCodes(loyaltyResponse.data.loyalties);
    } catch (error) {
      console.error("Error fetching loyalty codes:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  const getUsedLoyaltyCodes = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axiosInstance.get("/user/loyalty/transactions", {
        params: {
          user_id: user.id,
          owner_id: owner_id,
        },
      });

      // Extract used codes from transactions
      const usedCodesList = response.data.data.map((transaction: LoyaltyTransaction) => transaction.code);
      setUsedCodes(usedCodesList);
    } catch (error: any) {
      // Handle 404 errors silently (user has no transactions yet)
      if (error.response?.status === 404) {
        console.log("No loyalty transactions found for user - this is normal for new users");
        setUsedCodes([]);
      } else {
        console.error("Error fetching used loyalty codes:", error);
        setUsedCodes([]);
      }
    }
  };

  const handleAddLoyalty = async (code: string, value: number | undefined) => {
    if (!isUserVerified || !user) {
      toast.error("Please connect your wallet to redeem loyalty codes");
      return;
    }

    setIsPageLoading(true);
    
    try {
      // Convert frontend type to backend enum type
      const loyaltyCode = loyaltyCodes.find(lc => lc.code === code);
      let backendType = loyaltyCode?.type || '';
      if (backendType === 'one_time_fixed') backendType = 'ONE_FIXED';
      else if (backendType === 'repeat_fixed') backendType = 'FIXED';
      else if (backendType === 'repeat_variable') backendType = 'VARIABLE';
      
      // Send request with correct schema structure
      const loyaltyResponse = await axiosInstance.post(
        "/user/achievements/add-points",
        {
          loyalty: {
            code,
            value: value || 0,
            type: backendType
          }
        },
        {
          params: {
            owner_id,
            user_id: user.id
          }
        }
      );

      console.log("Loyalty response:", loyaltyResponse.data);

      // Update off-chain points
      let newPoints = 0;
      if (loyaltyResponse.data.user?.total_loyalty_points) {
        newPoints = loyaltyResponse.data.user.total_loyalty_points;
        setOffChainPointsState(newPoints);
      } else if (loyaltyResponse.data.totalPoints) {
        newPoints = loyaltyResponse.data.totalPoints;
        setOffChainPointsState(newPoints);
      }

      toast.success(
        `Successfully redeemed ${code}! +${value} points added. Total: ${newPoints} points`
      );
      
      // Notify parent component about points update
      if (onPointsUpdate && newPoints > 0) {
        onPointsUpdate(newPoints);
      }
      
      // Add the code to used codes list
      setUsedCodes(prev => [...prev, code]);
      
      // Immediately fetch updated points to ensure UI is current
      await fetchOffChainPoints();
      
      // Refresh the page data
      await getLoyaltyCodesAndPoints();
      await getUsedLoyaltyCodes();
    } catch (error: any) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Authentication failed. Please reconnect your wallet and try again.");
      } else if (error.response?.data?.message === 'Loyalty code already claimed') {
        toast.error("This loyalty code has already been claimed.");
      } else if (error.response?.data?.message === 'Loyalty code not found') {
        toast.error("Invalid loyalty code.");
      } else {
        toast.error(`Failed to redeem loyalty code: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsPageLoading(false);
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
    } catch (error: any) {
      // Handle errors silently for daily check-in
      if (error.response?.status === 404) {
        console.log("Daily check-in not available - this is normal for new users");
      } else {
        console.log("Daily check-in error:", error);
      }
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
    } catch (error: any) {
      // Handle 404 errors silently (user has no points yet)
      if (error.response?.status === 404) {
        console.log("No points found for user - this is normal for new users");
        setOffChainPointsState(0);
      } else {
        console.error("Error fetching off-chain points:", error);
        setOffChainPointsState(0);
      }
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
      {/* Page Loading Spinner */}
      {isPageLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg font-semibold">Loading...</p>
          </div>
        </div>
      )}
      
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
                        disabled={isPageLoading}
                        className="bg-[#3f54b4] hover:bg-[#3f54b4]/80 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
