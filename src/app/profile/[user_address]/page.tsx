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
import { toast } from "react-hot-toast";

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

const App: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState("Base_Assets");

  const [collections, setCollections] = useState([]);

  const currentAccount = useCurrentAccount();
  const { address: zkloginaddress } = useZkLogin();
  const router = useRouter();
  const params = useParams();
  const userAddressFromUrl = Array.isArray(params?.user_address)
    ? params?.user_address[0]
    : (params?.user_address as string | undefined);

  // Block access to profile if no wallet connected
  useEffect(() => {
    if (!currentAccount?.address && !zkloginaddress) {
      toast.error("Please connect your wallet to view your profile");
      router.replace("/");
    }
  }, [currentAccount, zkloginaddress, router]);

  // needing for updating profile
  const [showModal, setShowModal] = useState(false);
  // Share profile modal
  const [showShareModal,  setShowShareModal] = useState(false);

  const handleNFTClick = (nft: NFT) => {
    // Redirect to the dedicated NFT page
    router.push(`/nft/${nft.id.id}`);
  };

  const SUI_FRENS_Package_ID =
    "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d";

  const MY_PACKAGE_ID =
    process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID ||
    "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84";

  const userAddress = userAddressFromUrl || currentAccount?.address || zkloginaddress || "";

  console.log("🔍 DEBUG: Current Account Address:", currentAccount?.address);
  console.log("🔍 DEBUG: ZkLogin Address:", zkloginaddress);
  console.log("🔍 DEBUG: URL Address:", userAddressFromUrl);
  console.log("🔍 DEBUG: Final User Address:", userAddress);
  console.log("🔍 DEBUG: Package ID:", MY_PACKAGE_ID);

  // Local UI state for Owned NFTs toolbar
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"recent" | "name_asc" | "name_desc">("recent");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  //getting the owner objects from our deployed package
  const { data: myLoyaltyData, isLoading } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: userAddress,
      filter: {
        Package: MY_PACKAGE_ID,
      },

      options: {
        showDisplay: true,
        showContent: true,
        showType: true,
      },
    }
  );

  //filtering out the NFT types of object
  const filteredNFTs = myLoyaltyData?.data.filter(
    (item) => item?.data?.type === `${MY_PACKAGE_ID}::hashcase_module::NFT`
  );

  console.log("OWNED NFTS");
  console.log(filteredNFTs);

  const claimedNFTs = myLoyaltyData?.data.filter(
    (item) =>
      item?.data?.type === `${MY_PACKAGE_ID}::hashcase_module::ClaimedNFT`
  );

  console.log("logging the claimed nfts");
  console.log(claimedNFTs);

  //processing the fetched data to only including the content fields
  //content fields contains all the data we need
  const processedNFTs = filteredNFTs?.map(
    (nft) => (nft.data?.content as any).fields
  );

  // Derived list for Owned NFTs after search/sort
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
      if (sortOption === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortOption === "name_desc") return (b.name || "").localeCompare(a.name || "");
      // recent (fallback: token number desc)
      const at = Number(a.token_number || 0);
      const bt = Number(b.token_number || 0);
      return bt - at;
    });

  const processedClaimedNFTs = claimedNFTs?.map(
    (nft) => (nft.data?.content as any).fields
  );

  // Query objects only if we have a valid address
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

  // const { data: suiFrensData } = useSuiClientQuery("getOwnedObjects", {
  //   owner: userAddress,
  //   filter: {
  //     Package: SUI_FRENS_Package_ID,
  //   },
  //   options: {
  //     showDisplay: true,
  //     showContent: true,
  //     showType: true,
  //   },
  // });

  // const suiurl =
  //   suiFrensData?.data
  //     ?.map((item: any) => item?.data?.display?.data?.image_url)
  //     .filter((url: string | undefined) => url) || [];

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

    // Only attempt to load user profile if verified and we have an address
    if (userAddress && isUserVerified) {
      getDatabase().catch((err) => {
        if (err?.response?.status === 401) {
          console.warn("Unauthorized fetching /user; skipping profile hydrate");
        } else {
          console.error("Failed to load /user:", err);
        }
      });
    }
  }, [userAddress, isUserVerified]);

  const getDatabase = async () => {
    const response = await axiosInstance.get("/user");
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
    // You might want to add additional logic here like showing a success message
  };

  const handleShareProfile = async () => {
    const profileUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  // if (isLoading) return <div>Loading...</div>;

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
        {/* Overlay to mute the banner */}
        <div className="absolute inset-0 bg-black/50 z-10" />
      </div>

      {/* Profile Section */}
      {currentAccount ? (
        <div className="relative z-20 flex flex-col items-center -mt-16">
          {/* Profile Image */}
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

          {/* User Info */}
          <div className="text-center mt-4">
            <h2 className="text-xl font-semibold">{userData.username}</h2>
            <p className="text-blue-400 text-sm">{userData.description}</p>
          </div>

          {/* Action Buttons */}
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
              <svg className="ml-1 w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342A3 3 0 109 12c0-.482-.114-.938-.316-1.342m0 2.684l6.632 3.316m-6.632-6l6.632-3.316" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 my-4 items-center justify-center">
          <p className="text-2xl font-semibold">Profile</p>
          <ConnectButton />
        </div>
      )}

      <div className="p-8 max-w-[1600px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-3">Owned NFTs</h1>
        <div className="flex flex-col items-center gap-2 mb-6">
          <p className="text-white/60 text-xs sm:text-sm break-all mb-4 mt-2">
            Address: <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">{userAddress || "Not connected"}</span>
          </p>
          {/* Toolbar */}
          <div className="relative w-full max-w-5xl mb-10 border-b border-white/10 rounded-xl px-4 py-4">
            {/* Centered, wide search */}
            <div className="mx-auto w-full sm:w-[520px] md:w-[680px]">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 text-sm">
              {ownedNfts.length} item{ownedNfts.length === 1 ? "" : "s"}
            </div>

              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, description or token..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            {/* Item count pinned to the right */}
            
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-white/10" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : ownedNfts && ownedNfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">
            {ownedNfts?.map((nft: any) => (
              <div
                key={nft.id.id}
                className={`group rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] ${density === "compact" ? "" : ""}`}
              >
                {/* Image */}
                <div className={`relative aspect-square`}>
                  <img
                    src={nft.image_url || "https://via.placeholder.com/300"}
                    alt={nft.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] cursor-pointer"
                    onClick={() => handleNFTClick(nft)}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                </div>

                {/* Content */}
                <div className={`${density === "compact" ? "p-3 space-y-2" : "p-4 space-y-3"}`}>
                  <h3 className="text-lg font-semibold text-white line-clamp-1">{nft.name}</h3>
                  <p className="text-sm text-white/70 line-clamp-2">{nft.description}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-blue-200 border border-white/10">Mint: {nft.mint_price}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-blue-200 border border-white/10">Token #{nft.token_number}</span>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => handleNFTClick(nft)}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-400/60 ${density === "compact" ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"} font-medium text-white hover:bg-blue-400/10 transition-colors`}
                    >
                      Manage NFT <span className="text-white">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg mb-2">No NFTs found</p>
            <p className="text-gray-500 text-sm">You don't own any NFTs from this contract yet.</p>
          </div>
        )}

        {/* <h1 className="text-4xl font-bold text-center mb-8 mt-16">Claimed NFTs</h1> */}
        {/* {processedClaimedNFTs && processedClaimedNFTs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">
            {processedClaimedNFTs?.map((nft) => (
              <div
                key={nft.id.id}
                className="group rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-sm shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
              >
                <div className="relative aspect-square">
                  <img
                    src={nft.image_url || "https://via.placeholder.com/300"}
                    alt={nft.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] cursor-pointer"
                    onClick={() => openModal(nft)}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="text-lg font-semibold text-white line-clamp-1">{nft.name}</h3>
                  <p className="text-sm text-white/70 line-clamp-2">{nft.description}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-blue-200 border border-white/10">Mint: {nft.mint_price}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-blue-200 border border-white/10">Token #{nft.token_number}</span>
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={() => openModal(nft)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-400/60 px-3 py-2 text-sm font-medium text-white hover:bg-blue-400/10 transition-colors"
                    >
                      Manage NFT <span className="text-white">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-lg">No claimed NFTs yet.</p>
          </div>
        )} */}
      </div>

      {/* Render the modal conditionally */}
      {showModal && (
        <UpdateProfileModal
          userData={userData}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}

      {/* NFT action modal */}
      {/* NFTModal
        nft={selectedModalNft}
        isOpen={isModalOpen}
        onClose={closeModal}
        onClaimNFT={handleClaimNFT}
        onUpdateMetadata={handleUpdateMetadata}
      /> */}

      {/* Share Profile Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-md mx-4 p-5 animate-in fade-in-50 zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Share Profile</h2>
              <button
                className="text-white/60 hover:text-white"
                onClick={() => setShowShareModal(false)}
                aria-label="Close share modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-white/70 text-sm mb-3">Share this link to let others view your profile:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={typeof window !== 'undefined' ? window.location.href : ''}
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