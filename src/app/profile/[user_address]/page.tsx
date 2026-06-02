"use client";
import React, { useState, useEffect } from "react";
import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import { useParams, useRouter } from "next/navigation";
import "./page.css";
import { MdEdit } from "react-icons/md";

import axiosInstance from "@/utils/axios";
import Link from "next/link";
import { useGlobalAppStore } from "@/store/globalAppStore";
import UpdateProfileModal from "./UpdateProfileModal";
import ConnectButton from "@/components/ConnectButton";
import Image from "next/image";
import NftCard from "@/components/NftCard";
import NFTsTab from "@/components/tasks/NFTsTab";
import TokensTab from "@/components/tasks/TokensTab";
import { useAppSnackbar } from "@/providers/SnackbarProvider";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";
import { TokensApiResponse } from "@/components/tasks/tokenTypes";

type NFT = {
  attributes?: string[];
  collection_id: string;
  creator: string;
  description?: string;
  id: { id: string };
  image_url: string;
  metadata_version: string;
  mint_price: string;
  name: string;
  token_number: string;
};

interface FetchedNFT {
  id: number;
  user_id: number;
  name: string;
  description: string;
  image_uri: string;
  collection_id: number;
  token_id: number;
  type: string;
  status: string;
  priority: number;
  attributes: string;
  metadata_id: number | null;
  createdAt: string;
  updatedAt: string;
}

type TabType = "NFTs" | "Tokens";

const App: React.FC = () => {
  const { showSuccess, showError } = useAppSnackbar();
  const [userData, setUserData] = useState({
    profile_image:
      "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",
    banner_image:
      "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",
    description: "",
    user_id: "",
    username: "",
    nfts: 0,
  });

  const [activeTab, setActiveTab] = useState<TabType>("NFTs");
  const [collections, setCollections] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [fetchedNfts, setFetchedNfts] = useState<FetchedNFT[]>([]);
  const [tokenCount, setTokenCount] = useState(0);

  const currentAccount = useCurrentAccount();
  const { address: zkloginaddress } = useZkLogin();
  const router = useRouter();
  const params = useParams();
  const userAddressFromUrl = Array.isArray(params?.user_address)
    ? params?.user_address[0]
    : (params?.user_address as string | undefined);

  const [showModal, setShowModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleNFTClick = (nft: FetchedNFT) => {
    router.push(`/loyalties/${nft.collection_id}`);
  };

  const SUI_FRENS_Package_ID =
    "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d";

  const MY_PACKAGE_ID =
    "0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0";

  const userAddress =
    userAddressFromUrl || currentAccount?.address || zkloginaddress || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<
    "recent" | "name_asc" | "name_desc"
  >("recent");
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable"
  );

  const { data: myLoyaltyData, isLoading } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: userAddress,
      options: {
        showDisplay: true,
        showContent: true,
        showType: true,
      },
    }
  );

  console.log("🔍 DEBUG: Current Account Address:", currentAccount?.address);
  console.log("🔍 DEBUG: ZkLogin Address:", zkloginaddress);
  console.log("🔍 DEBUG: URL Address:", userAddressFromUrl);
  console.log("🔍 DEBUG: Final User Address:", userAddress);
  console.log(
    "🔍 DEBUG: Environment Package ID:",
    process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID
  );
  console.log("🔍 DEBUG: Final Package ID:", MY_PACKAGE_ID);
  console.log("🔍 DEBUG: Raw owned objects:", myLoyaltyData?.data);
  console.log(
    "🔍 DEBUG: All object types:",
    myLoyaltyData?.data?.map((item) => item?.data?.type)
  );
  console.log(
    "🔍 DEBUG: Expected NFT type:",
    `${MY_PACKAGE_ID}::hashcase_module::NFT`
  );

  const filteredNFTs = myLoyaltyData?.data.filter((item) =>
    item?.data?.type?.includes("::hashcase_module::NFT")
  );

  console.log("OWNED NFTS");
  console.log(filteredNFTs);

  const claimedNFTs = myLoyaltyData?.data.filter((item) =>
    item?.data?.type?.includes("::hashcase_module::ClaimedNFT")
  );

  console.log("logging the claimed nfts");
  console.log(claimedNFTs);

  const processedNFTs = filteredNFTs?.map((nft) => {
    const content = nft.data?.content as any;
    const display = nft.data?.display as any;

    const fields = content?.fields || {};
    const displayData = display?.data || {};

    return {
      id: fields.id || { id: nft.data?.objectId },
      name: displayData.name || fields.name || "Unknown NFT",
      description: displayData.description || fields.description || "",
      image_url: displayData.image_url || fields.image_url || "",
      attributes: fields.attributes || [],
      token_number: displayData.token_number || fields.token_number || "",
      mint_price: displayData.mint_price || fields.mint_price || "0",
      metadata_version:
        displayData.metadata_version || fields.metadata_version || "1",
      collection_id: displayData.collection_id || fields.collection_id || "",
      creator: displayData.creator || fields.creator || "",
    };
  });

  const ownedNfts = (processedNFTs || [])
    .filter((n: any) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (n.name || "").toLowerCase().includes(q) ||
        (n.description || "").toLowerCase().includes(q) ||
        (n.token_number || "").toString().includes(q)
      );
    })
    .sort((a: any, b: any) => {
      if (sortOption === "name_asc")
        return (a.name || "").localeCompare(b.name || "");
      if (sortOption === "name_desc")
        return (b.name || "").localeCompare(a.name || "");
      const at = Number(a.token_number || 0);
      const bt = Number(b.token_number || 0);
      return bt - at;
    });

  const fetchNfts = async () => {
    const { data } = await axiosInstance.get(
      "/user/nfts?userAddress=" + userAddress
    );
    console.log("RETURNED", data);
    setFetchedNfts(data.nfts);
  };

  const fetchTokenCount = async () => {
    if (!userAddress) return;

    try {
      const response = await axiosInstance.get<TokensApiResponse>(
        `/user/profile/erc20/${userAddress}`
      );
      if (response.data.success) {
        setTokenCount(response.data.data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching token count:", error);
      setTokenCount(0);
    }
  };

  useEffect(() => {
    fetchNfts();
    fetchTokenCount();
  }, [userAddress]);

  const processedClaimedNFTs = claimedNFTs?.map((nft) => {
    const content = nft.data?.content as any;
    const display = nft.data?.display as any;

    const fields = content?.fields || {};
    const displayData = display?.data || {};

    return {
      id: fields.id || { id: nft.data?.objectId },
      name: displayData.name || fields.name || "Unknown NFT",
      description: displayData.description || fields.description || "",
      image_url: displayData.image_url || fields.image_url || "",
      attributes: fields.attributes || [],
      token_number: displayData.token_number || fields.token_number || "",
      mint_price: displayData.mint_price || fields.mint_price || "0",
      metadata_version:
        displayData.metadata_version || fields.metadata_version || "1",
      collection_id: displayData.collection_id || fields.collection_id || "",
      creator: displayData.creator || fields.creator || "",
    };
  });

  const { data: hashcaseData } = useSuiClientQuery("getOwnedObjects", {
    owner: userAddress,
    filter: {
      Package: MY_PACKAGE_ID,
    },
    options: {
      showDisplay: true,
      showContent: true,
      showType: true,
    },
  });

  const { isUserVerified } = useGlobalAppStore();

  useEffect(() => {
    const getCollectionNames = async () => {
      const axiosResponse = await axiosInstance.get(
        "/platform/collections-sui"
      );
      const collections = axiosResponse.data.suiCollections;
      setCollections(collections);
    };

    getCollectionNames();

    if (userAddressFromUrl) {
      getDatabase()
        .catch((err) => {
          if (err?.response?.status === 401) {
            console.warn(
              "Unauthorized fetching /user; using default profile data"
            );
          } else {
            console.error("Failed to load /user:", err);
          }
        })
        .finally(() => {
          setIsProfileLoading(false);
        });
    } else {
      setIsProfileLoading(false);
    }
  }, [userAddressFromUrl]);

  const getDatabase = async () => {
    const response = await axiosInstance.get(
      "/user?userAddress=" + userAddress
    );
    console.log(response.data);

    const user = response.data.user;

    const newUserData = {
      profile_image:
        user.profile_image ||
        "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",
      banner_image:
        user.banner_image ||
        "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",

      description: user.description || "Hello, I am using Sui Hashcase",
      user_id: user.id,
      username: user.username,
      nfts: 0,
    };

    setUserData(newUserData);
  };

  const handleUpdateProfile = () => {
    getDatabase();
  };

  const handleShareProfile = async () => {
    const profileUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(profileUrl);
      showSuccess("Profile link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      showError("Failed to copy link");
    }
  };

  const isOwnProfile = () => {
    return (
      currentAccount?.address === userAddress || zkloginaddress === userAddress
    );
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-b from-[#00041f] to-[#030828] text-white pb-10">
      {/* Banner Image Background */}
      <div className="relative w-full h-[200px]">
        <Image
          src={
            userData.banner_image ||
            "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
          }
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
      </div>

      {/* Profile Section */}
      {currentAccount || zkloginaddress ? (
        <div className="relative z-20 flex flex-col items-center -mt-16">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white z-20">
            <Image
              src={
                userData.profile_image ||
                "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
              }
              alt="Profile"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold">{userData.username}</h2>
            <p className="text-blue-400 text-sm">{userData.description}</p>
          </div>

          {isOwnProfile() && (
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center text-white text-sm font-medium hover:underline"
              >
                Edit Profile
                <MdEdit className="ml-1 text-blue-400 text-lg" />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center text-white text-sm font-medium hover:underline"
              >
                Share Profile
                <svg
                  className="ml-1 w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342A3 3 0 109 12c0-.482-.114-.938-.316-1.342m0 2.684l6.632 3.316m-6.632-6l6.632-3.316"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-20 flex flex-col items-center -mt-16">
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white z-20">
            <Image
              src={
                userData.profile_image ||
                "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
              }
              alt="Profile"
              width={128}
              height={128}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold">{userData.username}</h2>
            <p className="text-blue-400 text-sm">{userData.description}</p>
            <p className="text-white/60 text-sm mt-2">Public Profile</p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <ConnectButton />
            {/* <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center text-white text-sm font-medium hover:underline"
            >
              Share Profile
              <svg
                className="ml-1 w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342A3 3 0 109 12c0-.482-.114-.938-.316-1.342m0 2.684l6.632 3.316m-6.632-6l6.632-3.316"
                />
              </svg>
            </button> */}
          </div>
        </div>
      )}

      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Tabs Navigation */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            {(["NFTs", "Tokens"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-24 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-black shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Address Display and Search Bar */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <p className="flex flex-col text-white/60 text-xs sm:text-sm break-all mb-4 mt-2">
            Address:{" "}
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              {userAddress || "Not connected"}
            </span>
            {/* {currentAccount?.address &&
              userAddressFromUrl &&
              currentAccount.address !== userAddressFromUrl && (
                <span className="ml-2 flex justify-center mt-2 text-xs text-blue-400">
                  (Viewing shared profile; connected as{" "}
                  {currentAccount.address.slice(0, 6)}...
                  {currentAccount.address.slice(-4)})
                </span>
              )} */}
          </p>

          {/* Toolbar */}
          <div className="relative w-full max-w-5xl mb-10 border-b border-white/10 rounded-xl px-4 py-4">
            <div className="mx-auto w-full sm:w-[520px] md:w-[680px]">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 text-sm">
                {activeTab === "NFTs" && fetchedNfts.length}
                {activeTab === "Tokens" && tokenCount} item
                {(activeTab === "NFTs" ? fetchedNfts.length : tokenCount) === 1
                  ? ""
                  : "s"}
              </div>

              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab.toLowerCase()} by name, description or token...`}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "NFTs" && (
          <NFTsTab
            fetchedNfts={fetchedNfts}
            searchQuery={searchQuery}
            density={density}
            isOwnProfile={isOwnProfile()}
            address={userAddress}
          />
        )}

        {activeTab === "Tokens" && (
          <TokensTab searchQuery={searchQuery} userAddress={userAddress} />
        )}
      </div>

      {showModal && (
        <UpdateProfileModal
          userData={userData}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-md mx-4 p-5 animate-in fade-in-50 zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                Share Profile
              </h2>
              <button
                className="text-white/60 hover:text-white"
                onClick={() => setShowShareModal(false)}
                aria-label="Close share modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-white/70 text-sm mb-3">
              Share this link to let others view your profile:
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
              />
              <button
                onClick={handleShareProfile}
                className="px-3 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
