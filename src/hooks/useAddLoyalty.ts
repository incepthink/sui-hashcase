import { useState } from "react";
import axiosInstance from "@/utils/axios";
import toast from "react-hot-toast";

type Loyalty = {
  id: number;
  owner_id: number;
  code: string;
  value: number;
  type: string;
};

interface User {
  id: number;
  walletAddress?: string; // Make optional since some User types don't have this
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

interface UseAddLoyaltyProps {
  user: User | null;
  isUserVerified: boolean;
  hasWalletForChain: (chain: "sui" | "evm") => boolean;
  getWalletForChain: (chain: "sui" | "evm") => { address: string } | null;
  setOpenModal: (open: boolean) => void;
  collection: Collection;
  onPointsUpdate?: (newPoints: number) => void;
  onSuccess?: () => void; // Callback for refreshing data
}

export const useAddLoyalty = ({
  user,
  isUserVerified,
  hasWalletForChain,
  getWalletForChain,
  setOpenModal,
  collection,
  onPointsUpdate,
  onSuccess,
}: UseAddLoyaltyProps) => {
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAddLoyalty = async (
    code: string,
    value: number | undefined,
    owner_id: number,
    loyaltyCodes: Loyalty[]
  ): Promise<void> => {
    // Validate wallet connection before proceeding
    const validation = validateWalletConnection();
    if (!validation.isValid || !user?.id) {
      return;
    }

    setIsLoading(true);

    try {
      const loyaltyCode = loyaltyCodes.find((lc) => lc.code === code);
      let backendType = loyaltyCode?.type || "";
      if (backendType === "one_time_fixed") backendType = "ONE_FIXED";
      else if (backendType === "repeat_fixed") backendType = "FIXED";
      else if (backendType === "repeat_variable") backendType = "VARIABLE";
      else if (backendType === "one_time_variable") backendType = "ONE_VARIABLE";

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
            user_id: user.id,
          },
        }
      );

      let newPoints = 0;
      if (loyaltyResponse.data.user?.total_loyalty_points) {
        newPoints = loyaltyResponse.data.user.total_loyalty_points;
      } else if (loyaltyResponse.data.totalPoints) {
        newPoints = loyaltyResponse.data.totalPoints;
      }

      const requiredChain = getRequiredChainType();
      const chainName = requiredChain === "evm" ? "EVM" : "Sui";

      toast.success(
        `Successfully redeemed ${code} with ${chainName} wallet! +${value} points added. Total: ${newPoints} points`
      );

      // Call callbacks if provided
      if (onPointsUpdate && newPoints > 0) {
        onPointsUpdate(newPoints);
      }

      if (onSuccess) {
        onSuccess();
      }
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
      } else if (error.response?.data?.message === "Loyalty code already claimed") {
        toast.error("This loyalty code has already been claimed.");
      } else if (error.response?.data?.message === "Loyalty code not found") {
        toast.error("Invalid loyalty code.");
      } else if (error.response?.data?.message?.includes("Outside availability window")) {
        toast.error(`Code not available: ${error.response.data.message}`);
      } else if (error.response?.data?.message?.includes("You can claim this code again")) {
        toast.error(`On cooldown: ${error.response.data.message}`);
      } else {
        toast.error(
          `Failed to redeem loyalty code: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleAddLoyalty,
    isLoading,
    getRequiredChainType,
  };
};