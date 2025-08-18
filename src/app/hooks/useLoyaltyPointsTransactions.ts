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
    process.env.MAINNET_LOYALTY_PACKAGE_ID ||
    "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";
  const treasuryCapId =
    process.env.NEXT_PUBLIC_TREASURY_CAP ||
    "0xacd90a0531d5de71ded1d80d2d01d78caec275490f8a2075dbc0d9d1fdff28c8";

  const addLoyaltyPoints = async (userTokenId: string, amount: string) => {
    userTokenId =
      userTokenId ||
      "0x4215804794fb9bc9b01b0148b9caaba82cea4194ca1ccb2cd383e95403682081";

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
        target: `${packageId}::loyalty_points::add_points`,
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
    userTokenId =
      userTokenId ||
      "0x4215804794fb9bc9b01b0148b9caaba82cea4194ca1ccb2cd383e95403682081";

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
        target: `${packageId}::loyalty_points::spend_points`,
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
