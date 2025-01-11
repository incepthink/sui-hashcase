"use client";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import React, { useState,useEffect, ChangeEvent, FormEvent } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction , useReportTransactionEffects,useCurrentAccount , useSuiClientQuery } from '@mysten/dapp-kit';
import { createClient } from '@supabase/supabase-js'
import { Bounce, toast } from "react-toastify";
import "./page.css"

const App = () => {
  const [nfts, setNfts] = useState([]);
  const [userData, setuserData] = useState({
    Logo : "",
    collection_id : "",
    description : "",
    user_id : "",
    username : "",
  });
  const currentAccount = useCurrentAccount();

  const {
  	mutate: signAndExecute,
  	isSuccess,
  	isPending,
  } = useSignAndExecuteTransaction();

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Initialize provider (you'll need to replace with your network)
  const provider = new SuiClient({ url: getFullnodeUrl('testnet') });

  const PACKAGE_ID = '0xffb3a94e0400a8711bc9842ee24dc82780b9921ec3bb77970826f3b591ba009e';
  const pid = "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d";

  useEffect(() => {
    getDatabase();
  }, []);

  const getDatabase = async () => {
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

    const { data, error } = await supabase
    .from('User')
    .select()
    .eq('user_id', currentAccount?.address)
    if(data == null){
      // const { error } = await supabase
      // .from('User')
      // .insert({ 
      //   Logo : "",
      //   collection_id : "",
      //   description : "",
      //   user_id : "",
      //   username : "", 
      // })
      console.log("no wallet");
      console.log(error);
    }else{
      const dd = data[0];
      setuserData({
        Logo : dd.Logo,
        collection_id : dd.collection_id,
        description : dd.description,
        user_id : dd.user_id,
        username : dd.username,
      })
    }
  }
  
  //Function Needs Work and Updation
  const FrensNFTList = async() => {
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

    const { data, isLoading, error } = await useSuiClientQuery('getOwnedObjects', {
      owner: currentAccount.address,
      filter: {
        Package: "0x15a2fe781ae848c3f108eddc0298649ed9e76da4e9103b5e0bd6f363cca1d56d"
      },
      options: {
        showDisplay: false,
        showContent: true,
        showType: true
      }
    })
    if(error){console.log(Error)}
    else{
      console.log(data);
      //setNfts(data);
    }
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
        <button className="tab">Items</button>
        <button className="tab">Teams</button>
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
