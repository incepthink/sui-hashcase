import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";

import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { toast } from "react-hot-toast";

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
    "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84";

  const freeMintNft = async (nftForm: MintingForm) => {
    if (!nftForm.collection_id) {
      toast.error("Please fill in all fields.");
      return;
    }

    console.log(nftForm);
    console.log(packageId);

    setIsLoading(true);

    let txResult;
    try {
      const tx = new Transaction();
      const imageUrlBytes = Array.from(
        new TextEncoder().encode(nftForm.image_url)
      );

      const attributesArray = nftForm.attributes
        .split(",")
        .map((attr: string) => attr.trim())
        .filter(Boolean);

      tx.moveCall({
        target: `${packageId}::hashcase_module::free_mint_nft`,
        arguments: [
          // Collection object from which the NFT is minted
          tx.object(nftForm.collection_id),
          // tx.object(Inputs.ObjectRef({ digest, objectId, version })),
          tx.pure.string(nftForm.title),
          tx.pure.string(nftForm.description),
          tx.pure.vector("u8", imageUrlBytes),
          tx.pure.vector("string", attributesArray),
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

  const claimNFT = async (collection_id: string, nft_id: string) => {
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

  const updateNftMetadata = async (collection_id: string, nft_id: string) => {
    if (!collection_id || !nft_id) {
      toast.error("Please fill in all fields.");
      return;
    }

    const updateForm = {
      name: "new name",
      description: "new description",
      imageUrl: "someImageUrl",
      attributes: "very,good,extra,special",
      collectionId: collection_id,
      nftId: nft_id,
    };

    console.log("THIS IS THE UPDATE FORM WE WANT TO SET THE NEW DATA TO");
    console.log(updateForm);

    setIsLoading(true);

    let txResult;
    try {
      const tx = new Transaction();
      const imageUrlBytes = Array.from(
        new TextEncoder().encode(updateForm.imageUrl)
      );
      const attributesArray = updateForm.attributes
        .split(",")
        .map((attr) => attr.trim())
        .filter(Boolean);

      tx.moveCall({
        target: `${packageId}::hashcase_module::update_nft_metadata`,
        arguments: [
          tx.object(updateForm.collectionId),
          tx.object(updateForm.nftId),
          tx.pure.string(updateForm.name),
          tx.pure.string(updateForm.description),
          tx.pure.vector("u8", imageUrlBytes),
          tx.pure.vector("string", attributesArray),
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
      toast.success("NFT Metadata Changed Successfully!");
      return txDetails;
    } catch (error) {
      console.error("Error executing transaction:", error);
      toast.error("Failed to change NFT Metadata.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    freeMintNft,
    claimNFT,
    updateNftMetadata,
  };
};
