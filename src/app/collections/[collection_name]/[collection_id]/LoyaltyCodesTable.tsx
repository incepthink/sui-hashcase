"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Flame, Clock, Calendar, Info } from "lucide-react";
import toast from "react-hot-toast";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useLoyalty } from "@/hooks/useLoyalty"; // Import the new hook
import { useAddLoyalty } from "@/hooks/useAddLoyalty"; // Import the new hook
import ConnectButton from "@/components/ConnectButton";

interface User {
  id: number;
  walletAddress?: string; // Make optional to match global store User type
  email: string | null;
  badges?: string;
}

interface Collection {
  id: number;
  name: string;
  contract?: {
    Chain?: {
      chain_type: "ethereum" | "sui";
    };
  };
}

interface LoyaltyCodesTableProps {
  owner_id: number;
  collection: Collection;
  onPointsUpdate?: (newPoints: number) => void;
}

const LoyaltyCodesTable = ({
  owner_id,
  collection,
  onPointsUpdate,
}: LoyaltyCodesTableProps) => {
  const {
    user,
    isUserVerified,
    getWalletForChain,
    hasWalletForChain,
    setOpenModal,
  } = useGlobalAppStore();

  const [offChainPointsState, setOffChainPointsState] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Use the loyalty hook
  const {
    loyaltyCodes,
    usedCodes,
    transactionSummary,
    isLoading: loyaltyLoading,
    hasTransactionError,
    getLoyaltyCodesAndPoints,
    getUsedLoyaltyCodes,
    getLoyaltyCodeStatus,
    formatTimeRule,
    setUsedCodes,
  } = useLoyalty();

  // Use the add loyalty hook
  const {
    handleAddLoyalty,
    isLoading: addLoyaltyLoading,
    getRequiredChainType,
  } = useAddLoyalty({
    user,
    isUserVerified,
    hasWalletForChain,
    getWalletForChain,
    setOpenModal,
    collection,
    onPointsUpdate: (newPoints) => {
      setOffChainPointsState(newPoints);
      if (onPointsUpdate) {
        onPointsUpdate(newPoints);
      }
    },
    onSuccess: async () => {
      // Refresh data after successful loyalty redemption
      await fetchOffChainPoints();
      await getLoyaltyCodesAndPoints(owner_id);
      await getUsedLoyaltyCodes(user!.id, owner_id);
      // Update used codes immediately for UI feedback
      setUsedCodes((prev) => [...prev]);
    },
  });

  // Determine required chain type based on collection
  const getRequiredChainTypeLocal = (): "sui" | "evm" => {
    const chainType = collection?.contract?.Chain?.chain_type;
    return chainType === "ethereum" ? "evm" : "sui";
  };

  // Validate wallet connection before performing actions
  const validateWalletConnection = (): {
    isValid: boolean;
    walletAddress?: string;
  } => {
    if (!isUserVerified) {
      toast.error("Please connect your wallet to continue");
      setOpenModal(true);
      return { isValid: false };
    }

    const requiredChain = getRequiredChainTypeLocal();
    const hasCorrectWallet = hasWalletForChain(requiredChain);

    if (!hasCorrectWallet) {
      const chainName =
        requiredChain === "evm" ? "EVM (MetaMask, Phantom, Coinbase)" : "Sui";
      toast.error(`Please connect a ${chainName} wallet for this collection`, {
        duration: 5000,
      });
      setOpenModal(true);
      return { isValid: false };
    }

    const walletInfo = getWalletForChain(requiredChain);
    if (!walletInfo?.address) {
      toast.error("Wallet address not found. Please reconnect your wallet.");
      return { isValid: false };
    }

    return {
      isValid: true,
      walletAddress: walletInfo.address,
    };
  };

  const performDailyCheckIn = async (): Promise<void> => {
    if (!user?.id) {
      console.log("No user ID available for streak check-in");
      return;
    }

    const validation = validateWalletConnection();
    if (!validation.isValid) {
      console.log("Skipping daily check-in due to invalid wallet connection");
      return;
    }

    try {
      const checkInResponse = await axiosInstance.post(
        "/user/achievements/extend-streak",
        {
          walletAddress: validation.walletAddress,
          chainType: getRequiredChainTypeLocal(),
        },
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

      console.log(
        `Daily check-in successful with ${getRequiredChainTypeLocal()} wallet`
      );
    } catch (error: any) {
      console.log("Daily check-in failed:", error);

      if (error.response?.data?.message?.includes("wrong wallet")) {
        toast.error(
          "Daily check-in failed: Incorrect wallet type connected for this collection."
        );
      }
    }
  };

  const fetchOffChainPoints = async (): Promise<void> => {
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

  // Wrapper function for handleAddLoyalty to maintain compatibility
  const handleLoyaltyRedeem = async (
    code: string,
    value: number | undefined
  ) => {
    await handleAddLoyalty(code, value, owner_id, loyaltyCodes);
  };

  useEffect(() => {
    getLoyaltyCodesAndPoints(owner_id);
    fetchOffChainPoints();

    const requiredChain = getRequiredChainTypeLocal();
    if (hasWalletForChain(requiredChain)) {
      performDailyCheckIn();
    }

    if (user?.id) {
      getUsedLoyaltyCodes(user.id, owner_id);
    }
  }, [user?.id]);

  useEffect(() => {
    const requiredChain = getRequiredChainTypeLocal();
    if (user?.id && hasWalletForChain(requiredChain)) {
      performDailyCheckIn();
    }
  }, [hasWalletForChain(getRequiredChainTypeLocal())]);

  // Set page loading based on both loyalty loading and add loyalty loading
  const isCurrentlyLoading =
    loyaltyLoading || addLoyaltyLoading || isPageLoading;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWalletConnected = mounted && hasWalletForChain("sui");

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 text-white pb-16 md:pb-16">
      {/* Page Loading Spinner */}
      {isCurrentlyLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 sm:p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-base sm:text-lg font-semibold">
              Loading...
            </p>
          </div>
        </div>
      )}

      {/* Error State - Show when transaction error occurs */}
      {hasTransactionError && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-red-300">
            <Info className="w-5 h-5" />
            <span className="text-sm font-medium">
              Unable to verify code eligibility. All codes are temporarily
              disabled. Please refresh the page.
            </span>
          </div>
        </div>
      )}

      {/* Wallet Status Indicator */}
      {/* {isUserVerified && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                hasWalletForChain(getRequiredChainTypeLocal())
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span>
              {hasWalletForChain(getRequiredChainTypeLocal())
                ? `Connected to ${getRequiredChainTypeLocal().toUpperCase()} wallet`
                : `${getRequiredChainTypeLocal().toUpperCase()} wallet required for this collection`}
            </span>
          </div>
        </div>
      )} */}

      {/* Off-Chain Points */}

      {isWalletConnected ? (
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-8 bg-clip-text text-transparent text-white/90 drop-shadow-lg text-center px-2">
          {collection.name} Points: {offChainPointsState}
        </h1>
      ) : (
        <div className=" mb-8">
          <ConnectButton mid={true} />
        </div>
      )}

      {/* Streak Display */}
      <div className="flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-2 sm:py-2 rounded-md shadow-md mb-4 sm:mb-8">
        <Flame className="text-red-600 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
        <span className="text-base sm:text-xl font-semibold whitespace-nowrap">{`Streak: ${currentStreak} days`}</span>
      </div>

      {/* Loyalty Codes */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 text-blue-300 drop-shadow-md text-center px-2">
        Points
      </h1>

      {/* Mobile Card View */}
      <div className="w-full max-w-6xl md:hidden space-y-3">
        {loyaltyCodes?.map((loyalty) => {
          const status = getLoyaltyCodeStatus(
            loyalty,
            hasWalletForChain,
            getRequiredChainTypeLocal
          );

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
                    {!status.canUse ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-gray-600 px-2 py-1 rounded-md opacity-60 text-sm">
                          {loyalty.code}
                        </span>
                        <span className="text-orange-400 text-xs">
                          {status.statusText}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleLoyaltyRedeem(loyalty.code, loyalty.value)
                        }
                        disabled={
                          isCurrentlyLoading ||
                          !status.canRedeem ||
                          hasTransactionError
                        }
                        className={`px-3 py-1.5 rounded-md transition-colors text-sm mt-1 ${
                          status.canRedeem && !hasTransactionError
                            ? "bg-[#3f54b4] hover:bg-[#3f54b4]/80"
                            : "bg-gray-600 opacity-50 cursor-not-allowed"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={
                          hasTransactionError
                            ? "Code verification error - please refresh"
                            : !status.canRedeem
                            ? `Connect ${getRequiredChainTypeLocal().toUpperCase()} wallet to redeem`
                            : ""
                        }
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

                {/* Time Rules Info */}
                {(status.timeRules.availability_rule ||
                  status.timeRules.reset_rule) && (
                  <div className="bg-white/5 rounded p-3 border-l-2 border-blue-400">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-blue-300 font-medium">
                        Time Restrictions
                      </p>
                    </div>

                    {status.timeRules.reset_rule && (
                      <div className="mb-2">
                        <p className="text-xs text-white/70 mb-1">Reset:</p>
                        <p className="text-xs text-white/90">
                          {formatTimeRule(status.timeRules.reset_rule)}
                        </p>
                      </div>
                    )}

                    {status.timeRules.availability_rule && (
                      <div>
                        <p className="text-xs text-white/70 mb-1">Available:</p>
                        <p className="text-xs text-white/90">
                          {formatTimeRule(status.timeRules.availability_rule)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Show eligibility info if available */}
                {status.isUsed && (
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-xs text-white/70">
                      Used: {status.usageCount} times
                    </p>
                    {!status.canUse && status.eligibilityMessage && (
                      <p className="text-xs text-orange-300 mt-1">
                        {status.eligibilityMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="w-full max-w-7xl overflow-x-auto hidden md:block">
        <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-lg">
          <thead>
            <tr className="text-left bg-[#3f54b4] text-white">
              <th className="p-3 md:p-4 text-sm md:text-base">Code</th>
              <th className="p-3 md:p-4 text-sm md:text-base">Value</th>
              <th className="p-3 md:p-4 text-sm md:text-base">Type</th>
              <th className="p-3 md:p-4 text-sm md:text-base">Reset Rule</th>
              <th className="p-3 md:p-4 text-sm md:text-base">Availability</th>
              <th className="p-3 md:p-4 text-sm md:text-base">Status</th>
            </tr>
          </thead>
          <tbody>
            {loyaltyCodes?.map((loyalty) => {
              const status = getLoyaltyCodeStatus(
                loyalty,
                hasWalletForChain,
                getRequiredChainTypeLocal
              );

              return (
                <tr
                  key={loyalty.id}
                  className="border-b border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <td className="p-3 md:p-4 font-semibold">
                    {!status.canUse ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-600 px-2 py-1 rounded-md opacity-60 text-sm">
                          {loyalty.code}
                        </span>
                        <span className="text-orange-400 text-sm">
                          {status.statusText}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleLoyaltyRedeem(loyalty.code, loyalty.value)
                        }
                        disabled={
                          isCurrentlyLoading ||
                          !status.canRedeem ||
                          hasTransactionError
                        }
                        className={`px-2 py-1 rounded-md transition-colors text-sm ${
                          status.canRedeem && !hasTransactionError
                            ? "bg-[#3f54b4] hover:bg-[#3f54b4]/80"
                            : "bg-gray-600 opacity-50 cursor-not-allowed"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={
                          hasTransactionError
                            ? "Code verification error - please refresh"
                            : !status.canRedeem
                            ? `Connect ${getRequiredChainTypeLocal().toUpperCase()} wallet to redeem`
                            : ""
                        }
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
                    {status.isUsed && (
                      <div className="text-xs text-white/60 mt-1">
                        Used: {status.usageCount}x
                      </div>
                    )}
                  </td>
                  <td className="p-3 md:p-4 text-xs text-white/80">
                    <div className="max-w-48">
                      {formatTimeRule(status.timeRules.reset_rule)}
                    </div>
                  </td>
                  <td className="p-3 md:p-4 text-xs text-white/80">
                    <div className="max-w-48">
                      {formatTimeRule(status.timeRules.availability_rule)}
                    </div>
                  </td>
                  <td className="p-3 md:p-4">
                    {!status.canUse && status.eligibilityMessage && (
                      <div className="flex items-center gap-1">
                        <Info className="w-4 h-4 text-orange-400" />
                        <span
                          className="text-xs text-orange-300 cursor-help max-w-32 truncate"
                          title={status.eligibilityMessage}
                        >
                          {status.eligibilityMessage}
                        </span>
                      </div>
                    )}
                    {status.canUse &&
                      !status.isUsed &&
                      !hasTransactionError && (
                        <span className="text-green-400 text-sm">
                          ✓ Available
                        </span>
                      )}
                    {hasTransactionError && (
                      <span className="text-red-400 text-sm">⚠ Error</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {loyaltyCodes.length === 0 && !isCurrentlyLoading && (
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
