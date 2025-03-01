"use client";
import React, { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { createClient } from "@supabase/supabase-js";
import { Bounce, toast } from "react-toastify";
import { useZkLogin } from "@mysten/enoki/react";
import { useRouter } from "next/navigation";
import "./page.css";
import axios from "axios";
import axiosInstance from "@/utils/axios";
import WalletConnectionModal from "@/components/WalletConnectionModal";
import NFTModal from "./ClaimNFTModal";

const App: React.FC = () => {
  const [userData, setUserData] = useState({
    Logo: "",
    collection_id: "",
    description: "",
    user_id: "",
    username: "",
    nfts: 0,
  });

  const [activeTab, setActiveTab] = useState("Base_Assets");

  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    image_uri: "",
    collection_id: "",
  });

  const [collections, setCollections] = useState([]);

  const currentAccount = useCurrentAccount();
  const { address: zkloginaddress } = useZkLogin();
  const router = useRouter();

  //needed for the NFT modal to function
  const [selectedModalNft, setSelectedModalNft] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (nft) => {
    // setSelectedModalNft(imageUrl);

    console.log("LOGGING FROM INSIDE THE OPEN MODAL FUNCTION");
    console.log(nft);

    setSelectedModalNft(nft);

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedModalNft(null);
    setIsModalOpen(false);
  };

  const Hashcase_Loyalty =
    "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";
  const SUI_FRENS_Package_ID =
    "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d";
  const base_loyalty =
    "0xb92dbbdb90ea755f8ea371d3e4658687fc4a1e9f6b13264e358c7d27da7514a7";

  const MY_PACKAGE_ID =
    process.env.NEXT_PUBLIC_PACKAGE_ID ||
    "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84";

  const userAddress = currentAccount?.address || zkloginaddress || "";

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

  console.log(myLoyaltyData);

  const filteredNFTs = myLoyaltyData?.data.filter(
    (item) =>
      item.data.type ===
      "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84::hashcase_module::NFT"
  );

  const otherThings = myLoyaltyData?.data.filter(
    (item) =>
      item.data.type !=
      "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84::hashcase_module::NFT"
  );

  console.log(otherThings);

  console.log(filteredNFTs);

  const processedNFTs = filteredNFTs?.map((nft) => nft.data?.content.fields);

  console.log(processedNFTs);

  // const nftFieldsArray = filteredNFTs?.map((nft) => nft.data.content.fields);

  // console.log("HELLO THERE");
  // console.log(nftFieldsArray);

  // console.log(JSON.stringify(processedNFTs, null, 2)); // Pretty-print as JSON
  // processedNFTs?.forEach((nft, index) => {
  //   console.log(`NFT ${index + 1}:`, nft);
  // });

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

  // const { data: baseLoyaltyData } = useSuiClientQuery("getOwnedObjects", {
  //   owner: userAddress,
  //   filter: {
  //     Package: base_loyalty,
  //   },
  //   options: {
  //     showDisplay: true,
  //     showContent: true,
  //     showType: true,
  //   },
  // });

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

  // Process the data outside of hooks
  const imgurl =
    hashcaseData?.data
      ?.filter((item: any) => item?.data?.content?.fields?.image_url)
      .map((item: any) => item.data.content.fields.image_url) || [];

  // const baseurl =
  //   baseLoyaltyData?.data
  //     ?.filter((item: any) => item?.data?.content?.fields?.image_url)
  //     .map((item: any) => item.data.content.fields.image_url) || [];

  // const suiurl =
  //   suiFrensData?.data
  //     ?.map((item: any) => item?.data?.display?.data?.image_url)
  //     .filter((url: string | undefined) => url) || [];

  // console.log("LOGGING ALL THE IMGURL DATA");
  // console.log(imgurl);

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
  }, []);

  const getDatabase = async () => {
    const response = await axiosInstance.get("/user");

    const user = response.data.user;

    const newUserData = {
      Logo: "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",
      collection_id: "someCollection",
      description: "someDescription",
      user_id: user.id,
      username: user.sui_wallet_address,
      nfts: 0,
    };

    console.log("LOGGING THE USER DATA");
    console.log(newUserData);

    setUserData(newUserData);
  };

  // if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
      {/* Banner Section */}
      <div className="w-full h-[200px] overflow-hidden">
        <img
          src={
            userData.Logo ||
            "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
          }
          alt="Banner"
          className="w-full h-auto"
        />
      </div>

      {/* Profile Section */}
      <div className="flex items-center mt-[-50px] p-6  shadow-lg rounded-lg w-4/5 mx-auto">
        <div className="flex-shrink-0">
          <img
            src={
              userData.Logo ||
              "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
            }
            alt="Logo"
            className="w-24 h-24 rounded-full border-2 border-gray-300"
          />
        </div>
        <div className="ml-6">
          <h2 className="text-2xl font-semibold">{userData.username}</h2>
          <p className="text-gray-600">{userData.description}</p>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Collections</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedNFTs?.map((nft) => (
            <div
              key={nft.id.id} // Using the correct ID field
              onClick={() => openModal(nft)}
              className="bg-[#0a0f3b] shadow-lg rounded-lg p-4 transform transition-transform duration-300 hover:scale-105 hover:bg-[#141a52] cursor-pointer"
            >
              <img
                src={nft.image_url || "https://via.placeholder.com/300"}
                alt={nft.name}
                className="w-full h-48 object-cover rounded-md"
              />
              <h2 className="text-2xl font-semibold mt-4">{nft.name}</h2>
              <p className="text-sm text-gray-300 mt-2">
                {nft.description.length > 100
                  ? `${nft.description.substring(0, 100)}...`
                  : nft.description}
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
              <div className="hidden hover:block text-gray-400 mt-2 text-sm">
                <p>Metadata Version: {nft.metadata_version}</p>
                <p>Creator: {nft.creator.slice(0, 10)}...</p>
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
    </div>
  );
};

export default App;
