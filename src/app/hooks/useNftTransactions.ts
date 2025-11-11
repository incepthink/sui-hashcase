import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";

import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { toast } from "react-hot-toast";
import {
  freeMintNftHelper,
  dynamicMintNftHelper,
  claimNftHelper,
} from "@/utils/contractHelperFunctions";
import { SuiClient } from "@mysten/sui/client";
// removed SuiClient usage - public mints will be user-signed

interface MintingForm {
  title: string;
  description: string;
  image_url: string;
  collection_id: string;
  attributes: string;
  // optional package id coming from the metadata
  package_id?: string;
}

export const useNftTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);

  //needed to execute transactions
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

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

  const fixedPriceMintNFT = async (
    nftForm: MintingForm,
    address: string,
    priceAmount?: number
  ) => {
    if (!nftForm.collection_id || !address) {
      toast.error("Please fill in all fields.");
      return null;
    }

    if (!nftForm.package_id) {
      console.error("❌ [PAID MINT] package_id is required for paid minting");
      toast.error(
        "Contract package id (package_id) is required for paid minting."
      );
      return null;
    }

    setIsLoading(true);
    const client = new SuiClient({
      url: process.env.SUI_CLIENT_LINK || "https://fullnode.mainnet.sui.io:443",
    });

    const adminCapId =
      process.env.ADMIN_CAP_ID ||
      "0x6b3e6a4467778b2d340b4a5fcd2ce7dfa8ed1e7eac04ba462276e2505142fe35";
    try {
      const tx = new Transaction();
      tx.setSender(address);

      const referenceGasPrice = await client.getReferenceGasPrice();
      if (!referenceGasPrice) {
        throw new Error("Failed to get reference gas price");
      }
      tx.setGasPrice(referenceGasPrice);

      const gasCoins = await client.getCoins({
        owner: address,
        coinType: "0x2::sui::SUI",
      });
      if (!gasCoins.data || gasCoins.data.length === 0) {
        throw new Error("Admin has no SUI gas coins");
      }
      const gasCoin =
        gasCoins.data.find(
          (coin) => BigInt(coin.balance) >= BigInt(50000000)
        ) || gasCoins.data[0];
      tx.setGasPayment([
        {
          objectId: gasCoin.coinObjectId,
          version: gasCoin.version,
          digest: gasCoin.digest,
        },
      ]);

      // Get payment coin
      const paymentCoins = await client.getCoins({
        owner: address,
        coinType: "0x2::sui::SUI",
      });

      if (!paymentCoins.data || paymentCoins.data.length === 0) {
        throw new Error("Admin has no SUI coins for payment");
      }

      const paymentCoin =
        paymentCoins.data.find(
          (coin) => BigInt(coin.balance) >= BigInt(priceAmount || 100)
        ) || paymentCoins.data[0];
      if (BigInt(paymentCoin.balance) < BigInt(priceAmount || 100)) {
        throw new Error("Insufficient payment coins");
      }

      // Prepare data
      const imageUrlBytes = Array.from(
        new TextEncoder().encode(nftForm.image_url)
      );
      const attributesArray = nftForm.attributes
        .split(",")
        .map((attr) => attr.trim())
        .filter(Boolean);

      // Call the public fixed price mint function in the package specified by metadata
      // tx.moveCall({
      //   target: `${nftForm.package_id}::hashcase_module::admin_fixed_price_mint_nft`,
      //   arguments: [
      //     tx.object(nftForm.collection_id), // collection object
      //     payment, // payment coin coming from the user's gas
      //     tx.pure.string(nftForm.title),
      //     tx.pure.string(nftForm.description),
      //     tx.pure.vector("u8", imageUrlBytes),
      //     tx.pure.vector("string", attributesArray),
      //     tx.pure.u64(price),
      //   ],
      // });

      tx.moveCall({
        target: `${nftForm.package_id}::hashcase_module::admin_fixed_price_mint_nft`,
        arguments: [
          tx.object(adminCapId), // AdminCap (correct object)
          // tx.object(address),
          tx.object(nftForm.collection_id), // Collection
          tx.object(paymentCoin.coinObjectId), // Payment coin
          tx.pure.string(nftForm.title),
          tx.pure.string(nftForm.description),
          tx.pure.vector("u8", imageUrlBytes),
          tx.pure.vector("string", attributesArray),
          tx.pure.address(address)
        ],
      });

      // Send to the user's wallet for signing and execution
      const txResult = await signAndExecuteTransaction({
        transaction: tx as any,
        chain: "sui:mainnet",
      });

      if (!txResult?.digest) {
        throw new Error("No transaction digest returned");
      }

      // Wait a short while then fetch transaction details
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const digest = txResult.digest;
      await suiClient.waitForTransaction({ digest, timeout: 5_000 });

      const txDetails = await suiClient.getTransactionBlock({
        digest,
        options: { showEvents: true },
      });

      console.log("Transaction Details:", txDetails);
      toast.success("NFT Minted Successfully!");
      return txDetails;
    } catch (error: any) {
      console.error("❌ [PAID MINT] Error:", error?.message || error);
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

      // Require package id explicitly — don't fall back to env/hard-coded value
      const PACKAGE_ID = updateForm?.packageId || updateForm?.package_id;
      if (!PACKAGE_ID) {
        console.error("❌ [UPDATE METADATA] package_id required on updateForm");
        toast.error(
          "Contract package id (package_id) is required to update metadata."
        );
        return null;
      }

      // For now, we'll use a simpler approach without tickets
      // You can implement the ticket system later
      tx.moveCall({
        target: `${PACKAGE_ID}::hashcase_module::update_nft_metadata`,
        arguments: [
          tx.object(updateForm.collectionId),
          tx.object(updateForm.nftId),
          tx.pure.string(updateForm.name || "Updated Name"),
          tx.pure.string(updateForm.description || "Updated Description"),
          tx.pure.vector(
            "u8",
            Array.from(new TextEncoder().encode(updateForm.imageUrl || ""))
          ),
          tx.pure.vector(
            "string",
            updateForm.attributes
              ? updateForm.attributes
                  .split(",")
                  .map((attr: string) => attr.trim())
              : []
          ),
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

      // Require package id on the ticket data; don't fallback to env/hard-coded values
      const ticketPackageId = ticketData?.package_id;
      if (!ticketPackageId) {
        console.error("❌ [CREATE TICKET] package_id required on ticketData");
        toast.error(
          "Contract package id (package_id) is required to create update ticket."
        );
        return null;
      }

      tx.moveCall({
        target: `${ticketPackageId}::hashcase_module::create_update_ticket`,
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
