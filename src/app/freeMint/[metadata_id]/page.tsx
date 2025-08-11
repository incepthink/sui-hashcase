"use client";

import Image from "next/image";
import ArrowW from "@/assets/images/arrowW.svg";
import ArrowB from "@/assets/images/arrowB.svg";
import Eye from "@/assets/images/eye_Icon.png";
import { Work_Sans } from "next/font/google";
import notify, { notifyPromise, notifyResolve } from "@/utils/notify";
import EyeW from "@/assets/eye-white.svg";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";

import { useZkLogin } from "@mysten/enoki/react";

import { useSponsorSignAndExecute } from "../../hooks/useSponsorSignandExecute";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

import axiosInstance from "@/utils/axios";
import axios from "axios";
import UnlockableNft from "./UnlockableNft";
import MintSuccessModal from "./MintSuccessModal";
import { useGlobalAppStore } from "@/store/globalAppStore";

import {
  Globe,
  MapPin,
  RefreshCw,
  ArrowLeft,
  MapPinOff,
  Compass,
} from "lucide-react";

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
  collection_name?: string;
  collection_address?: string;
  latitude?: string;
  longitude?: string;
}

interface EmittedNFTInfo {
  collection_id: string;
  creator: string;
  mint_price: string;
  nft_id: string;
  recipient: string;
  token_number: string;
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

const workSans = Work_Sans({ subsets: ["latin"] });

const mainnet_loyalty =
  process.env.MAINNET_LOYALTY_PACKAGE_ID ||
  "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";

export default function NFTPage() {
  const params = useParams();
  const [nftData, setNftData] = useState<Metadata | null>(null);

  const [isLocked, setIsLocked] = useState(true);
  const [location, setLocation] = useState<Coordinates>({
    latitude: -1,
    longitude: -1,
  });

  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);

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

  const { userWalletAddress } = useGlobalAppStore();

  useEffect(() => {
    if (params.metadata_id) {
      fetchNFTData();
    }
  }, [params.metadata_id, location]);

  const fetchNFTData = async () => {
    try {
      const locationPermission = await checkLocationPermissions();

      if (locationPermission == true) {
        const itemData = await axiosInstance.get(
          "/platform/metadata/geofenced-by-id",
          {
            params: {
              metadata_id: params.metadata_id,
              user_lat: location.latitude,
              user_lon: location.longitude,
            },
          }
        );

        const { metadata_instance } = itemData.data;

        console.log("THIS IS METADATA INSTANCE");
        console.log(metadata_instance);

        if (metadata_instance == null) {
          setIsLocked(true);
        } else {
          const finalNftData = {
            ...metadata_instance,
            collection_id: metadata_instance.collection.id,
            collection_name: metadata_instance.collection.name,
            collection_address:
              metadata_instance?.collection?.contract?.contract_address,
          };

          console.log("FINAL NFT DTA");
          console.log(finalNftData);

          setIsLocked(false);
          setNftData(finalNftData);
        }
      } else {
        const itemData = await axiosInstance.get(
          "/platform/metadata/geofenced-by-id",
          {
            params: {
              metadata_id: params.metadata_id,
            },
          }
        );

        const { metadata_instance } = itemData.data;
        console.log(metadata_instance);

        console.log("THIS IS METADATA INSTANCE");
        console.log(metadata_instance);

        if (metadata_instance == null) {
          setIsLocked(true);
        } else {
          const finalNftData = {
            ...metadata_instance,
            collection_id: metadata_instance.collection.id,
            collection_name: metadata_instance.collection.name,
            collection_address:
              metadata_instance?.collection?.contract?.contract_address,
          };

          setIsLocked(false);
          setNftData(finalNftData);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkLocationPermissions = async () => {
    try {
      if (!navigator.permissions) {
        return false;
      }

      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });

      return permissionStatus.state === "granted";
    } catch (error) {
      console.error("Error checking location permissions:", error);
      return false;
    }
  };

  function getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error: GeolocationPositionError) => {
          reject(error);
        }
      );
    });
  }

  const handleGetCurrentPositionAndPageRefresh = async () => {
    try {
      const currentLocation = await getCurrentPosition();
      setLocation(currentLocation);
      await fetchNFTData();
    } catch (error) {
      console.error(error);
      setIsLocked(true);
    }
  };

  const handleGaslessMintAndTransfer = async () => {
    if (!nftData) return;

    // Check if user is connected
    if (!currentAccount?.address) {
      notify("Please connect your wallet first", "error");
      return;
    }

    setMinting(true);
    const notifyId = notifyPromise(
      "Minting NFT... this might take some time...",
      "info"
    );

    console.log("NFT DATA", nftData);
    console.log("CURRENT ACCOUNT", currentAccount);
    console.log("USER WALLET ADDRESS", userWalletAddress);
    console.log("ADDRESS", address);
    console.log("SPONSOR SIGN AND EXECUTE", sponsorSignAndExecute);
    try {
      const nftForm = {
        collection_id: "0x77d8d09f449b77816e0573ae64ab05ecf14b7e63609cfd6e034c7d15abbb6aba", // Use new collection ID
        title: nftData.title,
        description: nftData.description || "",
        image_url: nftData.image_url,
        attributes: nftData.attributes || "",
      };

      console.log("Minting NFT with data:", {
        userAddress: currentAccount.address,
        nftForm
      });

      // Use localhost:8000 for the backend API
      const mintAndTransferResponse = await axiosInstance.post(
        "http://localhost:8000/user/sui-nft/backend-mint",
        {
          nftForm,
        },
        {
          params: { user_address: currentAccount.address },
        }
      );

      notifyResolve(notifyId, "NFT Minted Successfully! Please Check Your Wallet", "success");

      console.log("Mint response:", mintAndTransferResponse.data);
      
      // Show success modal
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error("Minting error:", error);
      
      let errorMessage = "Error minting NFT";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      notifyResolve(notifyId, errorMessage, "error");
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] max-w-screen bg-[#00041F] flex justify-center items-center text-center">
        <>
          <svg
            className="animate-spin h-12 w-12 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </>
      </div>
    );
  }

  if (isLocked) {
    if (location.latitude == -1 && location.longitude == -1)
      return (
        <div className="h-[80vh] max-w-screen bg-[#00041F] text-white flex flex-col items-center justify-center p-6 text-center gap-5">
          <div className="relative">
            <MapPin className="w-16 h-16  text-red-500 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-blue-100">
              Location Restricted
            </h2>
            <p className="text-blue-300">
              Location permissions are required to verify eligibility.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGetCurrentPositionAndPageRefresh}
              className="px-4 py-2 bg-[#4DA2FF] hover:bg-blue-700 rounded-md flex items-center gap-2 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Grant Location Permissions
            </button>
          </div>
        </div>
      );
    else
      return (
        <div className="h-[80vh] max-w-screen bg-[#00041F] text-white flex flex-col items-center justify-center p-6 text-center gap-6">
          {/* Animated icon with gradient */}
          <div className="relative">
            <Globe className="w-16 h-16 text-blue-400 animate-pulse" />
            <MapPinOff className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-red-500" />
          </div>

          {/* Main message */}
          <div className="space-y-3 max-w-md">
            <h3 className="text-2xl font-bold text-blue-100 flex items-center justify-center gap-2">
              <Compass className="w-6 h-6" />
              Location Restricted
            </h3>
            <p className="text-red-300 text-lg">
              This NFT is not accessible in your current region
            </p>
            <p className="text-blue-300 text-sm">
              The content you&apos;re trying to view has geographical
              restrictions
            </p>
          </div>
        </div>
      );
  }

  if (!nftData) return <div>NFT not found.</div>;

  return (
    <div className={`flex flex-col bg-[#00041F] ${workSans.className}`}>
      <div className="flex flex-col px-8 md:px-16">
        <Link
          href={`/collections`}
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
          />

          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col justify-start gap-y-2 my-4 w-full">
              <p className="text-white md:text-4xl text-2xl tracking-wide font-bold">
                {nftData.name}
              </p>
              <p className="text-white md:text-lg text-sm">
                By <span className="text-[#4DA2FF]">{nftData.collection_name}</span>
              </p>
            </div>

            <div className="flex items-center justify-center my-4">
              <p className="md:text-xl text-sm text-white">
                {nftData.description}
              </p>
            </div>

            <div className="flex items-center justify-start w-full">
              <div className="flex items-center md:w-auto w-full justify-between my-4 bg-[#4DA2FF] backdrop-blur-md rounded-lg px-3 py-3 gap-x-2">
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
              </div>
            </div>

            <div className="flex flex-col gap-4 items-start mt-2 w-full">
              <button
                onClick={handleGaslessMintAndTransfer}
                disabled={minting}
                className="md:px-6 md:py-3 px-4 py-2 rounded-full md:text-xl text-sm bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] flex items-center gap-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {minting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Minting...
                  </>
                ) : (
                  <>
                    Mint NFT
                    <ArrowB />
                  </>
                )}
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
      <UnlockableNft isOpen={isModalOpen} closeModal={closeModal} />
      {showSuccessModal && (
        <MintSuccessModal
          onClose={() => setShowSuccessModal(false)}
          nftData={nftData}
        />
      )}
    </div>
  );
}
