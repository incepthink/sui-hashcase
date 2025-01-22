"use client";
import React, { useState,useEffect } from 'react';
import { useCurrentAccount , useSuiClientQuery } from '@mysten/dapp-kit';
import { createClient } from '@supabase/supabase-js'
import { Bounce, toast } from "react-toastify";
import { useZkLogin } from "@mysten/enoki/react";
import { useRouter } from "next/navigation";
import "./page.css"


const App: React.FC = () => {
  const [userData, setuserData] = useState({
    Logo : "",
    collection_id : "",
    description : "",
    user_id : "",
    username : "",
    nfts: 0
  });
  const [activeTab, setActiveTab] = useState("Base_Assets");
  const [formValues, setFormValues] = useState({
    description: "",
    name: "",
    url: "",
  });
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();

  const router = useRouter();

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const Hashcase_Loyalty = "0xa5a6b939c0393061a6248098aa6ac4f096d004ba0e3d761c5983780d4f80ad74";
  const SUI_FRENS_Package_ID = "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d";
  const base_loyalty = "0xb92dbbdb90ea755f8ea371d3e4658687fc4a1e9f6b13264e358c7d27da7514a7"

  useEffect(() => {
    getDatabase();
  }, []);
  let imgurl:string[] = [];
  let suiurl:string[] = [];
  let baseurl:string[] = [];

  if(currentAccount || address){
    let adr:string;

    if(currentAccount){adr = currentAccount.address}else{adr = address!};

    const { data, isLoading, error } = useSuiClientQuery('getOwnedObjects', {
      owner: adr,
      filter: {
        Package: Hashcase_Loyalty
      },
      options: {
        showDisplay: true,
        showContent: true,
        showType: true
      }
    })
    
      {const { data, isLoading, error } = useSuiClientQuery('getOwnedObjects', {
        owner: adr,
        filter: {
          Package: base_loyalty
        },
        options: {
          showDisplay: true,
          showContent: true,
          showType: true
        }
      })

      console.log(data);
      if(data){
      const imageUrls = data?.data
    ?.filter((item: any) => item?.data?.content?.fields?.image_url)
    .map((item: any) => item.data.content.fields.image_url);
    baseurl = imageUrls;}
    }

    if(data){
      const imageUrls = data?.data
    ?.filter((item: any) => item?.data?.content?.fields?.image_url)
    .map((item: any) => item.data.content.fields.image_url);
    imgurl = imageUrls;
    }
  }
  

  const getDatabase = async () => {
    if (currentAccount || address) {
      let adr:string;

      if(currentAccount){adr = currentAccount.address}else{adr = address!};

      const { data, error } = await supabase
      .from('User')
      .select()
      .eq('user_id', adr)
      console.log(data);
      console.log(error);

      if(data?.length == 0){
        alert("Your Profile Does Not exists and we have created a new one");
        const { error } = await supabase
        .from('User')
        .insert({ 
          Logo : "https://www.hashcase.co/images/hashCase-metadata-image.jpeg",
          collection_id : "0x",
          description : "lorem Ipsum",
          user_id : adr,
          username : adr,
          nfts: 0, 
        })
        console.log("no wallet");
        console.log(error);
        return("done");
      }else{
        const dd = data![0];
        setuserData({
          Logo : dd.Logo,
          collection_id : dd.collection_id,
          description : dd.description,
          user_id : dd.user_id,
          username : dd.username,
          nfts: dd.nfts,
        })
        return("done");
      }
    }else{
      toast.error("Please connect your wallet first", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
  }

  function FrensNFTList() {
    if (!currentAccount && !address) {
      toast.error("Please connect your wallet first", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    let adr:string;
    if(currentAccount){adr = currentAccount.address}else{adr = address!};
    
    const { data, isLoading, error } = useSuiClientQuery('getOwnedObjects', {
      owner: adr,
      filter: {
        Package: SUI_FRENS_Package_ID
      },
      options: {
        showDisplay: true,
        showContent: true,
        showType: true
      }
    })

    if(data){
      const imageUrls = data?.data
    ?.map((item: any) => item?.data?.display?.data?.image_url)
    .filter((url: string | undefined) => url);
    suiurl=imageUrls;
    }
  }
  FrensNFTList();

  const createNFT = async(description:string,name:string,url:string) =>{
    await getDatabase();
    let nid = userData.username+`${userData.nfts+1}`
    let adr:string;

    if(currentAccount){adr = currentAccount.address}else{adr = address!};
    const { error } = await supabase
      .from('test')
      .insert({ 
        description : description,
        name : name,
        url : url,
        username : userData.username,
        nft_id : nid, 
      })
    const { error: err } = await supabase
      .from('User')
      .update({ nfts: userData.nfts+1 })
      .eq('user_id', adr)
    console.log(error,err);
    router.push(`/pages/${nid}`);
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { description, name, url } = formValues;
    createNFT(description, name, url);
  };
  

  return (
    <div className="profile-container">
      {/* Banner Section */}
      <div className="banner">
        <img
          src={userData.Logo}
          alt="Banner"
          className="banner-image"
        />
      </div>

      {/* Profile Section */}
      <div className="profile-section">
        <div className="logo-container">
          <img
            src={userData.Logo}
            alt="Logo"
            className="logo"
          />
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
          onClick={() => {setActiveTab("More");}}
        >
          SUI FRENS
        </button>
        <button
          className={`tab ${activeTab === "Create" ? "active" : ""}`}
          onClick={() => {setActiveTab("Create");}}
        >
          Create NFT
        </button>
      </div>

      {/* NFT Collection Section */}
      {activeTab === "Base_Assets" && (
        <div className="nft-collection">
          {baseurl.length > 0 ? (
            baseurl?.map((url: string, index: number) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <img src={url} alt={`Loyalty Card ${index + 1}`} style={{ maxWidth: '200px', height: 'auto' }} />
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
              <div key={index} style={{ textAlign: 'center' }}>
                <img src={url} alt={`Loyalty Card ${index + 1}`} style={{ maxWidth: '200px', height: 'auto' }} />
              </div>
            ))
          ) : (
            <p>No assets found.</p>
          )}
        </div>
      )}

      {activeTab === "More" && (
        <div className="nft-collection">
          {suiurl.length>0 ? (
            suiurl?.map((url: string, index: number) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <img src={url} alt={`Loyalty Card ${index + 1}`} style={{ maxWidth: '200px', height: 'auto' }} />
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
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">NFT Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="description">Description:</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="url">Image URL:</label>
              <input
                type="text"
                id="url"
                name="url"
                value={formValues.url}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit">Create NFT</button>
          </form>
        </div>
      )}
    </div>
  );
};


export default App;
