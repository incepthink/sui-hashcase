"use client";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useParams } from "next/navigation";
import React from "react";

import Link from "next/link";
import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import Heart from "@/assets/images/heart.svg";
import HeartW from "@/assets/images/white_heart.svg";
import Send from "@/assets/images/send-Regular.svg";
import Eye from "@/assets/images/eye_Icon.png";
import { Work_Sans } from "next/font/google";
import { Hash } from "lucide-react";
import { useNftTransactions } from "@/app/hooks/useNftTransactions";

const workSans = Work_Sans({ subsets: ["latin"] });

const NftPage = () => {
  const params = useParams();

  const { claimNFT, updateNftMetadata } = useNftTransactions();

  const handleClaimNft = async (collection_id: string, nftId: string) => {
    await claimNFT(collection_id, nftId);
  };

  const nft_address = (params.nft_address as string) || "";

  const { data: nft, isLoading } = useSuiClientQuery("getObject", {
    id: nft_address,
    options: {
      showContent: true,
    },
  });

  if (isLoading) return <div>Loading</div>;

  const nftData = (nft?.data?.content as any)?.fields;
  console.log(nftData);

  if (!nftData) return <div>Nft data was not found.</div>;

  return (
    <div
      className={`flex flex-col bg-[#00041F] ${workSans.className} min-h-screen`}
    >
      <div className="flex flex-col px-8 md:px-16">
        <Link
          href={`/${nftData.creator}`}
          className="hidden md:flex items-center justify-start gap-x-2 my-4 px-20"
        >
          <ArrowW />
          <p className="text-2xl text-white/70">back</p>
        </Link>
        <div className="my-4 flex flex-col md:flex-row items-center justify-around md:gap-y-0 gap-y-8">
          {/* Replace <img> with Next.js <Image> */}
          <div className="relative h-96 w-full md:w-auto">
            <img
              className="h-96 w-auto"
              src={nftData.image_url}
              alt="nft"
              // className="rounded-lg"
            />
          </div>

          <div className="flex flex-col items-center justify-center w-full md:w-auto">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-white md:text-2xl text-lg">
                  By{" "}
                  <span className="text-[#4DA2FF]">
                    {nftData.creator.slice(0, 10)}...
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
                  <Image src={Eye} alt="eye" width={20} height={20} />
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

            {/* Token Number with Icon */}
            <div className="flex items-center justify-center my-4">
              <div className="flex items-center gap-x-2 bg-[#1E1E1ECC] backdrop-blur-md rounded-full px-4 py-2">
                <Hash className="text-[#4DA2FF]" size={24} />
                <p className="text-white md:text-xl text-lg font-bold">
                  {nftData.id.id.slice(0, 10)}...
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 items-center justify-start my-4 w-full">
              <button
                onClick={() =>
                  handleClaimNft(nftData.collection_id, nftData.id.id)
                }
                className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2 hover:bg-[#f0f0f0] transition-colors duration-300"
              >
                Claim the NFT
                <ArrowB />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftPage;
