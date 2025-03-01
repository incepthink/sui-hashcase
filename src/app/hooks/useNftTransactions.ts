import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";

import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { toast } from "react-hot-toast";

export const useNftTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);

  //needed to execute transactions
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const claimNFT = async (collection_id: string, nft_id: string) => {
    const packageId =
      "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84";

    if (!collection_id || !nft_id) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    let txResult;
    try {
      const tx = new Transaction();

      tx.moveCall({
        target: `${packageId}::hashcase_module::claim_nft`,
        arguments: [
          tx.object(collection_id), // Collection object (must be mutable)
          tx.object(nft_id), // NFT object (user must own this)
        ],
      });

      txResult = await signAndExecuteTransaction({
        transaction: tx as any,
        chain: "sui:testnet",
      });

      // Wait before fetching transaction details
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch transaction details
      const digest = txResult?.digest || "";
      await suiClient.waitForTransaction({ digest, timeout: 5_000 });

      const txDetails = await suiClient.getTransactionBlock({
        digest,
        options: { showObjectChanges: true },
      });

      console.log("Transaction Details:", txDetails);
      toast.success("NFT Claimed Successfully!");
      return txDetails;
    } catch (error) {
      console.error("Error executing transaction:", error);
      toast.error("Failed to Claim NFT.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    claimNFT,
  };
};
