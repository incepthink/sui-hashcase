"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Flame, Clock, Calendar, Info } from "lucide-react";
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

type TimeRule = {
  id: number;
  name: string;
  rule_type: "recurring_reset" | "availability_window";
  timezone: string;
  reset_value?: number;
  reset_unit?: "minutes" | "hours" | "days" | "weeks" | "months";
  reset_time?: string;
  reset_day?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  available_days?: string[];
};

type TransactionSummary = {
  code: string;
  type: string;
  usage_count: number;
  last_used: string;
  can_use_again: boolean;
  eligibility_message: string;
  next_eligible_at: string | null;
  loyalty_type: string;
  has_time_rules: boolean;
  time_rules: {
    availability_rule: TimeRule | null;
    reset_rule: TimeRule | null;
  };
};

interface User {
  id: number;
  walletAddress: string;
  email: string | null;
  badges: string;
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

  const [loyaltyCodes, setLoyaltyCodes] = useState<Loyalty[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<
    TransactionSummary[]
  >([]);
  const [offChainPointsState, setOffChainPointsState] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Determine required chain type based on collection
  const getRequiredChainType = (): "sui" | "evm" => {
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

    const requiredChain = getRequiredChainType();
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

  const getLoyaltyCodesAndPoints = async (): Promise<void> => {
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

      setLoyaltyCodes(loyaltyResponse.data.loyalties || []);
    } catch (error) {
      console.error("Error fetching loyalty codes:", error);
      setLoyaltyCodes([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  const getUsedLoyaltyCodes = async (): Promise<void> => {
    if (!user?.id) return;

    try {
      const response = await axiosInstance.get("/user/loyalty/transactions", {
        params: {
          user_id: user.id,
          owner_id: owner_id,
        },
      });

      // Store the summary data for eligibility checks
      const summaryData: TransactionSummary[] = response.data.summary || [];
      setTransactionSummary(summaryData);

      // Keep the old usedCodes for backward compatibility
      const usedCodesList: string[] = response.data.data.map(
        (transaction: LoyaltyTransaction) => transaction.code
      );
      setUsedCodes(usedCodesList);
    } catch (error) {
      console.error("Error fetching used loyalty codes:", error);
      setUsedCodes([]);
      setTransactionSummary([]);
    }
  };

  const handleAddLoyalty = async (
    code: string,
    value: number | undefined
  ): Promise<void> => {
    // Validate wallet connection before proceeding
    const validation = validateWalletConnection();
    if (!validation.isValid) {
      return;
    }

    setIsPageLoading(true);

    try {
      const loyaltyCode = loyaltyCodes.find((lc) => lc.code === code);
      let backendType = loyaltyCode?.type || "";
      if (backendType === "one_time_fixed") backendType = "ONE_FIXED";
      else if (backendType === "repeat_fixed") backendType = "FIXED";
      else if (backendType === "repeat_variable") backendType = "VARIABLE";
      else if (backendType === "one_time_variable")
        backendType = "ONE_VARIABLE";

      const loyaltyResponse = await axiosInstance.post(
        "/user/achievements/add-points",
        {
          loyalty: {
            code,
            value: value || 0,
            type: backendType,
          },
          walletAddress: validation.walletAddress,
          chainType: getRequiredChainType(),
        },
        {
          params: {
            owner_id,
            user_id: user!.id,
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

      const requiredChain = getRequiredChainType();
      const chainName = requiredChain === "evm" ? "EVM" : "Sui";

      toast.success(
        `Successfully redeemed ${code} with ${chainName} wallet! +${value} points added. Total: ${newPoints} points`
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
      } else if (error.response?.data?.message?.includes("wrong wallet")) {
        toast.error(
          "Incorrect wallet type connected. Please connect the appropriate wallet for this collection."
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
          chainType: getRequiredChainType(),
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
        `Daily check-in successful with ${getRequiredChainType()} wallet`
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

  const getLoyaltyCodeStatus = (
    loyalty: Loyalty
  ): {
    canUse: boolean;
    isUsed: boolean;
    eligibilityMessage: string;
    usageCount: number;
    canRedeem: boolean;
    statusText: string;
    timeRules: {
      availability_rule: TimeRule | null;
      reset_rule: TimeRule | null;
    };
  } => {
    // Convert frontend type to backend type for matching
    let backendType = loyalty.type;
    if (loyalty.type === "one_time_fixed") backendType = "ONE_FIXED";
    else if (loyalty.type === "repeat_fixed") backendType = "FIXED";
    else if (loyalty.type === "repeat_variable") backendType = "VARIABLE";
    else if (loyalty.type === "one_time_variable") backendType = "ONE_VARIABLE";

    // Find the summary entry for this specific code+type combination using backend type
    const summaryEntry = transactionSummary.find(
      (summary) => summary.code === loyalty.code && summary.type === backendType
    );

    const canUse = summaryEntry ? summaryEntry.can_use_again : true;
    const isUsed = summaryEntry ? summaryEntry.usage_count > 0 : false;
    const eligibilityMessage = summaryEntry?.eligibility_message || "";
    const usageCount = summaryEntry?.usage_count || 0;
    const timeRules = summaryEntry?.time_rules || {
      availability_rule: null,
      reset_rule: null,
    };

    const canRedeem = hasWalletForChain(getRequiredChainType()) && canUse;

    let statusText = "";
    if (!canUse && isUsed) {
      if (usageCount === 1 && backendType.includes("ONE_")) {
        statusText = "✓ Used";
      } else {
        statusText = "On Cooldown";
      }
    }

    return {
      canUse,
      isUsed,
      eligibilityMessage,
      usageCount,
      canRedeem,
      statusText,
      timeRules,
    };
  };

  const formatTimeRule = (rule: TimeRule | null): string => {
    if (!rule) return "None";

    if (rule.rule_type === "recurring_reset") {
      let resetText = `Every ${rule.reset_value} ${rule.reset_unit}`;
      if (
        rule.reset_time &&
        (rule.reset_unit === "days" || rule.reset_unit === "weeks")
      ) {
        resetText += ` at ${rule.reset_time}`;
      }
      resetText += ` (GMT${rule.timezone})`;
      return resetText;
    }

    if (rule.rule_type === "availability_window") {
      const parts: string[] = [];

      if (rule.start_date || rule.end_date) {
        if (rule.start_date && rule.end_date) {
          parts.push(`${rule.start_date} to ${rule.end_date}`);
        } else if (rule.start_date) {
          parts.push(`From ${rule.start_date}`);
        } else if (rule.end_date) {
          parts.push(`Until ${rule.end_date}`);
        }
      }

      if (rule.start_time || rule.end_time) {
        if (rule.start_time && rule.end_time) {
          parts.push(`${rule.start_time}-${rule.end_time} daily`);
        } else if (rule.start_time) {
          parts.push(`From ${rule.start_time} daily`);
        } else if (rule.end_time) {
          parts.push(`Until ${rule.end_time} daily`);
        }
      }

      if (rule.available_days && rule.available_days.length > 0) {
        const days = rule.available_days
          .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
          .join(", ");
        parts.push(`On ${days}`);
      }

      if (parts.length > 0) {
        return `${parts.join(", ")} (GMT${rule.timezone})`;
      }

      return `GMT${rule.timezone}`;
    }

    return "Unknown";
  };

  useEffect(() => {
    getLoyaltyCodesAndPoints();
    fetchOffChainPoints();

    const requiredChain = getRequiredChainType();
    if (hasWalletForChain(requiredChain)) {
      performDailyCheckIn();
    }

    getUsedLoyaltyCodes();
  }, [user?.id]);

  useEffect(() => {
    const requiredChain = getRequiredChainType();
    if (user?.id && hasWalletForChain(requiredChain)) {
      performDailyCheckIn();
    }
  }, [hasWalletForChain(getRequiredChainType())]);

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

      {/* Wallet Status Indicator */}
      {isUserVerified && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg border border-white/20">
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                hasWalletForChain(getRequiredChainType())
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span>
              {hasWalletForChain(getRequiredChainType())
                ? `Connected to ${getRequiredChainType().toUpperCase()} wallet`
                : `${getRequiredChainType().toUpperCase()} wallet required for this collection`}
            </span>
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
          const status = getLoyaltyCodeStatus(loyalty);

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
                          handleAddLoyalty(loyalty.code, loyalty.value)
                        }
                        disabled={isPageLoading || !status.canRedeem}
                        className={`px-3 py-1.5 rounded-md transition-colors text-sm mt-1 ${
                          status.canRedeem
                            ? "bg-[#3f54b4] hover:bg-[#3f54b4]/80"
                            : "bg-gray-600 opacity-50 cursor-not-allowed"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={
                          !status.canRedeem
                            ? `Connect ${getRequiredChainType().toUpperCase()} wallet to redeem`
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
              const status = getLoyaltyCodeStatus(loyalty);

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
                          handleAddLoyalty(loyalty.code, loyalty.value)
                        }
                        disabled={isPageLoading || !status.canRedeem}
                        className={`px-2 py-1 rounded-md transition-colors text-sm ${
                          status.canRedeem
                            ? "bg-[#3f54b4] hover:bg-[#3f54b4]/80"
                            : "bg-gray-600 opacity-50 cursor-not-allowed"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={
                          !status.canRedeem
                            ? `Connect ${getRequiredChainType().toUpperCase()} wallet to redeem`
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
                    {status.canUse && !status.isUsed && (
                      <span className="text-green-400 text-sm">
                        ✓ Available
                      </span>
                    )}
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
