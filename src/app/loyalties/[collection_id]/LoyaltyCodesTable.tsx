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
  id: number;
  walletAddress: string;
  email: string | null;
  badges: string;
}

const LoyaltyCodesTable = ({
  owner_id,
  onPointsUpdate,
}: {
  owner_id: number;
  onPointsUpdate?: (newPoints: number) => void;
}) => {
  const { user, isUserVerified } = useGlobalAppStore();

  const [loyaltyCodes, setLoyaltyCodes] = useState<Loyalty[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [offChainPointsState, setOffChainPointsState] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const getLoyaltyCodesAndPoints = async () => {
    setIsPageLoading(true);
    try {
      const loyaltyResponse = await axiosInstance.get(
        "/platform/get-loyalties",
        {
          params: {
            owner_id: owner_id,
          },
        }
      );

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

      const usedCodesList = response.data.data.map(
        (transaction: LoyaltyTransaction) => transaction.code
      );
      setUsedCodes(usedCodesList);
    } catch (error) {
      console.error("Error fetching used loyalty codes:", error);
      setUsedCodes([]);
    }
  };

  const handleAddLoyalty = async (code: string, value: number | undefined) => {
    if (!isUserVerified || !user) {
      toast.error("Please connect your wallet to redeem loyalty codes");
      return;
    }

    setIsPageLoading(true);

    try {
      const loyaltyCode = loyaltyCodes.find((lc) => lc.code === code);
      let backendType = loyaltyCode?.type || "";
      if (backendType === "one_time_fixed") backendType = "ONE_FIXED";
      else if (backendType === "repeat_fixed") backendType = "FIXED";
      else if (backendType === "repeat_variable") backendType = "VARIABLE";

      const loyaltyResponse = await axiosInstance.post(
        "/user/achievements/add-points",
        {
          loyalty: {
            code,
            value: value || 0,
            type: backendType,
          },
        },
        {
          params: {
            owner_id,
            user_id: user.id,
          },
        }
      );

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

      if (onPointsUpdate && newPoints > 0) {
        onPointsUpdate(newPoints);
      }

      setUsedCodes((prev) => [...prev, code]);

      await fetchOffChainPoints();
      await getLoyaltyCodesAndPoints();
      await getUsedLoyaltyCodes();
    } catch (error: any) {
      console.error("Full error object:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error(
          "Authentication failed. Please reconnect your wallet and try again."
        );
      } else if (
        error.response?.data?.message === "Loyalty code already claimed"
      ) {
        toast.error("This loyalty code has already been claimed.");
      } else if (error.response?.data?.message === "Loyalty code not found") {
        toast.error("Invalid loyalty code.");
      } else {
        toast.error(
          `Failed to redeem loyalty code: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setIsPageLoading(false);
    }
  };

  const performDailyCheckIn = async () => {
    if (!user?.id) {
      console.log("No user ID available for streak check-in");
      return;
    }

    try {
      const checkInResponse = await axiosInstance.post(
        "/user/achievements/extend-streak",
        null,
        {
          params: {
            user_id: user.id,
            owner_id: owner_id,
          },
        }
      );

      const user_achievements = checkInResponse.data.user_achievements;
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
    getUsedLoyaltyCodes();
  }, [user?.id]);

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 text-white pb-16 md:pb-16">
      {/* Page Loading Spinner */}
      {isPageLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-base sm:text-lg font-semibold">
              Loading...
            </p>
          </div>
        </div>
      )}

      {/* Off-Chain Points */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-6 bg-clip-text text-transparent text-white/90 drop-shadow-lg text-center px-2">
        {`Off-Chain Points: ${offChainPointsState}`}
      </h1>

      {/* Streak Display */}
      <div className="flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-2 sm:py-2 rounded-md shadow-md mb-4 sm:mb-6">
        <Flame className="text-red-600 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
        <span className="text-base sm:text-xl font-semibold whitespace-nowrap">{`Streak: ${currentStreak} days`}</span>
      </div>

      {/* Loyalty Codes */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 text-blue-300 drop-shadow-md text-center px-2">
        Loyalty Codes
      </h1>

      {/* Mobile Card View */}
      <div className="w-full max-w-6xl md:hidden space-y-3">
        {loyaltyCodes?.map((loyalty) => {
          const isUsed = usedCodes.includes(loyalty.code);

          return (
            <div
              key={loyalty.id}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20"
            >
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider">
                      Code
                    </p>
                    {isUsed ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-gray-600 px-2 py-1 rounded-md opacity-60 text-sm">
                          {loyalty.code}
                        </span>
                        <span className="text-green-400 text-xs">✓ Used</span>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleAddLoyalty(loyalty.code, loyalty.value)
                        }
                        disabled={isPageLoading}
                        className="bg-[#3f54b4] hover:bg-[#3f54b4]/80 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-1"
                      >
                        {loyalty.code}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider">
                      Value
                    </p>
                    <p className="text-lg font-semibold">{loyalty.value}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wider">
                      Type
                    </p>
                    <p className="text-sm font-medium">{loyalty.type}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="w-full max-w-6xl overflow-x-auto hidden md:block">
        <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-lg">
          <thead>
            <tr className="text-left bg-[#3f54b4] text-white">
              <th className="p-3 md:p-4 text-sm md:text-base">Code</th>
              <th className="p-3 md:p-4 text-sm md:text-base">Value</th>
              <th className="p-3 md:p-4 text-sm md:text-base">Type</th>
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
                  <td className="p-3 md:p-4 font-semibold">
                    {isUsed ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-600 px-2 py-1 rounded-md opacity-60 text-sm">
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
                        className="bg-[#3f54b4] hover:bg-[#3f54b4]/80 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {loyalty.code}
                      </button>
                    )}
                  </td>
                  <td className="p-3 md:p-4 text-sm md:text-base">
                    {loyalty.value}
                  </td>
                  <td className="p-3 md:p-4 text-sm md:text-base">
                    {loyalty.type}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {loyaltyCodes.length === 0 && !isPageLoading && (
        <div className="text-center py-8">
          <p className="text-white/60 text-base sm:text-lg">
            No loyalty codes available
          </p>
        </div>
      )}
    </div>
  );
};

export default LoyaltyCodesTable;
