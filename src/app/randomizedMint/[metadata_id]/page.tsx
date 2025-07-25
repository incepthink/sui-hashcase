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

import { useZkLogin } from "@mysten/enoki/react";

import { useSponsorSignAndExecute } from "../../hooks/useSponsorSignandExecute";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

import Collectable from "@/components/Collectable";
import Footer from "@/components/Footer";
import WalletConnectionModal from "@/components/WalletConnectionModal";

import axiosInstance from "@/utils/axios";
import { claimNftHelper } from "@/utils/contractHelperFunctions";
import { useNftTransactions } from "@/app/hooks/useNftTransactions";
import UnlockableNft from "./UnlockableNft";
import MintSuccessModal from "./MintSuccessModal";

import Slider from "react-slick"; // For carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  EmittedNFTInfo,
  Metadata,
  MetadataSetWithAllMetadataInstances,
} from "@/utils/modelTypes";

const workSans = Work_Sans({ subsets: ["latin"] });

const testnet_loyalty =
  process.env.TESTNET_LOYALTY_PACKAGE_ID ||
  "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";

export default function NFTPage() {
  const params = useParams();
  const [nftData, setNftData] = useState<Metadata | null>(null);

  const [metadataSet, setMetadataSet] =
    useState<MetadataSetWithAllMetadataInstances | null>(null);

  const [selectedMetadata, setSelectedMetadata] = useState<Metadata | null>(
    null
  );

  // states for the modal for showing minting success
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  //needed for the NFT modal to function
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { address } = useZkLogin();
  const { sponsorSignAndExecute } = useSponsorSignAndExecute();

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  const { freeMintNft } = useNftTransactions();

  useEffect(() => {
    const fetchNFTData = async () => {
      const metadata_set = await axiosInstance.get(
        "/platform/metadata-set/by-id",
        {
          params: {
            metadata_set_id: params.metadata_id,
          },
        }
      );

      console.log("METADATA SET");
      console.log(metadata_set.data.metadataSet);

      setMetadataSet(metadata_set.data.metadataSet);
    };

    if (params.metadata_id) {
      fetchNFTData();
    }
  }, [params.metadata_id]);

  const createFreeMintNft = async () => {
    if (!metadataSet) return;

    const notifyId = notifyPromise("Minting NFT...", "info");

    try {
      const randomNum = Math.floor(Math.random() * 1000);
      const selectedMetadata = randomNum % metadataSet?.metadata?.length;

      console.log(metadataSet);

      const nftData = metadataSet?.metadata[selectedMetadata];

      setSelectedMetadata(nftData);

      console.log(nftData);

      const nftForm = {
        collection_id: metadataSet?.Collection.contract.contract_address || "", // Replace with the actual Collection object ID
        title: nftData.title,
        description: nftData.description,
        image_url: nftData.image_url,
        attributes: nftData.attributes || "",
        price: null,
      };

      console.log(nftForm);

      const txDetails = await freeMintNft(nftForm);
      // console.log(txDetails);

      if (!txDetails?.events?.length) {
        throw new Error("No events found in transaction details.");
      }

      const emittedNFTsInformation = txDetails.events[0]
        ?.parsedJson as EmittedNFTInfo;

      if (!emittedNFTsInformation) {
        throw new Error("Invalid NFT data structure in transaction details.");
      }

      const { collection_id, mint_price, nft_id, token_number } =
        emittedNFTsInformation;

      const itemToAdd = {
        name: nftData.title,
        description: nftData.description,
        image_uri: nftData.image_url,
        collection_id: nftData.collection_id,
        token_id: parseInt(token_number),
        metadata_id: nftData.id,
        type: "buyandclaim",
        attributes: nftData.attributes || "",
      };

      //sending the request to add the item
      const itemResponse = await axiosInstance.post("/user/item/create", {
        item: itemToAdd,
      });

      // Show success modal
      setShowSuccessModal(true);

      notifyResolve(notifyId, "NFT Minted", "success");
    } catch (error) {
      notifyResolve(notifyId, "Error minting NFT", "error");
      console.error("Error minting NFT:", error);
    }

    // console.log(itemResponse);
  };

  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: true,
  };

  if (!metadataSet) {
    return <div className="h-screen w-screen text-center">Loading</div>;
  }

  return (
    <div className={`flex flex-col bg-[#00041F] ${workSans.className}`}>
      <div className="flex flex-col px-8 md:px-16">
        <Link
          href="/collections"
          className="hidden md:flex items-center justify-start gap-x-2 my-4 px-20"
        >
          <ArrowW />
          <p className="text-2xl text-white/70">back</p>
        </Link>

        {/* Metadata Set Info Section */}
        <div className="my-4 flex flex-col md:flex-row items-center justify-around md:gap-y-0 gap-y-8">
          {/* Carousel for Metadata Images */}

          <div className="w-full md:w-1/2">
            <Slider {...sliderSettings}>
              {metadataSet?.metadata?.map((item) => (
                <div key={item.id} className="px-2">
                  <img
                    className="w-full h-96 object-contain"
                    src={item.image_url || "/default-nft.png"}
                    alt={item.title}
                  />
                </div>
              ))}
            </Slider>
          </div>

          <div>
            {metadataSet?.metadata?.map((item) => (
              <div key={item.id}>{item.title}</div>
            ))}
          </div>

          {/* Metadata Set Details */}
          <div className="flex flex-col items-center justify-center w-full md:w-1/2">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-white md:text-2xl text-lg">
                  Set:{" "}
                  <span className="text-[#4DA2FF]">{metadataSet.name}</span>
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
                {metadataSet.name}
              </p>
              <div className="flex justify-start gap-x-2">
                <div className="flex items-center justify-center gap-x-2">
                  <Image src={Eye} alt="eye" />
                  <p className="text-white/50 md:text-lg text-sm">
                    Randomized: {metadataSet.isRandomized ? "Yes" : "No"}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <Heart />
                  <p className="text-white/50 md:text-lg text-sm">
                    Upgradable: {metadataSet.isUpgradable ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-start w-full">
              <div className="flex flex-col flex-wrap gap-2">
                {metadataSet?.metadata?.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1A1D35] py-3 px-24 rounded-lg"
                  >
                    <p className="text-white font-medium">{item.title}</p>
                    {item.latitude && item.longitude && (
                      <p className="text-white/50 text-sm">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-start w-full my-4">
              <div className="flex items-center md:w-auto w-full justify-between my-4 backdrop-blur-md rounded-lg px-3 py-3 gap-x-2">
                <button
                  onClick={createFreeMintNft}
                  className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2"
                >
                  Mint Random NFT &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UnlockableNft isOpen={isModalOpen} closeModal={closeModal} />
      {showSuccessModal && selectedMetadata && (
        <MintSuccessModal
          onClose={() => setShowSuccessModal(false)}
          nftData={selectedMetadata}
        />
      )}
    </div>
  );
}
