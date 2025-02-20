"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import React, { useContext } from "react";
import { useZkLogin } from "@mysten/enoki/react";
import { Transaction } from "@mysten/sui/transactions";
import { useSponsorSignAndExecute } from "../../hooks/useSponsorSignandExecute";
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
import axios from "axios";
import axiosInstance from "@/utils/axios";
import WalletConnectionModal from "@/components/WalletConnectionModal";
import {
  claimNftHelper,
  createCollectionHelper,
  dynamicMintNftHelper,
  freeMintNftHelper,
  mintLoyaltyHelper,
  mintSuiLoyaltyHelper,
} from "@/utils/contractHelperFunctions";
import { useSui } from "@/app/hooks/useSui";

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
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();

  const { sponsorSignAndExecute } = useSponsorSignAndExecute();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const { openModal, setOpenModal } = useContext(AppContext);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isMinted, setIsMinted] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loyaltyId, setLoyaltyId] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const [uniqueId, setUniqueId] = useState<string | null>(null);

  const suiClient = useSuiClient();
  // const { suiClient } = useSui();

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

      // console.log(collection_instance);

      const finalNftData = {
        ...metadata_instance,
        collection_name: collection_instance.name,
      };

      setUniqueId(
        `id${metadata_instance.id}collection${collection_instance.id}`
      );

      // console.log(finalNftData);

      setNftData(finalNftData);
    };

    if (params.metadata_id) {
      fetchNFTData();
    }
  }, [params.metadata_id]);

  if (!nftData) {
    return <div>Wrong URL</div>;
  }

  const createDynamicMintNft = async () => {
    const nftForm = {
      collection_id:
        "0x39b9b9eeaff544e9ba514e82482f3ba507b96394ee180ef2926d426eac9e38d6", // Replace with the actual Collection object ID
      title: "Dummy NFT",
      description: "A sample NFT created for testing",
      image_url:
        "https://chocolate-certain-cockroach-300.mypinata.cloud/ipfs/QmNaCTM1E39PrxhPCPPu2uAER6c52HyCwF6bouhVTdsdrF",
      attributes: "rarity: rare, power: 100, edition: first",
    };

    const tx = await dynamicMintNftHelper(nftForm);
    tx.setGasBudget(100000000);
    tx.setSender(currentAccount?.address!);

    const txResult = await signAndExecuteTransaction({
      transaction: tx as any,
      chain: "sui:testnet",
    });

    // console.log(txResult);
    // console.log(txResult.digest);

    const digest = txResult.digest;

    const txDetails = await suiClient.getTransactionBlock({
      digest,
      options: { showEvents: true },
    });

    // console.log(txDetails);

    // console.log("reached the end of the transaction");
  };

  const claimNFT = async () => {
    const claimNFTForm = {
      collection_id:
        "0x39b9b9eeaff544e9ba514e82482f3ba507b96394ee180ef2926d426eac9e38d6", // Replace with the actual Collection object ID
      nft_id:
        "0x4a1c7ee4f21b08edc87834ed22c13967b3979eab7c1e1610f1f77d622b9f980a",
    };

    const tx = await claimNftHelper(claimNFTForm);

    const txResult = await signAndExecuteTransaction({
      transaction: tx as any,
      chain: "sui:testnet",
    });

    // console.log(txResult);

    const digest = txResult.digest;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const txDetails = await suiClient.getTransactionBlock({
      digest,
      options: { showEvents: true },
    });

    // console.log(txDetails);

    // console.log("reached the end of the transaction");
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
            <div className="flex items-center justify-start w-full"></div>
            <div className="flex flex-col gap-4 items-center justify-start my-4 w-full">
              <button
                onClick={createDynamicMintNft}
                className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2"
              >
                Mint the NFT
                <ArrowB />
              </button>
              <button
                onClick={claimNFT}
                className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2"
              >
                Claim the NFT
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
