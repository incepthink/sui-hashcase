"use client";

import React from "react";
import { useZkLogin } from "@mysten/enoki/react";
import { Transaction } from "@mysten/sui/transactions";
import { useSponsorSignAndExecute } from "../hooks/useSponsorSignandExecute";

export const TESTNET_LOYALTY_PACKAGE_ID = "0x3917b73a25d0160ce7a40b8cbaa9f560124f4593c2e419094b019a4267ef74ad";

const MintPage = () => {
  const { address } = useZkLogin();
  const { sponsorSignAndExecute } = useSponsorSignAndExecute();

  const mintLoyalty = async () => {
    console.log("Minting loyalty...");

    const tx = new Transaction();
    tx.moveCall({
      target: `${TESTNET_LOYALTY_PACKAGE_ID}::loyalty_card::mint_loyalty`,
      arguments: [tx.pure.address(address!), tx.pure.u64(Date.now())],
    });
    tx.setSender(address!);

    try {
      const resp = await sponsorSignAndExecute({
        tx,
        options: { showObjectChanges: true, showEffects: true },
      });

      console.log("Minted new loyalty, check the response");
      console.log(resp!.objectChanges);
      const createdLoyalty = resp!.objectChanges?.find(
        ({ type, objectType }: any) =>
          type === "created" &&
          objectType ===
            `${TESTNET_LOYALTY_PACKAGE_ID}::loyalty_card::Loyalty`
      );
      if (!createdLoyalty) {
        console.log("Could not find loyalty in created objects");
        throw new Error("Error minting new loyalty");
      }
      const loyaltyId = (createdLoyalty as any)?.objectId;
      console.log("Loyalty ID: ", loyaltyId);
    } catch (error) {
      console.error("Error minting loyalty:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#00041F]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Mint</h1>
        <button 
          onClick={mintLoyalty}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Mint Loyalty
        </button>
      </div>
    </div>
  );
};

export default MintPage;