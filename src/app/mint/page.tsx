"use client";

import React, { useContext, useState } from "react";
import { useZkLogin } from "@mysten/enoki/react";
import { Transaction } from "@mysten/sui/transactions";
import { useSponsorSignAndExecute } from "../hooks/useSponsorSignandExecute";
import Image from "next/image";
import ArrowW from "../../assets/images/arrowW.svg";
import ArrowB from "../../assets/images/arrowB.svg";
import Heart from "../../assets/images/heart.svg";
import HeartW from "../../assets/images/white_heart.svg";
import Send from "../../assets/images/send-Regular.svg";
import Eye from "../../assets/images/eye_Icon.png";
import Nft from "../../assets/images/nft-image.png";
import { Work_Sans } from "next/font/google";
import Link from "next/link";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import { Bounce, toast } from "react-toastify";
import { AppContext } from "@/context/AppContext";
import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import Modal from "@/components/Modal";
import Logo from "../../assets/icons/sui-sui-logo 1.png";
import SuietLogo from "../../assets/icons/suietlogo.png";
import EyeW from "../../assets/eye-white.svg";
import ZkLogin from "@/components/ZkLogin";
import { ConnectModal as SuietConnectModal } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import Collectable from "@/components/Collectable";
import Footer from "@/components/Footer";

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
  const { sponsorSignAndExecute } = useSponsorSignAndExecute();

  const mintLoyalty = async () => {
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

  const { openModal, setOpenModal } = useContext(AppContext);
  const [showModal, setShowModal] = useState<boolean>(false);
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className={`flex flex-col bg-[#00041F] ${workSans.className}`}>
      <div className="flex flex-col px-8 md:px-16">
        <Link
          href="/"
          className="hidden md:flex items-center justify-start gap-x-2 my-4 px-20"
        >
          <ArrowW />
          <p className="text-2xl text-white/70">back</p>
        </Link>
        <div className="my-4 flex flex-col md:flex-row items-center justify-around md:gap-y-0 gap-y-8">
          <Image src={Nft} alt="nft" />
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-white md:text-2xl text-lg">
                  By <span className="text-[#4DA2FF]">Hashcase</span>
                </p>
              </div>
              <div className="flex items-center justify-center">
                <div className="md:w-8 md:h-8 w-6 h-6 rounded-full bg-[#1E1E1ECC] backdrop-blur-md flex items-center justify-center mr-2">
                  <HeartW />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1E1E1ECC] backdrop-blur-md flex items-center justify-center ml-2">
                  <Send />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-start gap-y-2 my-4 w-full">
              <p className="text-white md:text-4xl text-2xl tracking-wide font-bold">
                VR Visionary by Hashcase
              </p>
              <div className="flex justify-start gap-x-2">
                <div className="flex items-center justify-center gap-x-2">
                  <Image src={Eye} alt="eye" />
                  <p className="text-white/50 md:text-lg text-sm">225 views</p>
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <Heart />
                  <p className="text-white/50 md:text-lg text-sm">
                    100 Favourites
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center my-4">
              <p className="md:text-xl text-sm text-white">
                Introducing &apos;VR Visionary by Hashcase&apos;, an exclusive
                NFT from Hashcase, <br className="hidden md:block" /> the web3
                loyalty innovator. This animated artwork features a girl with a
                VR set, <br className="hidden md:block" />
                representing the future of digital experiences. Join the
                Hashcase community and <br className="hidden md:block" />
                explore the next level of web3 loyalty.
              </p>
            </div>
            <div className="flex items-center justify-start w-full">
              <div className="flex items-center md:w-auto w-full justify-between my-4 bg-[#4DA2FF] backdrop-blur-md rounded-lg px-3 py-3 gap-x-2">
                <div className="flex items-center gap-x-2">
                  <EyeW />
                  <p className="text-white md:text-lg text-sm">
                    Reveal the Content
                  </p>
                </div>
                <ArrowW className="rotate-180 ml-4" />
              </div>
            </div>
            <div className="flex items-center justify-start my-4 w-full">
              <button
                onClick={mintLoyalty}
                className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2"
              >
                Claim to Hashcase Wallet
                <ArrowB />
              </button>
            </div>
          </div>
        </div>
        <hr className="md:m-[100px] m-[20px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        <div className="flex items-center justify-center mt-4 mb-8">
          <div className="bg-[#1A1D35] rounded-lg md:rounded-full p-4 w-full md:text-center text-left text-white md:text-2xl text-lg font-semibold">
            <p>
              The above NFT holds{" "}
              <span className="text-[#4DA2FF]"> 20 loyalty point(s).</span>{" "}
              <br className="hidden md:block" />
              You can receive additional loyalty points from this owner by
              completing the tasks below.
            </p>
          </div>
        </div>
        <p className="text-center md:text-2xl text-lg font-semibold mt-6 mb-4 text-white">
          2 Task
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center w-full md:gap-x-6 gap-x-0 gap-y-4 md:gap-y-0 mt-4 mb-12">
          <div className="bg-[#1A1D35] md:p-6 p-4 w-full flex items-center justify-between">
            <div>
              <p className="md:text-2xl text-lg text-left mb-2 font-semibold capitalize text-white">
                Follow On Twitter
              </p>
              <p className="text-white/50 md:text-lg text-sm mt-2">
                Get 20 Points
              </p>
            </div>
            <div className="flex items-end justify-center">
              <div className="bg-[#FAD64A1A] p-2 rounded-full flex items-center justify-center md:text-lg text-sm text-[#F8924F]">
                Pending
              </div>
            </div>
          </div>
          <div className="bg-[#1A1D35] md:p-6 p-4 w-full flex items-center justify-between">
            <div>
              <p className="md:text-2xl text-lg text-left mb-2 font-semibold capitalize text-white">
                Post A Tweet
              </p>
              <p className="text-white/50 md:text-lg text-sm mt-2">
                Get 20 Points
              </p>
            </div>
            <div className="flex items-end justify-end">
              <div className="bg-[#FAD64A1A] p-2 rounded-full flex items-center justify-center md:text-lg text-sm text-[#F8924F]">
                Pending
              </div>
            </div>
          </div>
        </div>
      </div>
      <Collectable />
      <Footer />
      <Modal openModal={openModal} onClose={() => setOpenModal(false)}>
        <div className="flex flex-col justify-center items-center gap-y-4 my-4 mx-4">
          <ConnectModal
            trigger={
              <button
                className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
                disabled={!!currentAccount}
                onClick={() => setOpenModal(false)}
              >
                {" "}
                <Image src={Logo} alt="Sui Logo" width={20} height={20} />
                {currentAccount ? "Connected" : "Sui Wallet"}
              </button>
            }
            open={open}
            onOpenChange={(isOpen: boolean) => setOpen(isOpen)}
          />
          <SuietConnectModal
            open={showModal}
            onOpenChange={(open: boolean) => setShowModal(open)}
          >
            <button
              onClick={() => setOpenModal(false)}
              className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
            >
              <Image src={SuietLogo} alt="Suiet Logo" width={20} height={20} />
              Suiet Wallet
            </button>
          </SuietConnectModal>
          <ZkLogin setOpenModal={setOpenModal} />
        </div>
      </Modal>
    </div>
  );
};

export default MintPage;
