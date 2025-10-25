// sui-hashcase/src/app/freemint/[metadata_id]/page.tsx

"use client";

import ArrowB from "@/assets/images/arrowB.svg";
import { Work_Sans } from "next/font/google";
import notify, { notifyPromise, notifyResolve } from "@/utils/notify";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";

import { useZkLogin } from "@mysten/enoki/react";
import { useSponsorSignAndExecute } from "@/app/hooks/useSponsorSignandExecute";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";

import axiosInstance from "@/utils/axios";
import UnlockableNft from "./UnlockableNft";
import MintSuccessModal from "./MintSuccessModal";
import { useGlobalAppStore } from "@/store/globalAppStore";

import {
  Globe,
  MapPin,
  RefreshCw,
  MapPinOff,
  Compass,
  Ban,
  CheckCircle,
} from "lucide-react";
import ConnectButton from "@/components/ConnectButton";

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
  is_active?: boolean;
  unlockable_content?: string | null;
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

const workSans = Work_Sans({ subsets: ["latin"] });

export default function NFTPage() {
  const params = useParams();
  const router = useRouter();
  const [nftData, setNftData] = useState<Metadata | null>(null);

  const [isLocked, setIsLocked] = useState(false);
  const [location, setLocation] = useState<Coordinates>({
    latitude: -1,
    longitude: -1,
  });

  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [locationFetched, setLocationFetched] = useState(false);

  const [canMintAgain, setCanMintAgain] = useState(true);
  const [isMetadataActive, setIsMetadataActive] = useState(true);
  const [hasMintAttempted, setHasMintAttempted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { address } = useZkLogin();
  const { sponsorSignAndExecute } = useSponsorSignAndExecute();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { userWalletAddress, hasWalletForChain } = useGlobalAppStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWalletConnected = mounted && hasWalletForChain("sui");

  // Get location ONCE on mount
  useEffect(() => {
    const initLocation = async () => {
      try {
        const hasPermission = await checkLocationPermissions();
        if (hasPermission) {
          const coords = await getCurrentPosition();
          console.log("📍 Got location:", coords);
          setLocation(coords);
          setLocationFetched(true);
        } else {
          setLocationFetched(true); // Mark as done even if no permission
        }
      } catch (error) {
        console.error("Failed to get location:", error);
        setLocationFetched(true);
      }
    };
    initLocation();
  }, []);

  // Fetch NFT data ONLY when location is ready
  useEffect(() => {
    if (params.metadata_id && locationFetched) {
      fetchNFTData();
    }
  }, [params.metadata_id, locationFetched]);

  // Check localStorage for mint attempts
  useEffect(() => {
    if (params.metadata_id && currentAccount?.address) {
      const mintKey = getMintAttemptKey(
        params.metadata_id,
        currentAccount.address
      );
      const previouslyAttempted = localStorage.getItem(mintKey) === "true";
      setHasMintAttempted(previouslyAttempted);
    }
  }, [params.metadata_id, currentAccount?.address]);

  const getMintAttemptKey = (
    metadataId: string | string[],
    walletAddress: string
  ) => {
    const id = Array.isArray(metadataId) ? metadataId[0] : metadataId;
    return `mint_attempted_${id}_${walletAddress}`;
  };

  const fetchNFTData = async (providedCoords?: Coordinates) => {
    try {
      setLoading(true);
      const metadataId = Array.isArray(params.metadata_id)
        ? params.metadata_id[0]
        : params.metadata_id;

      const isNFTAddress =
        metadataId?.startsWith("0x") && metadataId.length > 60;

      // Handle blockchain NFTs
      if (isNFTAddress) {
        // ... existing blockchain NFT code ...
        return;
      }

      // Use provided coords or state coords
      const currentLocation = providedCoords || location;
      const hasLocation =
        currentLocation.latitude !== -1 && currentLocation.longitude !== -1;

      const requestParams: any = { metadata_id: metadataId };

      if (hasLocation) {
        requestParams.user_lat = currentLocation.latitude;
        requestParams.user_lon = currentLocation.longitude;
        console.log("🔍 Checking geofence with location:", requestParams);
      } else {
        requestParams.user_address =
          currentAccount?.address || userWalletAddress;
        console.log("🔍 Checking ownership without location:", requestParams);
      }

      const itemData = await axiosInstance.get(
        "/platform/metadata/geofenced-by-id",
        {
          params: requestParams,
        }
      );

      const { metadata_instance, can_mint_again } = itemData.data;

      if (!metadata_instance) {
        console.log("❌ NFT locked - not accessible");
        setIsLocked(true);
        setLoading(false);
        return;
      }

      console.log("✅ NFT unlocked - accessible");
      const finalNftData = {
        ...metadata_instance,
        collection_id: metadata_instance.collection.id,
        collection_name: metadata_instance.collection.name,
        collection_address:
          metadata_instance?.collection?.contract?.contract_address,
      };

      setNftData(finalNftData);
      setIsLocked(false);
      setCanMintAgain(can_mint_again !== undefined ? can_mint_again : true);
      setIsMetadataActive(metadata_instance.is_active !== false);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching NFT data:", error);
      setIsLocked(true);
      setLoading(false);
    }
  };

  const checkLocationPermissions = async () => {
    try {
      if (!navigator.permissions) return false;
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
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error: GeolocationPositionError) => {
          console.error("Geolocation error:", error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  const handleRefreshLocation = async () => {
    try {
      notify("Checking location permission...", "info");
      const coords = await getCurrentPosition();
      console.log("📍 Refreshed location:", coords);
      setLocation(coords);
      setLocationFetched(true);
      notify("Location updated!", "success");
      await fetchNFTData(coords);
    } catch (error: any) {
      console.error("Location refresh failed:", error);
      if (error.code === 1) {
        notify(
          "Please enable location permissions in your browser settings",
          "error"
        );
      } else {
        notify("Failed to get location. Please try again.", "error");
      }
    }
  };

  const handleGaslessMintAndTransfer = async () => {
    if (!currentAccount?.address) {
      notify("Please connect your wallet first", "error");
      return;
    }

    if (!isMetadataActive) {
      notify("Minting has been disabled by the owner", "error");
      return;
    }

    if (hasMintAttempted) {
      notify("You have already minted this NFT", "info");
      return;
    }

    if (!canMintAgain) {
      notify("You have already minted this NFT", "info");
      return;
    }

    setMinting(true);
    const toastId = notifyPromise(
      "Processing your mint...",
      "Please wait while we mint your NFT"
    );

    try {
      const metadataId = (
        Array.isArray(params.metadata_id)
          ? params.metadata_id[0]
          : params.metadata_id
      ) as string;

      const mintKey = getMintAttemptKey(metadataId, currentAccount.address);
      localStorage.setItem(mintKey, "true");

      const requestBody = {
        recipient_address: currentAccount.address,
        metadata_id: parseInt(metadataId),
        transaction_type: "nft_mint",
      };

      console.log("🚀 Minting NFT with request:", requestBody);

      const response = await axiosInstance.post(
        "/platform/transaction/gasless-mint",
        requestBody
      );

      console.log("✅ Mint successful:", response.data);
      notifyResolve(toastId, "NFT minted successfully!", "success");
      setHasMintAttempted(true);
      setCanMintAgain(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("❌ Mint failed:", error);
      const metadataId = (
        Array.isArray(params.metadata_id)
          ? params.metadata_id[0]
          : params.metadata_id
      ) as string;

      const mintKey = getMintAttemptKey(metadataId, currentAccount.address);
      localStorage.removeItem(mintKey);

      const errorMessage =
        error?.response?.data?.error || "Failed to mint NFT. Please try again.";
      notifyResolve(toastId, errorMessage, "error");
    } finally {
      setMinting(false);
    }
  };

  const getMintButtonState = () => {
    if (!isMetadataActive) {
      return {
        disabled: true,
        text: "Minting Disabled",
        className: "bg-red-500 text-white cursor-not-allowed opacity-75",
        icon: <Ban className="w-4 h-4" />,
      };
    }
    if (!canMintAgain) {
      return {
        disabled: true,
        text: "NFT Minted",
        className: "bg-green-500 text-white cursor-not-allowed opacity-75",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
    if (hasMintAttempted) {
      return {
        disabled: true,
        text: "Already Minted",
        className: "bg-gray-500 text-white cursor-not-allowed opacity-75",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }
    if (minting) {
      return {
        disabled: true,
        text: "Minting...",
        className:
          "bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] opacity-50 cursor-not-allowed",
        icon: (
          <svg
            className="animate-spin h-4 w-4"
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
        ),
      };
    }
    return {
      disabled: false,
      text: "Mint NFT",
      className:
        "bg-white text-black border-[1px] border-b-4 border-[#4DA2FF] hover:shadow-xl",
      icon: <ArrowB />,
    };
  };

  const buttonState = getMintButtonState();

  if (loading) {
    return (
      <div className="h-[70vh] bg-[#00041F] flex justify-center items-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
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
          <p className="text-white text-lg">Loading NFT...</p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    if (location.latitude === -1) {
      return (
        <div className="bg-[#00041F] text-white flex flex-col items-center justify-center sm:py-16 py-10 px-6">
          <MapPin className="w-16 h-16 text-red-500 animate-bounce mb-4" />
          <h2 className="text-2xl font-bold text-blue-100 mb-2">
            Location Required
          </h2>
          <p className="text-blue-300 mb-6">
            This NFT requires location verification.
          </p>
          <button
            onClick={handleRefreshLocation}
            className="px-4 py-2 bg-[#4DA2FF] hover:bg-blue-700 rounded-md flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Enable Location
          </button>
        </div>
      );
    }

    return (
      <div className="bg-[#00041F] text-white flex flex-col items-center justify-center sm:py-16 py-10 px-6">
        <div className="relative mb-6">
          <Globe className="w-16 h-16 text-blue-400 animate-pulse" />
          <MapPinOff className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-blue-100 mb-2 flex items-center gap-2">
          <Compass className="w-6 h-6" />
          Location Restricted
        </h3>
        <p className="text-red-300 text-lg mb-2">
          Not accessible in your current region
        </p>
        <p className="text-blue-300 text-sm mb-4">
          You need to be within 15km of the NFT location
        </p>
        <p className="text-yellow-300 text-xs mb-6">
          Your location: {location.latitude.toFixed(4)},{" "}
          {location.longitude.toFixed(4)}
        </p>
        <button
          onClick={handleRefreshLocation}
          className="px-4 py-2 bg-[#4DA2FF] hover:bg-blue-700 rounded-md flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Location
        </button>
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="bg-[#00041F] text-white p-6 text-center">
        NFT not found.
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-[#00041F] ${workSans.className}`}>
      <div className="flex flex-col px-6 md:px-10 max-w-6xl mx-auto w-full">
        <div className="my-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start pb-32">
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl max-h-[500px]">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-2xl z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              <img
                className="w-full h-full rounded-2xl shadow-2xl border border-white/10 object-cover"
                src={nftData.image_url}
                alt="nft"
                style={{ opacity: imageLoading ? 0 : 1 }}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </div>
          </div>

          <div className="flex flex-col items-start justify-center w-full">
            <div className="flex flex-col gap-y-6 mb-4 w-full">
              <p className="text-white md:text-5xl text-3xl font-bold">
                {nftData.name}
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                {nftData.title}
              </p>
            </div>

            <p className="md:text-xl text-base text-[#4DA2FF] leading-relaxed max-w-2xl my-6">
              {nftData.description}
            </p>

            <div className="flex flex-col gap-6 items-start mt-6 w-full">
              {!isMetadataActive && (
                <div className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-red-400" />
                    <p className="text-red-300 text-sm font-medium">
                      Minting disabled by owner
                    </p>
                  </div>
                </div>
              )}

              {(!canMintAgain || hasMintAttempted) && isMetadataActive && (
                <div className="w-full p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-green-300 text-sm font-medium">
                      {!canMintAgain
                        ? "You already minted this NFT"
                        : "Mint completed"}
                    </p>
                  </div>
                </div>
              )}

              {nftData.unlockable_content && (
                <UnlockableNft isMinted={!canMintAgain || hasMintAttempted} />
              )}

              {isWalletConnected ? (
                <button
                  onClick={handleGaslessMintAndTransfer}
                  disabled={buttonState.disabled}
                  className={`md:px-8 md:py-4 px-6 py-3 rounded-full md:text-xl text-sm flex items-center gap-x-3 shadow-lg transition-all ${buttonState.className}`}
                >
                  {buttonState.icon}
                  {buttonState.text}
                </button>
              ) : (
                <ConnectButton mid={true} />
              )}
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <MintSuccessModal
          onClose={() => setShowSuccessModal(false)}
          nftData={nftData}
        />
      )}
    </div>
  );
}
