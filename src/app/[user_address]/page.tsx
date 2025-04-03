"use client";
import React, { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

import { useZkLogin } from "@mysten/enoki/react";
import { useRouter } from "next/navigation";
import "./page.css";
import { MdEdit } from "react-icons/md";

import axiosInstance from "@/utils/axios";
import NFTModal from "./ClaimNFTModal";
import Link from "next/link";
import { useGlobalAppStore } from "@/store/globalAppStore";
import UpdateProfileModal from "./UpdateProfileModal";

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

  //needed for the NFT modal to function
  const [selectedModalNft, setSelectedModalNft] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // needing for updating profile
  const [showModal, setShowModal] = useState(false);

  const openModal = (nft: NFT) => {
    setSelectedModalNft(nft);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedModalNft(null);
    setIsModalOpen(false);
  };

  const SUI_FRENS_Package_ID =
    "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d";

  const MY_PACKAGE_ID =
    process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID ||
    "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84";

  const userAddress = currentAccount?.address || zkloginaddress || "";

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

  //processing the fetched data to only including the content fields
  //content fields contains all the data we need
  const processedNFTs = filteredNFTs?.map(
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

  useEffect(() => {
    const getCollectionNames = async () => {
      const axiosResponse = await axiosInstance.get(
        "/platform/collections-sui"
      );
      const collections = axiosResponse.data.suiCollections;
      setCollections(collections);
    };

    getCollectionNames();

    if (userAddress) {
      getDatabase();
    }
  }, [userAddress]);

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

  const updateUser = async () => {
    const response = await axiosInstance.post("/user", {
      description: "new second description",
      username: "super user",
      profile_image: "url",
      banner_image: "url",
    });

    console.log(response);
  };

  // if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
      {/* Banner Section */}
      <div className="w-full h-[200px] overflow-hidden">
        <img
          src={
            userData.banner_image ||
            "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
          }
          alt="Banner"
          className="w-full h-auto"
        />
      </div>

      {/* Profile Section */}
      <div className=" mt-[-20px] p-6  shadow-lg rounded-lg w-4/5 mx-auto">
        <div className="flex items-center gap-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                src={
                  userData.profile_image ||
                  "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
                }
                alt="Logo"
                className="w-24 h-24 rounded-full border-2 border-gray-300"
              />
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-semibold">{userData.username}</h2>
              <p className="text-gray-300 text-xl">{userData.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white/30 p-2 rounded-full"
          >
            <MdEdit className="text-xl" />
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Collections </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {processedNFTs?.map((nft) => (
            <div
              key={nft.id.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:bg-white/15"
            >
              {/* NFT Image */}
              <div
                onClick={() => openModal(nft)}
                className="relative aspect-square cursor-pointer"
              >
                <img
                  src={nft.image_url || "https://via.placeholder.com/300"}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-xl font-bold text-white">{nft.name}</h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex flex-col justify-between min-h-[150px]">
                {/* Description with line clamp */}
                <p className="text-sm text-white/80 line-clamp-2 mb-4">
                  {nft.description}
                </p>

                <div className="mt-4">
                  <p className="text-blue-200">Mint Price: {nft.mint_price}</p>
                  <p className="text-blue-300">
                    Collection ID:{" "}
                    {nft.collection_id.length > 15
                      ? `${nft.collection_id.substring(0, 15)}...`
                      : nft.collection_id}
                  </p>
                  <p className="text-blue-400">
                    Token Number: {nft.token_number}
                  </p>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between items-center text-xs text-green-400 mb-3">
                  <Link
                    key={nft.id.id} // Using the correct ID field
                    href={`/nft/${nft.id.id}`} // Redirect to the NFT details page
                    passHref // Ensure the link is passed correctly
                  >
                    <button className="font-semibold text-lg">
                      Go to NFT Page &#8594;
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <NFTModal
        isOpen={isModalOpen}
        selectedNft={selectedModalNft!}
        onClose={closeModal}
      />

      {/* Render the modal conditionally */}
      {showModal && (
        <UpdateProfileModal
          userData={userData}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default App;
