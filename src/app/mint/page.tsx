"use client";

import React from "react";
import { useZkLogin } from "@mysten/enoki/react";
import { Transaction } from "@mysten/sui/transactions";
import { useSponsorSignAndExecute } from "../hooks/useSponsorSignandExecute";
import Image from "next/image";
import ArrowW from "../../assets/images/arrowW.svg";
import ArrowB from "../../assets/images/arrowB.svg";
import Heart from "../../assets/images/heart.svg";
import HeartW from "../../assets/images/white_heart.svg";
import Send from "../../assets/images/send-Regular.svg";
import Bitscrunch from "../../assets/images/bitscrunch_logo.png";
import Eye from "../../assets/images/eye_Icon.png";
import Nft from "../../assets/images/nft-image.png";
import { Work_Sans } from "next/font/google";
import Link from "next/link";

const workSans = Work_Sans({ subsets: ["latin"] });

const testnet_loyalty =
  process.env.TESTNET_LOYALTY_PACKAGE_ID ||
  "0x3917b73a25d0160ce7a40b8cbaa9f560124f4593c2e419094b019a4267ef74ad";

const MintPage = () => {
  const { address } = useZkLogin();
  const { sponsorSignAndExecute } = useSponsorSignAndExecute();

  const mintLoyalty = async () => {
    console.log("Minting loyalty...");

    const tx = new Transaction();
    tx.moveCall({
      target: `${testnet_loyalty!}::loyalty_card::mint_loyalty`,
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
          objectType === `${testnet_loyalty!}::loyalty_card::Loyalty`
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
    <div
      className={`flex flex-col h-screen bg-[#00041F] px-16 ${workSans.className}`}
    >
      <Link
        href="/"
        className="flex items-center justify-start gap-x-2 my-4 px-20"
      >
        <ArrowW />
        <p className="text-2xl text-white/70">back</p>
      </Link>
      <div className="my-4 flex items-center justify-around">
        <Image src={Nft} alt="nft" />
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-white text-2xl">
                By <span className="text-[#4DA2FF]">Hashcase</span>
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#1E1E1ECC] backdrop-blur-md flex items-center justify-center mr-2">
                <HeartW />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1E1E1ECC] backdrop-blur-md flex items-center justify-center ml-2">
                <Send />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-start gap-y-2 my-4 w-full">
            <p className="text-white text-4xl tracking-wide">
              VR Visionary by Hashcase
            </p>
            <div className="flex justify-start gap-x-2">
              <div className="flex items-center justify-center gap-x-2">
                <Image src={Eye} alt="eye" />
                <p className="text-white/50 text-lg">225 views</p>
              </div>
              <div className="flex items-center justify-center gap-x-2">
                <Heart />
                <p className="text-white/50 text-lg">100 Favourites</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center my-4">
            <p className="text-xl text-white">
              Introducing &apos;VR Visionary by Hashcase&apos;, an exclusive NFT
              from Hashcase, <br /> the web3 loyalty innovator. This animated
              artwork features a girl with a VR set, <br /> representing the
              future of digital experiences. Join the Hashcase community and{" "}
              <br />
              explore the next level of web3 loyalty.
            </p>
          </div>
          <div className="flex items-center justify-start w-full">
            <div className="flex items-center my-4 bg-[#1A1D35] backdrop-blur-md rounded-lg px-3 py-3 gap-x-2">
              <Image src={Bitscrunch} alt="bitscrunch" />
              <p className="text-white/50 text-lg">
                Statistics Powered By{" "}
                <span className="text-white">Bitscrunch</span>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-start my-4 w-full">
            <button
              onClick={mintLoyalty}
              className="px-6 py-3 rounded-full text-xl bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2"
            >
              Claim to Hashcase Wallet
              <ArrowB />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintPage;
