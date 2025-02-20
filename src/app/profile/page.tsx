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

  const Hashcase_Loyalty =
    "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";
  const SUI_FRENS_Package_ID =
    "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d";
  const base_loyalty =
    "0xb92dbbdb90ea755f8ea371d3e4658687fc4a1e9f6b13264e358c7d27da7514a7";

  const MY_PACKAGE_ID =
    "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84";

  const userAddress = currentAccount?.address || zkloginaddress || "";

  const { data: myLoyaltyData } = useSuiClientQuery("getOwnedObjects", {
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

  // console.log("LOGGING THE DATA WE'RE GETTING BACK FROM THE  CLIENT QUERY");
  // console.log((myLoyaltyData?.data[0].data?.content as any)?.fields);

  const { data: collectionData } = useSuiClientQuery("getObject", {
    id: "0x39b9b9eeaff544e9ba514e82482f3ba507b96394ee180ef2926d426eac9e38d6",
    options: {
      showDisplay: true,
      showContent: true,
      showType: true,
    },
  });

  // console.log("THESE ARE THE COLLECTIONS THAT WE ARE SUPPOSED TO BE FETCHING");
  // console.log(collectionData);

  const { data: nftsOfCollection } = useSuiClientQuery(
    "queryTransactionBlocks",
    {
      filter: {
        MoveFunction: {
          package:
            "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84",
          // module: "hashcase_module",
          // function: "free_mint_nft",
        },
      },
      cursor: null,
      limit: 50,
      order: "ascending",
    }
  );

  // console.log("THIS IS US TRYING TO QUERY FOR ALL TRANSACTIONS");
  // console.log(nftsOfCollection);

  // async function getMintedNFTAddresses() {
  //   let cursor: string | null = null;
  //   const uniqueOwners: Set<string> = new Set();
  //   let totalNFTs = 0;
  //   do {
  //     const result = await suiClient.queryTransactionBlocks({
  //       filter: { MoveFunction: { package: ${MY_PACKAGE_ID}, module: "protocol", function: "mint" } },
  //       options: {
  //         showInput: true
  //       },
  //       cursor: cursor,
  //       limit: 50, // Adjust limit for performance, e.g., 50, 100, etc.
  //     }) as any;

  //     totalNFTs += result.data.length

  //     // Iterate through each transaction block
  //     for (const tx of result.data) {
  //       if (tx.transaction && tx.transaction.data.sender) {

  //         uniqueOwners.add(tx.transaction.data.sender);
  //       }
  //     }
  //     if (result.data.length === 0) {
  //       break;
  //     }

  //     cursor = result.nextCursor;

  //   } while (cursor); // Continue until no more pages left

  //   return Array.from(uniqueOwners);
  // }

  // Query objects only if we have a valid address
  const { data: hashcaseData } = useSuiClientQuery("getOwnedObjects", {
    owner: userAddress,
    filter: {
      Package: Hashcase_Loyalty,
    },
    options: {
      showDisplay: true,
      showContent: true,
      showType: true,
    },
  });

  const { data: baseLoyaltyData } = useSuiClientQuery("getOwnedObjects", {
    owner: userAddress,
    filter: {
      Package: base_loyalty,
    },
    options: {
      showDisplay: true,
      showContent: true,
      showType: true,
    },
  });

  const { data: suiFrensData } = useSuiClientQuery("getOwnedObjects", {
    owner: userAddress,
    filter: {
      Package: SUI_FRENS_Package_ID,
    },
    options: {
      showDisplay: true,
      showContent: true,
      showType: true,
    },
  });

  // Process the data outside of hooks
  const imgurl =
    hashcaseData?.data
      ?.filter((item: any) => item?.data?.content?.fields?.image_url)
      .map((item: any) => item.data.content.fields.image_url) || [];

  const baseurl =
    baseLoyaltyData?.data
      ?.filter((item: any) => item?.data?.content?.fields?.image_url)
      .map((item: any) => item.data.content.fields.image_url) || [];

  const suiurl =
    suiFrensData?.data
      ?.map((item: any) => item?.data?.display?.data?.image_url)
      .filter((url: string | undefined) => url) || [];

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

    setUserData(newUserData);
  };

  const createNFT = async (metadata: FormData) => {
    await getDatabase();

    const collection_id = 17;
    const amount = 1;

    const res = await axiosInstance.post("/user/mint", metadata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        collection_id,
        amount,
      },
    });
    return {
      res,
      receipt: res.data.receipt,
      message: res.data.message,
    };
    // // creating items listing
    // let nid = userData.username + `${userData.nfts + 1}`;

    // const { error } = await supabase.from("test").insert({
    //   description: description,
    //   name: name,
    //   url: url,
    //   username: userData.username,
    //   nft_id: nid,
    // });

    // const { error: err } = await supabase
    //   .from("User")
    //   .update({ nfts: userData.nfts + 1 })
    //   .eq("user_id", userAddress);

    // console.log(error, err);
    // router.push(`/pages/${nid}`);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  return (
    <div className="profile-container">
      {/* Banner Section */}
      <div className="banner">
        <img src={userData.Logo} alt="Banner" className="banner-image" />
      </div>

      {/* Profile Section */}
      <div className="profile-section">
        <div className="logo-container">
          <img src={userData.Logo} alt="Logo" className="logo" />
        </div>
        <div className="profile-details">
          <h2 className="username">{userData.username}</h2>
          <p className="description">{userData.description}</p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "Base_Assets" ? "active" : ""}`}
          onClick={() => setActiveTab("Base_Assets")}
        >
          Base Assets
        </button>
        <button
          className={`tab ${activeTab === "Assets" ? "active" : ""}`}
          onClick={() => setActiveTab("Assets")}
        >
          Custom Assets
        </button>
        <button
          className={`tab ${activeTab === "More" ? "active" : ""}`}
          onClick={() => setActiveTab("More")}
        >
          SUI FRENS
        </button>
        <button
          className={`tab ${activeTab === "Create" ? "active" : ""}`}
          onClick={() => setActiveTab("Create")}
        >
          Create NFT
        </button>
      </div>

      {/* NFT Collection Section */}
      {activeTab === "Base_Assets" && (
        <div className="nft-collection">
          {baseurl.length > 0 ? (
            baseurl?.map((url: string, index: number) => (
              <div key={index} style={{ textAlign: "center" }}>
                <img
                  src={url}
                  alt={`Loyalty Card ${index + 1}`}
                  style={{ maxWidth: "200px", height: "auto" }}
                />
              </div>
            ))
          ) : (
            <p>No assets found.</p>
          )}
        </div>
      )}

      {activeTab === "Assets" && (
        <div className="nft-collection">
          {imgurl.length > 0 ? (
            imgurl?.map((url: string, index: number) => (
              <div key={index} style={{ textAlign: "center" }}>
                <img
                  src={url}
                  alt={`Loyalty Card ${index + 1}`}
                  style={{ maxWidth: "200px", height: "auto" }}
                />
              </div>
            ))
          ) : (
            <p>No assets found.</p>
          )}
        </div>
      )}

      {activeTab === "More" && (
        <div className="nft-collection">
          {suiurl.length > 0 ? (
            suiurl?.map((url: string, index: number) => (
              <div key={index} style={{ textAlign: "center" }}>
                <img
                  src={url}
                  alt={`Loyalty Card ${index + 1}`}
                  style={{ maxWidth: "200px", height: "auto" }}
                />
              </div>
            ))
          ) : (
            <p>No assets found.</p>
          )}
        </div>
      )}

      {activeTab === "Create" && (
        <div className="create-nft-form">
          <h2>Create New NFT</h2>
        </div>
      )}
    </div>
  );
};

export default App;
