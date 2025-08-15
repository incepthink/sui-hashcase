import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";

import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { toast } from "react-hot-toast";

export const useLoyaltyPointsTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);

  //needed to execute transactions
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const packageId =
    process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID ||
    "0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0";
  const treasuryCapId =
    process.env.NEXT_PUBLIC_TREASURY_CAP ||
    "0xa197e2c1dd489eef6507833e7f167b6aa814c07434df843e9c89b78acf57c7dd";

  const addLoyaltyPoints = async (userTokenId: string, amount: string) => {
    if (!treasuryCapId || !userTokenId || !amount) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    let txResult;

    try {
      // Create transaction
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty::reward_user`,
        arguments: [
          tx.object(treasuryCapId),
          tx.pure.u64(Number(amount)),
          tx.pure.address(userTokenId),
        ],
      });

      // Execute transaction
      txResult = await signAndExecuteTransaction({
        transaction: tx as any,
        chain: "sui:mainnet",
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
      toast.success("Points added successfully!");
      return txDetails;
    } catch (error) {
      console.error("Error executing transaction:", error);
      toast.error("Failed to add points.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const spendLoyaltyPoints = async (userTokenId: string, amount: string) => {
    if (!treasuryCapId || !userTokenId || !amount) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    let txResult;

    try {
      // Create transaction
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty::spend_points`,
        arguments: [
          tx.object(treasuryCapId),
          tx.object(userTokenId),
          tx.pure.u64(Number(amount)),
        ],
      });
      // Execute transaction
      txResult = await signAndExecuteTransaction({
        transaction: tx as any,
        chain: "sui:mainnet",
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
      toast.success("Points spent successfully!");
      return txDetails;
    } catch (error) {
      console.error("Error executing transaction:", error);
      toast.error("Failed to add points.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addLoyaltyPoints,
    spendLoyaltyPoints,
  };
};
