"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import { LeaderboardPeriod } from "@/utils/enums";
import axiosInstance from "@/utils/axios";

import { useLoyaltyPointsTransactions } from "@/app/hooks/useLoyaltyPointsTransactions";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

import { PlusCircle, MinusCircle } from "lucide-react";
import HeroImage from "@/assets/images/sui-bg.png";
import "./page.css";

type LeaderboardEntry = {
  user_id: number;
  total_points: number;
  rank: number;
};

type Loyalty = {
  id: number;
  owner_id: number;
  code: string;
  value: number;
  type: string;
};

const CollectionLoyaltiesPage = () => {
  const params = useParams();
  const currentAccount = useCurrentAccount();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );

  const [period, setPeriod] = useState<LeaderboardPeriod>(
    LeaderboardPeriod.MONTHLY
  );

  // to store the fetched data
  const [loyaltyCodes, setLoyaltyCodes] = useState<Loyalty[]>([]);

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
    // console.log(period);

    const getOwnerLoyaltyAndLeaderboardData = async () => {
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

      console.log(owner_id);

      console.log(ownerResponse);

      //we get the loyalty codes, by using the owner_id
      const loyaltyReponse = await axiosInstance.get(
        "/platform/get-loyalties",
        {
          params: {
            owner_id: owner_id,
          },
        }
      );

      setLoyaltyCodes(loyaltyReponse.data.loyalties);

      console.log(loyaltyReponse);

      //we get the leaderboard, with the help of the owner_id & the time period
      const response = await axiosInstance.get("/platform/leaderboard", {
        params: {
          owner_id: owner_id,
          period: period,
        },
      });
      const leaderboard = response.data.leaderboard;
      console.log(leaderboard);
      setLeaderboardData(leaderboard);
    };

    getOwnerLoyaltyAndLeaderboardData();
  }, [period]);

  //the following is needed to get the loyalty points of the user.
  //we cannot call a hook inside a function. hence we have to call it like this.

  const { data: fetchedTokenData, isLoading } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: currentAccount?.address!,
      filter: {
        StructType:
          "0x2::token::Token<0xdd9cd4161d083f8ae99adb03dbce45b400263f49975f4c48a6e74488dea285ee::loyalty_points::LOYALTY_POINTS>",
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
          <h1 className="text-5xl font-bold text-white">
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

      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] flex flex-col items-center justify-start p-8 text-white">
        <h1 className="text-4xl font-bold mb-6">Loyalty Codes</h1>
        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="w-full border-collapse rounded-lg shadow-lg bg-white/10 backdrop-blur-lg">
            <thead>
              <tr className="text-left bg-[#3f54b4] text-white">
                <th className="p-4">Code</th>
                <th className="p-4">Value</th>
                <th className="p-4">Type</th>
              </tr>
            </thead>
            <tbody>
              {loyaltyCodes?.map((loyalty) => (
                <tr
                  key={loyalty.id}
                  className="border-b border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <td className="p-4 font-semibold">
                    <button className="bg-[#3f54b4] px-2 py-1 rounded-md">
                      {loyalty.code}
                    </button>
                  </td>
                  <td className="p-4">{loyalty.value}</td>
                  <td className="p-4">{loyalty.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col justify-start items-center gap-6 w-full h-full  bg-gradient-to-b from-[#00041f] to-[#030828] p-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-white text-center">
          Leaderboard
        </h1>

        {/* Time Period Buttons */}
        <div className="flex justify-start items-center gap-6 w-full max-w-6xl mx-auto">
          <button
            onClick={() => setPeriod(LeaderboardPeriod.MONTHLY)}
            className="bg-[#3f54b4] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md"
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod(LeaderboardPeriod.WEEKLY)}
            className="bg-[#3f54b4] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md"
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod(LeaderboardPeriod.DAILY)}
            className="bg-[#3f54b4] text-white text-lg px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-[#2678C2] shadow-md"
          >
            Daily
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="w-full flex flex-col justify-start items-start gap-4 max-w-6xl mx-auto ">
          {/* Table Header */}
          <div className="flex justify-between items-center w-full px-6 py-3 rounded-md text-lg font-semibold text-white bg-white/10 backdrop-blur-lg shadow-lg">
            <p className="w-1/3 text-center">Rank</p>
            <p className="w-1/3 text-center">User ID</p>
            <p className="w-1/3 text-center">Loyalty Points</p>
          </div>

          {/* Leaderboard Entries */}
          {leaderboardData.map((nft, index) => (
            <div
              key={index}
              className="flex justify-between items-center w-full px-6 py-3 rounded-md text-lg text-white bg-white/10 backdrop-blur-lg shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              <p className="w-1/3 text-center">{nft.rank}</p>
              <p className="w-1/3 text-center">{nft.user_id}</p>
              <p className="w-1/3 text-center">{nft.total_points}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CollectionLoyaltiesPage;
