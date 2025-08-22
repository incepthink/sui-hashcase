"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import axiosInstance from "@/utils/axios";

import { useLoyaltyPointsTransactions } from "@/app/hooks/useLoyaltyPointsTransactions";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";

import { PlusCircle, MinusCircle } from "lucide-react";
import HeroImage from "@/assets/images/sui-bg.png";

import { useGlobalAppStore } from "@/store/globalAppStore";

import LeaderboardTable from "./LeaderboardTable";
import LoyaltyCodesTable from "./LoyaltyCodesTable";
import QuestsTable from "./QuestsTable";
import BadgesTable from "./BadgesTable";

const CollectionLoyaltiesPage = () => {
  const params = useParams();
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();
  const { user } = useGlobalAppStore();

  // Check if any wallet is connected (Sui wallet or zk Google login)
  const isWalletConnected = !!(currentAccount?.address || zkAddress);

  const userTokenType =
    process.env.NEXT_PUBLIC_USER_TOKEN_TYPE ||
    "0x2::token::Token<0xdcbdbd4ef617c266d71cb8b5042d09cfcf2895bb7e05b1cbebd8adb5fc6f1f8d::loyalty_points::LOYALTY_POINTS>";

  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [onChainPointsState, setOnChainPointsState] = useState(0);
  const [points, setPoints] = useState<string>("");
  const [userTokenId, setUserTokenId] = useState<string | null>(null);

  const { addLoyaltyPoints, spendLoyaltyPoints } =
    useLoyaltyPointsTransactions();

  // States to handle the tab change
  const [activeTab, setActiveTab] = useState<"loyalty" | "quests" | "badges">(
    "loyalty"
  );

  const handleTabChange = (tab: "loyalty" | "quests" | "badges") => {
    setActiveTab(tab);
  };

  // Fetch owner data
  useEffect(() => {
    const getOwnerData = async () => {
      try {
        const ownerResponse = await axiosInstance.get(
          "/platform/owner-by-collection",
          {
            params: {
              collection_id: params.collection_id,
            },
          }
        );
        setOwnerId(ownerResponse.data.owner_instance.id);
      } catch (error) {
        console.error("Error fetching owner data:", error);
      }
    };

    getOwnerData();
  }, [params.collection_id]);

  // Fetch token data
  // Add refetch capability to the query
  const {
    data: fetchedTokenData,
    isLoading,
    refetch: refetchTokenData,
  } = useSuiClientQuery(
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
    },
    {
      enabled: !!currentAccount?.address, // Only enable for Sui wallet, not zk login
    }
  );

  // Process token data and set states
  useEffect(() => {
    if (fetchedTokenData?.data?.[0]?.data?.objectId) {
      setUserTokenId(fetchedTokenData.data[0].data.objectId);
      const balance = (fetchedTokenData.data[0].data?.content as any)?.fields
        ?.balance;
      if (balance !== undefined) {
        setOnChainPointsState(balance);
      }
    }
  }, [fetchedTokenData]);

  // For zk login users, we don't have on-chain tokens, so show 0 or fetch from backend
  useEffect(() => {
    if (zkAddress && !currentAccount?.address) {
      // For zk login users, set on-chain points to 0 or fetch from backend
      setOnChainPointsState(0);
    }
  }, [zkAddress, currentAccount?.address]);

  const handleAddLoyaltyPoints = async () => {
    if (points && userTokenId) {
      await addLoyaltyPoints(userTokenId, points);
      // Refetch the token data to get updated balance
      const { data } = await refetchTokenData();
      if (data?.data?.[0]?.data?.content) {
        const newBalance = (data.data[0].data.content as any)?.fields?.balance;
        setOnChainPointsState(newBalance);
      }
      setPoints(""); // Clear input after operation
    }
  };

  const handleSpendLoyaltyPoints = async () => {
    if (points && userTokenId) {
      await spendLoyaltyPoints(userTokenId, points);
      // Refetch the token data to get updated balance
      const { data } = await refetchTokenData();
      if (data?.data?.[0]?.data?.content) {
        const newBalance = (data.data[0].data.content as any)?.fields?.balance;
        setOnChainPointsState(newBalance);
      }
      setPoints(""); // Clear input after operation
    }
  };

  if (isLoading) return <div>Loading</div>;

  // Check if wallet is connected
  if (!isWalletConnected) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glowing background elements */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900/20 to-transparent -skew-x-12 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3"></div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-400 to-purple-500 drop-shadow-lg leading-tight">
            Connect Wallet
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-8 leading-relaxed max-w-2xl">
            Please connect your wallet to view and manage your loyalty points
          </p>
        </div>
      </div>
    );
  }

  // For zk login users, skip blockchain data check since they don't have on-chain tokens
  if (!currentAccount?.address && zkAddress) {
    // Zk login user - show the main content without on-chain points
    return (
      <>
        <div className="w-full min-h-[70vh] flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Glowing background elements */}
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900/20 to-transparent -skew-x-12 -translate-x-1/3"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3"></div>

          {/* Left Side: Image with enhanced styling */}
          <div className="w-full lg:w-1/2 flex justify-center items-center relative z-10 px-4 py-8 lg:py-0">
            <div className="relative w-full max-w-md group">
              <Image
                src={HeroImage}
                alt="Loyalty Points"
                width={600}
                height={600}
                className="w-full h-auto rounded-xl shadow-2xl transform transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 rounded-xl mix-blend-overlay"></div>
              <div className="absolute -inset-4 rounded-xl border-2 border-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start justify-center text-left space-y-6 relative z-10 px-4 py-8 lg:py-0">
            <div className="max-w-lg">
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-400 to-purple-500 drop-shadow-lg leading-tight">
                <span className="text-white">Loyalty Points</span>
                <span className="block text-2xl sm:text-3xl mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Zk Login User
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
                Welcome! You&apos;re connected via zk Google login. You can participate in quests and earn loyalty points.
              </p>

              <div className="space-y-6 w-full">
                <div className="relative">
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    placeholder="Enter points amount"
                    className="w-full px-5 py-4 text-lg rounded-xl bg-white/5 text-white placeholder-white/40 border focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30"
                    disabled
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-3 bg-gray-600 text-white text-lg px-6 py-4 rounded-xl font-medium opacity-60 cursor-not-allowed"
                  >
                    <PlusCircle size={24} className="flex-shrink-0" />
                    <span>Add Points (Sui Wallet Only)</span>
                  </button>
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-3 bg-gray-600 text-white text-lg px-6 py-4 rounded-xl font-medium opacity-60 cursor-not-allowed"
                  >
                    <MinusCircle size={24} className="flex-shrink-0" />
                    <span>Spend Points (Sui Wallet Only)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navbar Element */}
        <div className="bg-[#00041f] flex justify-center pt-10">
          <div className="backdrop-blur-sm rounded-xl border p-2 flex gap-4 shadow-md">
            {[
              { key: "loyalty", label: "Loyalty Codes" },
              { key: "quests", label: "Quests" },
              { key: "badges", label: "Badges" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as any)}
                className={`relative px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 
            ${
              activeTab === tab.key
                ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
              >
                {tab.label}
                {/* Neon border glow on hover */}
                <span
                  className={`absolute inset-0 rounded-lg pointer-events-none transition duration-300 ${
                    activeTab === tab.key
                      ? "ring-2 ring-blue-500/40"
                      : "hover:ring-1 hover:ring-purple-500/20"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {ownerId && activeTab === "loyalty" && (
          <LoyaltyCodesTable owner_id={ownerId} />
        )}
        {ownerId && activeTab === "loyalty" && (
          <LeaderboardTable owner_id={ownerId} />
        )}

        {ownerId && activeTab === "badges" && <BadgesTable owner_id={ownerId} />}

        {ownerId && activeTab === "quests" && <QuestsTable owner_id={ownerId} user_id={user?.id} />}
      </>
    );
  }

  if (!fetchedTokenData)
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glowing background elements */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900/20 to-transparent -skew-x-12 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3"></div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-400 to-purple-500 drop-shadow-lg leading-tight">
            Loading Blockchain Data
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 mb-8 leading-relaxed max-w-2xl">
            Fetching your loyalty points from the blockchain...
          </p>
        </div>
      </div>
    );

  return (
    <>
      <div className="w-full min-h-[70vh] flex flex-col lg:flex-row items-center justify-center bg-gradient-to-br from-[#000212] via-[#03082a] to-[#0a0e3a] px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glowing background elements */}
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-900/20 to-transparent -skew-x-12 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/20 to-transparent skew-x-12 translate-x-1/3"></div>

        {/* Left Side: Image with enhanced styling */}
        <div className="w-full lg:w-1/2 flex justify-center items-center relative z-10 px-4 py-8 lg:py-0">
          <div className="relative w-full max-w-md group">
            <Image
              src={HeroImage}
              alt="Loyalty Points"
              width={600}
              height={600}
              className="w-full h-auto rounded-xl shadow-2xl transform transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 rounded-xl mix-blend-overlay"></div>
            <div className="absolute -inset-4 rounded-xl border-2 border-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start justify-center text-left space-y-6 relative z-10 px-4 py-8 lg:py-0">
          <div className="max-w-lg">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-400 to-purple-500 drop-shadow-lg leading-tight">
              {onChainPointsState !== undefined ? (
                <>
                  On-Chain <span className="text-white">Loyalty Points</span>
                  <span className="block text-2xl sm:text-3xl mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    {onChainPointsState} Points
                  </span>
                </>
              ) : (
                "Fetching Loyalty Points..."
              )}
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
              Earn and redeem points in our secure, transparent, and
              decentralized loyalty ecosystem powered by blockchain technology.
            </p>

            <div className="space-y-6 w-full">
              <div className="relative">
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="Enter points amount"
                  className="w-full px-5 py-4 text-lg rounded-xl bg-white/5 text-white placeholder-white/40 border focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/30"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddLoyaltyPoints}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-lg px-6 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5"
                >
                  <PlusCircle size={24} className="flex-shrink-0" />
                  <span>Add Points</span>
                </button>
                <button
                  onClick={handleSpendLoyaltyPoints}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white text-lg px-6 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5"
                >
                  <MinusCircle size={24} className="flex-shrink-0" />
                  <span>Spend Points</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar Element */}
      <div className="bg-[#00041f] flex justify-center pt-10">
        <div className="backdrop-blur-sm rounded-xl border p-2 flex gap-4 shadow-md">
          {[
            { key: "loyalty", label: "Loyalty Codes" },
            { key: "quests", label: "Quests" },
            { key: "badges", label: "Badges" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`relative px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 
          ${
            activeTab === tab.key
              ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
            >
              {tab.label}
              {/* Neon border glow on hover */}
              <span
                className={`absolute inset-0 rounded-lg pointer-events-none transition duration-300 ${
                  activeTab === tab.key
                    ? "ring-2 ring-blue-500/40"
                    : "hover:ring-1 hover:ring-purple-500/20"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {ownerId && activeTab === "loyalty" && (
        <LoyaltyCodesTable owner_id={ownerId} />
      )}
      {ownerId && activeTab === "loyalty" && (
        <LeaderboardTable owner_id={ownerId} />
      )}

      {ownerId && activeTab === "badges" && <BadgesTable owner_id={ownerId} />}

      {ownerId && activeTab === "quests" && <QuestsTable owner_id={ownerId} user_id={user?.id} />}
    </>
  );
};

export default CollectionLoyaltiesPage;
