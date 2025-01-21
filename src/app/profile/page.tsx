"use client";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import React, { useState,useEffect, ChangeEvent, FormEvent } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction , useReportTransactionEffects,useCurrentAccount , useSuiClientQuery } from '@mysten/dapp-kit';
import { createClient } from '@supabase/supabase-js'
import { Bounce, toast } from "react-toastify";
import { useZkLogin } from "@mysten/enoki/react";
import "./page.css"

interface SUI_Frens{
  image : string;
  link : string;
  name : string;
  type : string;
}

const App: React.FC = () => {
  const [nfts, setNfts] = useState([]);
  const [userData, setuserData] = useState({
    Logo : "",
    collection_id : "",
    description : "",
    user_id : "",
    username : "",
  });
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();

  const {
  	mutate: signAndExecute,
  	isSuccess,
  	isPending,
  } = useSignAndExecuteTransaction();

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Initialize provider (you'll need to replace with your network)
  const provider = new SuiClient({ url: getFullnodeUrl('testnet') });

  const Hashcase_Loyalty = "0xa5a6b939c0393061a6248098aa6ac4f096d004ba0e3d761c5983780d4f80ad74";
  const SUI_FRENS_Package_ID = "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d";

  useEffect(() => {
    getDatabase();
    //FrensNFTList();
  }, []);

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
    if(data){
      console.log(data.data);
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
        })
        console.log("no wallet");
        console.log(error);
      }else{
        const dd = data![0];
        setuserData({
          Logo : dd.Logo,
          collection_id : dd.collection_id,
          description : dd.description,
          user_id : dd.user_id,
          username : dd.username,
        })
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
  
  //Function Needs Work and Updation
  function FrensNFTList() {
    if (!currentAccount) {
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
    
    const { data, isLoading, error } = useSuiClientQuery('getOwnedObjects', {
      owner: currentAccount.address,
      filter: {
        Package: SUI_FRENS_Package_ID
      },
      options: {
        showDisplay: true,
        showContent: true,
        showType: true
      }
    })
    if(error){console.log(Error)}else{console.log(data);}
  }
  

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
        <button className="tab">Assets</button>
        <button className="tab">More</button>
      </div>

      {/* NFT Collection Section */}
      {/* <div className="nft-collection">
        {nfts.map((nft) => (
          <div key={nft.id} className="nft-card">
            <img src={nft.image} alt={nft.name} className="nft-image" />
            <h3 className="nft-name">{nft.name}</h3>
            <div className="nft-actions">
              <button onClick={() => handleSell(nft.id)} className="nft-button sell-button">Sell</button>
              <button onClick={() => handleClaim(nft.id)} className="nft-button claim-button">Claim</button>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};


export default App;
