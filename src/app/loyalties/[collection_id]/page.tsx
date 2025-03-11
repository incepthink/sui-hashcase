"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import axiosInstance from "@/utils/axios";

import { useLoyaltyPointsTransactions } from "@/app/hooks/useLoyaltyPointsTransactions";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

import { PlusCircle, MinusCircle } from "lucide-react";
import HeroImage from "@/assets/images/sui-bg.png";
import "./page.css";

import { useGlobalAppStore } from "@/store/globalAppStore";

import LeaderboardTable from "./LeaderboardTable";
import LoyaltyCodesTable from "./LoyaltyCodesTable";

const CollectionLoyaltiesPage = () => {
  const params = useParams();
  const currentAccount = useCurrentAccount();

  const userTokenType =
    process.env.NEXT_PUBLIC_USER_TOKEN_TYPE ||
    "0x2::token::Token<0xdcbdbd4ef617c266d71cb8b5042d09cfcf2895bb7e05b1cbebd8adb5fc6f1f8d::loyalty_points::LOYALTY_POINTS>";

  const { user } = useGlobalAppStore();

  const [ownerId, setOwnerId] = useState();

  //to track the number of loyalty points to be added or subtracted
  const [points, setPoints] = useState<string>();

  //hooks to perform loyalty transactions
  const { addLoyaltyPoints, spendLoyaltyPoints } =
    useLoyaltyPointsTransactions();

  const handleAddLoyaltyPoints = (user_token_id: string) => {
    if (points) {
      addLoyaltyPoints(user_token_id, points);
    }
  };

  const handleSpendLoyaltyPoints = (user_token_id: string) => {
    if (points) {
      spendLoyaltyPoints(user_token_id, points);
    }
  };

  useEffect(() => {
    const getOwnerData = async () => {
      //we get owner information by using collection
      const ownerResponse = await axiosInstance.get(
        "/platform/owner-by-collection",
        {
          params: {
            collection_id: params.collection_id,
          },
        }
      );

      const owner_id = ownerResponse.data.owner_instance.id;
      setOwnerId(owner_id);
    };

    getOwnerData();
  }, []);

  //the following is needed to get the loyalty points of the user.
  //we cannot call a hook inside a function. hence we have to call it like this.

  const { data: fetchedTokenData, isLoading } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: currentAccount?.address!,
      filter: {
        StructType: userTokenType,
      },

      options: {
        showDisplay: true,
        showContent: true,
        showType: true,
      },
    }
  );

  if (isLoading) return <div>Loading</div>;

  if (!fetchedTokenData)
    return <div>Unable to get data from the blockchain</div>;

  let user_token_id: string;
  if (fetchedTokenData.data[0]?.data?.objectId) {
    user_token_id = fetchedTokenData.data[0]?.data?.objectId;
  }

  const UserTokenData = fetchedTokenData.data[0];

  const onChainPoints = (UserTokenData?.data?.content as any)?.fields?.balance;

  return (
    <>
      <div className="w-full min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[#00041f] to-[#030828] px-10">
        {/* Left Side: Image */}
        <div className="w-1/2 flex justify-center">
          <Image
            src={HeroImage}
            alt="Loyalty Points"
            className="w-full h-auto max-w-lg opacity-80 mix-blend-overlay"
          />
        </div>

        <div className="w-1/2 flex flex-col items-start justify-center text-left space-y-6">
          <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg">
            {onChainPoints
              ? `On-Chain Loyalty Points : ${onChainPoints} `
              : `Fetching Loyalty Points`}
          </h1>
          <p className="text-lg text-white/70">
            Secure, transparent, and decentralized loyalty system powered by
            blockchain.
          </p>

          {/* Input Field */}
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Enter Loyalty Points"
            className="w-full md:w-3/4 px-4 py-3 text-lg rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF] transition-all duration-300"
          />

          {/* Buttons */}
          <div className="flex gap-6">
            <button
              onClick={() => handleAddLoyaltyPoints(user_token_id)}
              className="flex items-center gap-2 bg-[#4DA2FF] hover:bg-[#2678C2] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md"
            >
              <PlusCircle size={24} />
              Add Points
            </button>
            <button
              onClick={() => handleSpendLoyaltyPoints(user_token_id)}
              className="flex items-center gap-2 bg-[#FF6B6B] hover:bg-[#D43C3C] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md"
            >
              <MinusCircle size={24} />
              Spend Points
            </button>
          </div>
        </div>
      </div>

      {ownerId && user && <LoyaltyCodesTable owner_id={ownerId} user={user} />}

      {ownerId && <LeaderboardTable owner_id={ownerId} />}
    </>
  );
};

export default CollectionLoyaltiesPage;
