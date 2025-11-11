import { useState } from "react";
import { useNftTransactions } from "@/app/hooks/useNftTransactions";
import notify, { notifyPromise, notifyResolve } from "@/utils/notify";

interface PaidMintForm {
  collection_id: string;
  title: string;
  description: string;
  image_url: string;
  attributes?: string;
  // package_id is required for paid minting (must come from NFT metadata)
  package_id: string;
}

interface PaidMintResult {
  success: boolean;
  transactionDigest?: string;
  error?: string;
}

export const usePaidMint = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fixedPriceMintNFT } = useNftTransactions();

  const mintPaidNFT = async (
    nftForm: PaidMintForm,
    userAddress: string,
    price?: number
  ): Promise<PaidMintResult> => {
    if (!userAddress) {
      const errorMsg = "Wallet address required for paid minting";
      setError(errorMsg);
      notify(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    if (!nftForm) {
      const errorMsg = "NFT data is required";
      setError(errorMsg);
      notify(errorMsg, "error");
      return { success: false, error: errorMsg };
    }

    // Ensure package_id is present on the metadata/form. Paid mint requires it.
    if (!nftForm.package_id) {
      const errorMsg = "Contract package id (package_id) is required for paid minting.";
      setError(errorMsg);
      notify(errorMsg, "error");
      console.error("❌ [PAID MINT] package_id missing on nftForm", nftForm);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);
    const toastId = notifyPromise("Processing paid mint...", "info");

    try {
      // Use default collection address if not provided
      const finalForm = {
        collection_id:
          nftForm.collection_id ||
          "0xf5781a9473653703338da4a8ab7de5225110f8da0ae43bf5221c25da628ac5c7",
        title: nftForm.title,
        description: nftForm.description,
        image_url: nftForm.image_url,
        attributes: nftForm.attributes || "",
        package_id: nftForm.package_id,
      };

      console.log("💰 Processing paid mint with form:", finalForm, userAddress);

      // Call the Sui transaction function
      const result = await fixedPriceMintNFT(finalForm, userAddress);

      console.log("📋 Transaction result:", result);

      // Check if transaction actually succeeded
      if (!result) {
        throw new Error("Transaction failed");
      }

      console.log("✅ Paid mint successful");
      notifyResolve(toastId, "NFT minted successfully!", "success");

      return {
        success: true,
      };
    } catch (err: any) {
      // Log full error for debugging, but don't show to user
      console.error("❌ Paid mint failed:", err);

      // Always show generic message to user
      const userFriendlyMessage = "Failed to mint NFT. Please try again.";
      setError(userFriendlyMessage);
      notifyResolve(toastId, userFriendlyMessage, "error");

      return { success: false, error: userFriendlyMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    mintPaidNFT,
    loading,
    error,
  };
};
