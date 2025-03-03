"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import React, { useContext } from "react";

import { AppContext } from "@/context/AppContext";

import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import Heart from "@/assets/images/heart.svg";
import HeartW from "@/assets/images/white_heart.svg";
import Send from "@/assets/images/send-Regular.svg";
import Eye from "@/assets/images/eye_Icon.png";
import Nft from "@/assets/nft-token.jpeg";
import { Work_Sans } from "next/font/google";

import { useZkLogin } from "@mysten/enoki/react";
import { Transaction } from "@mysten/sui/transactions";
import { useSponsorSignAndExecute } from "../../hooks/useSponsorSignandExecute";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

import Modal from "@/components/Modal";
import {
  ConnectModal as SuietConnectModal,
  useWallet,
} from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";

import Collectable from "@/components/Collectable";
import Footer from "@/components/Footer";
import axiosInstance from "@/utils/axios";
import WalletConnectionModal from "@/components/WalletConnectionModal";
import { createCollectionHelper } from "@/utils/contractHelperFunctions";

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

export default function NFTPage() {
  const params = useParams();
  const [collectionData, setCollectionData] = useState<Metadata | null>(null);

  const { address } = useZkLogin();
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();

  const { sponsorSignAndExecute } = useSponsorSignAndExecute();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const { openModal, setOpenModal } = useContext(AppContext);

  const suiClient = useSuiClient();

  useEffect(() => {
    const fetchNFTData = async () => {
      const collectionData = await axiosInstance.get("/platform/collection", {
        params: {
          collection_id: params.collection_id,
        },
      });
      const { collection_instance } = collectionData.data;

      // console.log(collection_instance);

      //   setUniqueId(
      //     `id${metadata_instance.id}collection${collection_instance.id}`
      //   );

      // console.log(collection_instance);

      setCollectionData(collection_instance);
    };

    if (params.collection_id) {
      fetchNFTData();
    }
  }, [params.collection_id]);

  if (!collectionData) {
    return <div>Wrong URL</div>;
  }

  const createCollection = async () => {
    const collectionForm = {
      ownerCapId:
        "0xc0a04fd974e9719c0cdf8b909faa6789897e599f9c493b140455bff766d4780c", // Replace with a real object ID
      collectionName: "Test Collection",
      collectionDescription: "A sample NFT collection for testing",
      mintType: "0", // Assuming 1 represents a specific mint type
      baseMintPrice: "1000", // Price in smallest unit (e.g., wei)
      isOpenEdition: true,
      maxSupply: 500, // Max NFTs that can be minted
      isDynamic: true,
      isClaimable: true,
      baseImageUrl:
        "https://example.com/image.pnhttps://chocolate-certain-cockroach-300.mypinata.cloud/ipfs/QmNaCTM1E39PrxhPCPPu2uAER6c52HyCwF6bouhVTdsdrFg",
      baseAttributes: "color: red, size: large, rarity: rare",
    };

    const tx = await createCollectionHelper(collectionForm);

    await signAndExecuteTransaction({
      transaction: tx as any,
      chain: "sui:testnet",
    });

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
            src={collectionData.image_url}
            alt="nft"
            // className="rounded-lg"
          />

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-white md:text-2xl text-lg">
                  By{" "}
                  <span className="text-[#4DA2FF]">
                    {collectionData.collection_name}
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
                {collectionData.name}
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
                {collectionData.description}
              </p>
            </div>
            <div className="flex items-center justify-start w-full">
              <div className="flex items-center md:w-auto w-full justify-between my-4 bg-[#4DA2FF] backdrop-blur-md rounded-lg px-3 py-3 gap-x-2">
                <ArrowW className="rotate-180 ml-4" />
              </div>
            </div>
            <div className="flex items-center justify-start my-4 w-full">
              <button
                onClick={createCollection}
                className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2"
              >
                Deploy the Collection
                <ArrowB />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-start my-4 w-full"></div>
      </div>

      <Footer />
      <Modal
        context="Connect Your Wallet"
        openModal={openModal}
        onClose={() => setOpenModal(false)}
      >
        <div className="flex flex-col justify-center items-center gap-y-4 my-4 mx-4">
          <WalletConnectionModal />
        </div>
      </Modal>
    </div>
  );
}
