"use client";

import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import Heart from "@/assets/images/heart.svg";
import HeartW from "@/assets/images/white_heart.svg";
import Send from "@/assets/images/send-Regular.svg";
import Eye from "@/assets/images/eye_Icon.png";
import Nft from "@/assets/nft-token.jpeg";
import { Work_Sans } from "next/font/google";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import { Bounce, toast } from "react-toastify";
import EyeW from "@/assets/eye-white.svg";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import React, { useContext } from "react";
import Link from "next/link";

import { AppContext } from "@/context/AppContext";
import { useZkLogin } from "@mysten/enoki/react";
import { Transaction } from "@mysten/sui/transactions";

import { useSponsorSignAndExecute } from "../../hooks/useSponsorSignandExecute";

import {
  ConnectModal,
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import Modal from "@/components/Modal";
import ZkLogin from "@/components/ZkLogin";

import Collectable from "@/components/Collectable";
import Footer from "@/components/Footer";
import WalletConnectionModal from "@/components/WalletConnectionModal";

import axiosInstance from "@/utils/axios";
import {
  mintLoyaltyHelper,
  mintSuiLoyaltyHelper,
} from "@/utils/contractHelperFunctions";

interface Metadata {
  id: string;
  title: string;
  name: string;
  description: string;
  animation_url: string;
  image_url: string;
  collection_id: number;
  token_uri: string;
  attributes?: string;
  collection_name: string;
}

const workSans = Work_Sans({ subsets: ["latin"] });

const testnet_loyalty =
  process.env.TESTNET_LOYALTY_PACKAGE_ID ||
  "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";

export default function NFTPage() {
  const params = useParams();
  const [nftData, setNftData] = useState<Metadata | null>(null);

  const { address } = useZkLogin();
  const currentAccount = useCurrentAccount();

  const { sponsorSignAndExecute } = useSponsorSignAndExecute();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [isMinted, setIsMinted] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loyaltyId, setLoyaltyId] = useState<string>("");

  const [uniqueId, setUniqueId] = useState<string | null>(null);

  const suiClient = useSuiClient();

  useEffect(() => {
    const fetchNFTData = async () => {
      const itemData = await axiosInstance.get("/platform/metadata/by-id", {
        params: {
          metadata_id: params.metadata_id,
        },
      });

      const { metadata_instance } = itemData.data;

      const collectionData = await axiosInstance.get("/platform/collection", {
        params: {
          collection_id: metadata_instance.collection_id,
        },
      });

      const { collection_instance } = collectionData.data;

      console.log(collection_instance);

      const finalNftData = {
        ...metadata_instance,
        collection_name: collection_instance.name,
      };

      setUniqueId(
        `id${metadata_instance.id}collection${collection_instance.id}`
      );

      setNftData(finalNftData);
    };

    if (params.metadata_id) {
      fetchNFTData();
    }
  }, [params.metadata_id]);

  if (!nftData) {
    return <div>Wrong URL</div>;
  }

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

    const tx = await mintLoyaltyHelper(address, uniqueId, nftData.image_url);
    console.log(tx);

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
          objectType ===
            `0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49::loyalty_card::Loyalty`
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
      setIsMinted(true);
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

    const tx = await mintSuiLoyaltyHelper(
      currentAccount.address,
      uniqueId,
      nftData.image_url
    );

    try {
      await signAndExecuteTransaction({
        transaction: tx as any,
        chain: "sui:testnet",
      });
      notifyResolve(notifyId, "Minted new loyalty", "success");
      console.log("Minted new loyalty, check the response");
      toast(
        <div
          onClick={() =>
            window.open(
              `https://suiscan.xyz/testnet/account/${currentAccount.address}`,
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
      setIsMinted(true);
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

  const handleReveal = async () => {
    let hashcaseData = false;
    try {
      const { data } = await suiClient.getOwnedObjects({
        owner: currentAccount?.address || address || "",
        filter: {
          StructType:
            "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49::loyalty_card::Loyalty",
        },
        options: {
          showDisplay: true,
          showContent: true,
          showType: true,
        },
      });

      // console.log(data);
      // return;

      if (data) {
        const nids =
          data
            ?.filter((item: any) => item?.data?.content?.fields?.nId)
            .map((item: any) => item.data.content.fields.nId) || [];
        if (nids.includes(uniqueId)) {
          hashcaseData = true;
        }
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
    if (hashcaseData) {
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
          <img
            className="h-96 w-auto"
            src={nftData.image_url}
            alt="nft"
            // className="rounded-lg"
          />

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-white md:text-2xl text-lg">
                  By{" "}
                  <span className="text-[#4DA2FF]">
                    {nftData.collection_name}
                  </span>
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
                {nftData.name}
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
                {nftData.description}
              </p>
            </div>
            <div className="flex items-center justify-start w-full">
              <div className="flex items-center md:w-auto w-full justify-between my-4 bg-[#4DA2FF] backdrop-blur-md rounded-lg px-3 py-3 gap-x-2">
                <button
                  onClick={handleReveal}
                  className="flex items-center gap-x-2"
                >
                  <EyeW />
                  <p className="text-white md:text-lg text-sm">
                    Reveal the Content
                  </p>
                </button>
                <ArrowW className="rotate-180 ml-4" />
              </div>
            </div>
            <div className="flex items-center justify-start my-4 w-full">
              <button
                onClick={handleClaimNFT}
                className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2"
              >
                Claim to Hashcase Wallet
                <ArrowB />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-start my-4 w-full"></div>

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
      <WalletConnectionModal />

      <Collectable />
      <Footer />
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
}
