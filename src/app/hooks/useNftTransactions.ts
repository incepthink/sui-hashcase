import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";

import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { toast } from "react-hot-toast";
import { 
  freeMintNftHelper, 
  dynamicMintNftHelper, 
  claimNftHelper 
} from "@/utils/contractHelperFunctions";

interface MintingForm {
  title: string;
  description: string;
  image_url: string;
  collection_id: string;
  attributes: string;
}

export const useNftTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);

  //needed to execute transactions
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  //we get the packageId used to call the transactions
  const packageId =
    process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID ||
    "0x48534ac3dd3df77cb4d6e17e05d2bd7961d5352e10fb01561184828d2aa3248e";

  const freeMintNft = async (nftForm: MintingForm) => {
    if (!nftForm.collection_id) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    let txResult;
    try {
      // Use helper function instead of direct transaction creation
      const tx = await freeMintNftHelper(nftForm);

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
        options: { showEvents: true },
      });

      console.log("Transaction Details:", txDetails);
      toast.success("NFT Minted Successfully!");
      return txDetails;
    } catch (error) {
      console.error("Error executing transaction:", error);
      toast.error("Failed to mint NFT.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fixedPriceMintNFT = async (nftForm: MintingForm, address: string) => {
    if (!nftForm.collection_id || !address) {
      toast.error("Please fill in all fields.");
      return null;
    }

    const adminCapId = process.env.ADMIN_CAP_ID;
    if (!adminCapId) {
      console.error("❌ [ADMIN MINT] AdminCap ID not configured");
      toast.error("Admin capability not configured.");
      return null;
    }

    setIsLoading(true);

    try {
      console.log("🚀 [ADMIN MINT] Step 1: Creating transaction");
      
      // Step 1: Create transaction
      const tx = new Transaction();
      
      // Step 2: Split gas to create payment coin
      console.log("🚀 [ADMIN MINT] Step 2: Splitting coins (100 MIST)");
      const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(100)]);
      
      // Step 3: Prepare data
      console.log("🚀 [ADMIN MINT] Step 3: Preparing data");
      const imageUrlBytes = Array.from(
        new TextEncoder().encode(nftForm.image_url)
      );
      const attributesArray = nftForm.attributes
        .split(",")
        .map((attr) => attr.trim())
        .filter(Boolean);
      
      // Step 4: Call admin Move function
      console.log("🚀 [ADMIN MINT] Step 4: Adding admin Move call");
      tx.moveCall({
        target: `${packageId}::hashcase_module::admin_fixed_price_mint_nft`,
        arguments: [
          tx.object(adminCapId),           // AdminCap object
          tx.object(nftForm.collection_id), // Collection
          payment,                          // Payment coin (100 MIST)
          tx.pure.string(nftForm.title),   // Title
          tx.pure.string(nftForm.description), // Description
          tx.pure.vector("u8", imageUrlBytes), // Image bytes
          tx.pure.vector("string", attributesArray), // Attributes
          tx.pure.address(address),        // Recipient (user address)
        ],
      });
      
      // Step 5: Send to wallet
      console.log("🚀 [ADMIN MINT] Step 5: Sending to wallet");
      const txResult = await signAndExecuteTransaction({
        transaction: tx as any,
        chain: "sui:mainnet",
      });

      if (!txResult?.digest) {
        throw new Error("No transaction digest returned");
      }

      console.log("✅ [ADMIN MINT] Step 6: Transaction confirmed, digest:", txResult.digest);
      
      toast.success("NFT Minted Successfully!");
      return { success: true, digest: txResult.digest };
      
    } catch (error: any) {
      console.error("❌ [ADMIN MINT] Error:", error?.message || error);
      toast.error("Failed to mint NFT.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const claimNFT = async (collection_id: string, nft_id: string) => {
    if (!collection_id || !nft_id) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    let txResult;
    try {
      // Use helper function instead of direct transaction creation
      const tx = await claimNftHelper({ collection_id, nft_id });

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

  const updateNftMetadata = async (updateForm: any) => {
    if (!updateForm.collectionId || !updateForm.nftId) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    let txResult;
    try {
      const tx = new Transaction();

      // Use the same package ID as the profile page
      const PACKAGE_ID = process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID ||
        "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84";

      // For now, we'll use a simpler approach without tickets
      // You can implement the ticket system later
      tx.moveCall({
        target: `${PACKAGE_ID}::hashcase_module::update_nft_metadata`,
        arguments: [
          tx.object(updateForm.collectionId),
          tx.object(updateForm.nftId),
          tx.pure.string(updateForm.name || "Updated Name"),
          tx.pure.string(updateForm.description || "Updated Description"),
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(updateForm.imageUrl || ""))),
          tx.pure.vector("string", updateForm.attributes ? updateForm.attributes.split(",").map((attr: string) => attr.trim()) : []),
        ],
      });

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
      toast.success("NFT Metadata Updated Successfully!");
      return txDetails;
    } catch (error) {
      console.error("Error executing transaction:", error);
      toast.error("Failed to update NFT Metadata.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW - Function for admins to create update tickets
  const createUpdateTicket = async (ticketData: any) => {
    if (!ticketData.adminCapId || !ticketData.nftId || !ticketData.recipient) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const tx = new Transaction();
      const imageUrlBytes = Array.from(
        new TextEncoder().encode(ticketData.newImageUrl)
      );
      const attributesArray = ticketData.newAttributes
        .split(",")
        .map((attr: string) => attr.trim())
        .filter(Boolean);

      tx.moveCall({
        target: `${packageId}::hashcase_module::create_update_ticket`,
        arguments: [
          tx.object(ticketData.adminCapId),
          tx.pure.id(ticketData.nftId),
          tx.pure.id(ticketData.collectionId),
          tx.pure.address(ticketData.recipient),
          tx.pure.string(ticketData.newName),
          tx.pure.string(ticketData.newDescription),
          tx.pure.vector("u8", imageUrlBytes),
          tx.pure.vector("string", attributesArray),
        ],
      });

      const txResult = await signAndExecuteTransaction({
        transaction: tx as any,
        chain: "sui:mainnet",
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const digest = txResult?.digest || "";
      await suiClient.waitForTransaction({ digest, timeout: 5_000 });

      const txDetails = await suiClient.getTransactionBlock({
        digest,
        options: { showEvents: true },
      });

      console.log("Update Ticket Created:", txDetails);
      toast.success("Update Ticket Created Successfully!");
      return txDetails;
    } catch (error) {
      console.error("Error creating update ticket:", error);
      toast.error("Failed to create update ticket.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    freeMintNft,
    fixedPriceMintNFT,
    claimNFT,
    updateNftMetadata,
    createUpdateTicket, // ✅ NEW - Export the new function
  };
};
