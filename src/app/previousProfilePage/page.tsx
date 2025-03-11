"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import "./page.css";
import axiosInstance from "@/utils/axios";

interface UserData {
  Logo: string;
  collection_id: string;
  description: string;
  user_id: string;
  username: string;
  nfts: 0;
}

export default function NFTPage() {
  const params = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("Base_Assets");

  const Hashcase_Loyalty =
    "0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49";
  const SUI_FRENS_Package_ID =
    "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d";
  const base_loyalty =
    "0xb92dbbdb90ea755f8ea371d3e4658687fc4a1e9f6b13264e358c7d27da7514a7";

  // Move the hook calls to the component level
  const { data: hashcaseData } = useSuiClientQuery("getOwnedObjects", {
    owner: userData?.user_id || "",
    filter: { Package: Hashcase_Loyalty },
    options: { showDisplay: true, showContent: true, showType: true },
  });

  const { data: baseData } = useSuiClientQuery("getOwnedObjects", {
    owner: userData?.user_id || "",
    filter: { Package: base_loyalty },
    options: { showDisplay: true, showContent: true, showType: true },
  });

  const { data: suiFrensData } = useSuiClientQuery("getOwnedObjects", {
    owner: userData?.user_id || "",
    filter: { Package: SUI_FRENS_Package_ID },
    options: { showDisplay: true, showContent: true, showType: true },
  });

  // Process the data
  const imgurl =
    hashcaseData?.data
      ?.filter((item: any) => item?.data?.content?.fields?.image_url)
      .map((item: any) => item.data.content.fields.image_url) || [];

  const baseurl =
    baseData?.data
      ?.filter((item: any) => item?.data?.content?.fields?.image_url)
      .map((item: any) => item.data.content.fields.image_url) || [];

  const suiurl =
    suiFrensData?.data
      ?.map((item: any) => item?.data?.display?.data?.image_url)
      .filter((url: string | undefined) => url) || [];

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await axiosInstance.get("/user");

      const user = response.data.user;

      const userWithLogo = {
        ...user,
        Logo: "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg",
      };

      setUserData(userWithLogo);
    };

    if (params.userAddress) {
      fetchUserData();
    }
  }, [params.userAddress]);

  if (!userData) {
    console.log(params.userAddress);
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="banner">
        <img src={userData.Logo} alt="Banner" className="banner-image" />
      </div>

      <div className="profile-section">
        <div className="logo-container">
          <img src={userData.Logo} alt="Logo" className="logo" />
        </div>
        <div className="profile-details">
          <h2 className="username">{userData.username}</h2>
          <p className="description">{userData.description}</p>
        </div>
      </div>

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
      </div>

      {activeTab === "Base_Assets" && (
        <div className="nft-collection">
          {baseurl.length > 0 ? (
            baseurl.map((url, index) => (
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
            imgurl.map((url, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <img
                  src={url}
                  alt={`Custom Asset ${index + 1}`}
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
            suiurl.map((url, index) => (
              <div key={index} style={{ textAlign: "center" }}>
                <img
                  src={url}
                  alt={`SUI Fren ${index + 1}`}
                  style={{ maxWidth: "200px", height: "auto" }}
                />
              </div>
            ))
          ) : (
            <p>No assets found.</p>
          )}
        </div>
      )}
    </div>
  );
}
