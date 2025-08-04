"use client";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import Heart from "@/assets/images/heart.svg";
import HeartW from "@/assets/images/white_heart.svg";
import Send from "@/assets/images/send-Regular.svg";
import Eye from "@/assets/images/eye_Icon.png";
import EyeW from "@/assets/eye-white.svg";
import { Work_Sans } from "next/font/google";
import { Hash } from "lucide-react";

import { useNftTransactions } from "@/app/hooks/useNftTransactions";
import axiosInstance from "@/utils/axios";
import Footer from "@/components/Footer";
import UnlockableNft from "./UnlockableNft";
import toast from "react-hot-toast";
import {
  Collection,
  Metadata,
  MetadataInstanceWithMetadataSet,
} from "@/utils/modelTypes";

const workSans = Work_Sans({ subsets: ["latin"] });

const NftPage = () => {
  const params = useParams();

  //needed for the NFT modal to function
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { claimNFT, updateNftMetadata } = useNftTransactions();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [unlockableContent, setUnlockableContent] = useState<string>("");

  const [address, setAddress] = useState("");

  const [upgradeData, setUpgradeData] =
    useState<MetadataInstanceWithMetadataSet | null>(null);

  const handleClaimNft = async (collection_id: string, nftId: string) => {
    try {
      if (!nftData) return;
      // Claim NFT on the blockchain
      await claimNFT(collection_id, nftId);

      // Place the order
      await axiosInstance.post("/user/order/create", {
        collection_id: collection?.id,
        token_id: nftData.token_number,
        address: address,
        status: "order_placed",
      });
    } catch (error) {
      toast.error("Failed to place the order.");
    }
  };

  const handleUpgradeNft = async (collection_id: string, nftId: string) => {
    try {
      if (!nftData || !upgradeData) return;

      const updateForm = {
        name: upgradeData.title!,
        description: upgradeData.description,
        imageUrl: upgradeData.image_url,
        collectionId: collection_id,
        attributes: "super, good",
        nftId: nftId,
      };

      await updateNftMetadata(updateForm);
    } catch (error) {
      toast.error("Failed to upgrade the NFT");
    }
  };

  const nft_address = (params.nft_address as string) || "";

  const { data: nft, isLoading } = useSuiClientQuery("getObject", {
    id: nft_address,
    options: {
      showContent: true,
    },
  });

  const nftData = (nft?.data?.content as any)?.fields;

  // Set collectionAddress only when nftData changes
  useEffect(() => {
    const getUnlockableContentForCollection = async () => {
      if (nftData?.collection_id) {
        const collectionData = await axiosInstance.get(
          "/platform/collection-by-address",
          {
            params: {
              contract_address: nftData.collection_id,
            },
          }
        );
        const { collection_instance } = collectionData.data;

        setCollection(collection_instance);

        setUnlockableContent(collection_instance.contract.unlockable_content);

        const upgrade = await axiosInstance.get("/platform/metadata/next", {
          params: {
            collection_id: collection_instance.id,
            token_id: nftData.token_number,
          },
        });

        setUpgradeData(upgrade.data.metadata_instance);
      }
    };

    getUnlockableContentForCollection();
  }, [nftData]);

  if (isLoading) return <div>Loading</div>;

  if (!nftData) return <div>Nft data was not found.</div>;

  return (
    <div
      className={`flex flex-col bg-[#00041F] ${workSans.className} min-h-screen`}
    >
      <div className="flex flex-col px-8 md:px-16 min-h-[80vh]">
        <Link
          href={`/${nftData.creator}`}
          className="hidden md:flex items-center justify-start gap-x-2 my-4 px-20"
        >
          <ArrowW />
          <p className="text-2xl text-white/70">back</p>
        </Link>

        {/* Token Number with Icon */}
        <div className="flex items-center justify-center my-8">
          <div className="flex items-center gap-x-2 bg-[#1E1E1ECC] backdrop-blur-md rounded-full px-4 py-2">
            <Hash className="text-[#4DA2FF]" size={24} />
            <p className="text-white md:text-xl text-lg font-bold">
              {nftData.id.id}
            </p>
          </div>
        </div>

        <div className="my-4 flex flex-col md:flex-row items-center justify-around md:gap-y-0 gap-y-8">
          {/* Replace <img> with Next.js <Image> */}
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
                    {nftData.creator.slice(0, 10)}...
                  </span>
                </p>
              </div>
              {/* <div className="flex items-center justify-center">
                <div className="md:w-8 md:h-8 w-6 h-6 rounded-full bg-[#1E1E1ECC] backdrop-blur-md flex items-center justify-center mr-2">
                  <HeartW />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1E1E1ECC] backdrop-blur-md flex items-center justify-center ml-2">
                  <Send />
                </div>
              </div> */}
            </div>

            <div className="flex flex-col justify-start gap-y-2 my-4 w-full">
              <p className="text-white md:text-4xl text-2xl tracking-wide font-bold">
                {nftData.name}
              </p>
              <div className="flex justify-start gap-x-2">
                {/* <div className="flex items-center justify-center gap-x-2">
                  <Image src={Eye} alt="eye" width={20} height={20} />
                  <p className="text-white/50 md:text-lg text-sm">225 views</p>
                </div> */}
                {/* <div className="flex items-center justify-center gap-x-2">
                  <Heart />
                  <p className="text-white/50 md:text-lg text-sm">
                    100 Favourites
                  </p>
                </div> */}
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start w-full my-4">
              <p className="md:text-xl text-sm text-white">
                {nftData.description}
              </p>
            </div>

            {unlockableContent && (
              <div className="flex items-center justify-start w-full">
                {/* <div className="flex items-center md:w-auto w-full justify-between my-4 bg-[#4DA2FF] backdrop-blur-md rounded-lg px-3 py-3 gap-x-2">
                  <button
                    onClick={openModal}
                    className="flex items-center gap-x-2"
                  >
                    <EyeW />
                    <p className="text-white md:text-lg text-sm">
                      Reveal the Content
                    </p>
                  </button>
                  <ArrowW className="rotate-180 ml-4" />
                </div> */}
              </div>
            )}

            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-4 text-base bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-white/50 text-white"
              placeholder="Enter the order address"
            />

            <div className="flex flex-col gap-4 items-center md:items-start justify-start my-4 w-full">
              <button
                onClick={() =>
                  handleClaimNft(nftData.collection_id, nftData.id.id)
                }
                className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2 hover:bg-[#f0f0f0] transition-colors duration-300"
              >
                Claim the NFT
                <ArrowB />
              </button>
              {upgradeData?.metadata_set?.isUpgradable && (
                <button
                  onClick={() =>
                    handleUpgradeNft(nftData.collection_id, nftData.id.id)
                  }
                  className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2 hover:bg-[#f0f0f0] transition-colors duration-300"
                >
                  Upgrade the NFT
                  <ArrowB />
                </button>
              )}{" "}
            </div>
          </div>
        </div>
      </div>

      <UnlockableNft
        isOpen={isModalOpen}
        unlockableContent={unlockableContent}
        closeModal={closeModal}
      />
    </div>
  );
};

export default NftPage;
