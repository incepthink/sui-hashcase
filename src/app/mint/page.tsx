"use client";

import React, { useContext, useState } from "react";
import { useZkLogin } from "@mysten/enoki/react";
import { Transaction } from "@mysten/sui/transactions";
import { useSponsorSignAndExecute } from "../hooks/useSponsorSignandExecute";
import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import Heart from "@/assets/images/heart.svg";
import HeartW from "@/assets/images/white_heart.svg";
import Send from "@/assets/images/send-Regular.svg";
import Eye from "@/assets/images/eye_Icon.png";
import Nft from "@/assets/nft-token.jpeg";
import { Work_Sans } from "next/font/google";
import Link from "next/link";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import { Bounce, toast } from "react-toastify";
import { AppContext } from "@/context/AppContext";
import {
  ConnectModal,
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import Modal from "@/components/Modal";
import Logo from "@/assets/icons/sui-sui-logo 1.png";
import SuietLogo from "@/assets/icons/suietlogo.png";
import EyeW from "@/assets/eye-white.svg";
import ZkLogin from "@/components/ZkLogin";
import {
  ConnectModal as SuietConnectModal,
  useWallet,
} from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import Collectable from "@/components/Collectable";
import Footer from "@/components/Footer";
import WalletConnectionModal from "@/components/WalletConnectionModal";

const workSans = Work_Sans({ subsets: ["latin"] });

// const tx2 = new Transaction();
// tx2.moveCall({
//   target: `${testnet_loyalty!}::loyalty_card::update_loyalty_points`,
//   arguments: [tx.object(loyaltyId), tx.pure.u64(20)],
// });
// tx2.setSender(address!);
// const resp2 = await sponsorSignAndExecute({
//   tx: tx2,
//   options: { showObjectChanges: true, showEffects: true },
// });
// console.log("Updated loyalty points");
// console.log(resp2!.objectChanges);

const testnet_loyalty =
  process.env.TESTNET_LOYALTY_PACKAGE_ID ||
  "0xb92dbbdb90ea755f8ea371d3e4658687fc4a1e9f6b13264e358c7d27da7514a7";

const MintPage = () => {
  const { address } = useZkLogin();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const { sponsorSignAndExecute } = useSponsorSignAndExecute();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const suiClient = useSuiClient();
  const mintLoyalty = async () => {
    if (!address) {
      toast.error("Please connect your wallet first", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const notifyId = notifyPromise("Minting loyalty...", "info");
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
      notifyResolve(notifyId, "Minted new loyalty", "success");
      console.log("Minted new loyalty, check the response");
      console.log(resp!.objectChanges);
      const createdLoyalty = resp!.objectChanges?.find(
        ({ type, objectType }: any) =>
          type === "created" &&
          objectType === `${testnet_loyalty!}::loyalty_card::Loyalty`
      );
      if (!createdLoyalty) {
        notifyResolve(
          notifyId,
          "Could not find loyalty in created objects",
          "error"
        );
        console.log("Could not find loyalty in created objects");
        throw new Error("Error minting new loyalty");
      }
      const loyaltyId = (createdLoyalty as any)?.objectId;
      setLoyaltyId(loyaltyId);
      console.log("Loyalty ID: ", loyaltyId);
      toast(
        <div
          onClick={() =>
            window.open(
              `https://suiscan.xyz/testnet/object/${loyaltyId}`,
              "_blank"
            )
          }
        >
          Click to view loyalty on Suiscan
        </div>,
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        }
      );
    } catch (error) {
      notifyResolve(notifyId, "Error minting loyalty", "error");
      console.error("Error minting loyalty:", error);
    }
  };

  const mintSuiLoyalty = async () => {
    if (!currentAccount) {
      toast.error("Please connect your wallet first", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const notifyId = notifyPromise("Minting loyalty...", "info");
    console.log("Minting loyalty...");

    const tx = new Transaction();
    tx.moveCall({
      target: `${testnet_loyalty!}::loyalty_card::mint_loyalty`,
      arguments: [
        tx.pure.address(currentAccount.address),
        tx.pure.u64(Date.now()),
      ],
    });
    tx.setSender(address!);

    try {
      await signAndExecuteTransaction({
        transaction: tx as any,
        chain: "sui:testnet",
      });
      notifyResolve(notifyId, "Minted new loyalty", "success");
      toast(
        <div
          onClick={() =>
            window.open(
              `https://suiscan.xyz/account/object/${currentAccount.address}`,
              "_blank"
            )
          }
        >
          Click to view loyalty on Suiscan
        </div>,
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        }
      );
    } catch (error) {
      notifyResolve(notifyId, "Error minting loyalty", "error");
      console.error("Error minting loyalty:", error);
    }
  };

  const handleClaimNFT = () => {
    if (address) {
      mintLoyalty();
    } else if (currentAccount) {
      mintSuiLoyalty();
    }
  };

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loyaltyId, setLoyaltyId] = useState<string>("");

  const handleReveal = async () => {
    let hashcaseData = [];
    try {
      const { data } = await suiClient.getOwnedObjects({
        owner: currentAccount?.address || address || "",
        filter: {
          StructType:
            "0xb92dbbdb90ea755f8ea371d3e4658687fc4a1e9f6b13264e358c7d27da7514a7::loyalty_card::Loyalty",
        },
        options: {
          showDisplay: true,
          showContent: true,
          showType: true,
        },
      });
      if (data) {
        hashcaseData = data;
      }
    } catch (error) {
      toast.error("Error in Fetching NFT", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.log(error);
    }
    if (hashcaseData.length > 0) {
      setIsUnlocked(true);
    } else {
      toast.error("You need to mint this NFT first!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <div className={`flex flex-col bg-[#00041F] min-h-screen ${workSans.className}`}>
      <div className="container mx-auto px-6 md:px-8 py-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
        >
          <ArrowW />
          <span className="text-lg">Back</span>
        </Link>

        {/* Main content */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* NFT Image */}
          <div className="flex justify-center">
            <Image
              src={Nft}
              alt="HashCase Sui Loyalty NFT"
              className="w-full max-w-md rounded-lg shadow-lg"
            />
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white text-lg">
                  By <span className="text-[#4DA2FF] font-semibold">Hashcase</span>
                </p>
              </div>
              
              <h1 className="text-white text-3xl md:text-4xl font-bold">
                HashCase Sui Loyalty NFT
              </h1>
              
              <p className="text-white/70 text-lg leading-relaxed">
                This is a NFT Loyalty Card which executes onchain loyalty using Hashcase and Sui infrastructure.
              </p>
            </div>

            {/* Claim button */}
            <div className="pt-4">
              <button
                onClick={handleClaimNFT}
                className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
              >
                Claim to Hashcase Wallet
                <ArrowB />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-16">
          <hr className="border-white/20" />
        </div>

        {/* Loyalty info */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/10">
            <p className="text-white text-lg md:text-xl text-center">
              The above NFT holds{" "}
              <span className="text-[#4DA2FF] font-semibold">20 loyalty point(s).</span>{" "}
              You can receive additional loyalty points from this owner by completing the tasks below.
            </p>
          </div>
        </div>

        {/* Tasks */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-white text-2xl font-semibold text-center mb-8">
            2 Tasks
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-white text-xl font-semibold">
                    Follow On Twitter
                  </h3>
                  <p className="text-white/60 text-sm">
                    Get 20 Points
                  </p>
                </div>
                <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium">
                  Pending
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-white text-xl font-semibold">
                    Post A Tweet
                  </h3>
                  <p className="text-white/60 text-sm">
                    Get 20 Points
                  </p>
                </div>
                <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium">
                  Pending
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Collectable />
      
      <Modal
        context="Unlockable Content"
        openModal={isUnlocked}
        onClose={() => setIsUnlocked(false)}
      >
        <div className="flex flex-col justify-center items-center gap-y-4 my-4 mx-4">
          <Link
            href={`https://suiscan.xyz/testnet/object/${loyaltyId}`}
            target="_blank"
            className="bg-white border-black/20 px-3 py-2 text-black hover:text-blue-500 font-semibold rounded-full w-full overflow-hidden text-ellipsis whitespace-nowrap"
          >
            https://suiscan.xyz/testnet/object/...
          </Link>
        </div>
      </Modal>
    </div>
  );
};

export default MintPage;
