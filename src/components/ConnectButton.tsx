"use client";

import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useZkLogin, useEnokiFlow } from "@mysten/enoki/react";
import { useAccount, useDisconnect as useEvmDisconnect } from "wagmi";
import { Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";

const ConnectButton: React.FC = () => {
  const {
    openModal,
    setOpenModal,
    unsetUser,
    isUserVerified,
    getWalletForChain,
    hasWalletForChain,
    disconnectWallet,
    disconnectAllWallets,
  } = useGlobalAppStore();

  // Wallet connections
  const currentAccount = useCurrentAccount(); // Sui wallet
  const { address: zkAddress } = useZkLogin(); // ZkLogin
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount(); // EVM wallet

  // Disconnect functions
  const { mutate: disconnectSui } = useDisconnectWallet();
  const { disconnect: disconnectEvm } = useEvmDisconnect();
  const enokiFlow = useEnokiFlow();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeWalletType, setActiveWalletType] = useState<
    "sui" | "evm" | null
  >(null);

  // Get wallet info from store
  const suiWallet = getWalletForChain("sui");
  const evmWallet = getWalletForChain("evm");

  // Debug logging
  useEffect(() => {
    console.log("🔍 ConnectButton Debug:", {
      openModal,
      isUserVerified,
      suiWallet,
      evmWallet,
      currentAccountAddress: currentAccount?.address,
      zkAddress,
      evmAddress,
      hasEvm: hasWalletForChain("evm"),
      hasSui: hasWalletForChain("sui"),
    });
  }, [
    openModal,
    isUserVerified,
    suiWallet,
    evmWallet,
    currentAccount?.address,
    zkAddress,
    evmAddress,
    hasWalletForChain,
  ]);

  // Update display based on connected wallets
  useEffect(() => {
    let displayAddress: string | null = null;
    let walletType: "sui" | "evm" | null = null; // <-- key fix: narrow the type

    // Priority: Show EVM if connected, otherwise Sui
    if (isUserVerified && evmWallet && evmAddress) {
      displayAddress = `${evmAddress.slice(0, 10)}...${evmAddress.slice(-8)}`;
      walletType = "evm";
    } else if (isUserVerified && suiWallet) {
      const address = suiWallet.address;
      displayAddress = `${address.slice(0, 10)}...${address.slice(-8)}`;
      walletType = "sui";
    } else if (zkAddress) {
      // Show zkLogin address even if not fully verified yet
      displayAddress = `${zkAddress.slice(0, 10)}...${zkAddress.slice(-8)}`;
      walletType = "sui";
    }

    setWalletAddress(displayAddress);
    setActiveWalletType(walletType); // now matches 'sui' | 'evm' | null
  }, [isUserVerified, suiWallet, evmWallet, zkAddress, evmAddress]);

  // Clear wallet address when nothing is connected
  useEffect(() => {
    if (!currentAccount && !zkAddress && !evmAddress) {
      setWalletAddress(null);
      setActiveWalletType(null);
      console.log("All wallets disconnected - cleared wallet address");
    }
  }, [currentAccount, zkAddress, evmAddress]);

  const handleModal = () => {
    console.log(
      "🔘 Connect button clicked, current openModal state:",
      openModal
    );
    setOpenModal(!openModal);
  };

  const handleDisconnect = () => {
    console.log("Disconnect button clicked");
    console.log("Active wallet type:", activeWalletType);
    console.log("Current wallets:", { suiWallet, evmWallet });

    // Clear wallet address state immediately for instant UI feedback
    setWalletAddress(null);
    setActiveWalletType(null);

    // Clear user data from global store immediately
    unsetUser();
    disconnectAllWallets();
    console.log("Cleared user data from global store");

    // Disconnect based on active wallet type or disconnect all
    if (activeWalletType === "evm" && evmAddress) {
      disconnectEvm();
      console.log("Called EVM wallet disconnect");
    } else if (activeWalletType === "sui") {
      if (zkAddress) {
        // enokiFlow.logout is defined by @mysten/enoki
        enokiFlow.logout?.();
        console.log("Called zk login logout");
      } else if (currentAccount) {
        disconnectSui();
        console.log("Called Sui wallet disconnect");
      }
    } else {
      // Disconnect all if unsure
      if (evmAddress) disconnectEvm();
      if (zkAddress) enokiFlow.logout?.();
      if (currentAccount) disconnectSui();
      console.log("Disconnected all wallets");
    }
  };

  // If any wallet is connected and user is verified (or zk logged in), show address and disconnect button
  if (walletAddress && (isUserVerified || zkAddress)) {
    const walletTypeDisplay = activeWalletType === "evm" ? "EVM" : "Sui";

    console.log(
      "✅ ConnectButton: Showing connected state with address:",
      walletAddress
    );
    return (
      <div className="ml-4 sm:ml-6 md:ml-10 flex items-center gap-x-2 sm:gap-x-3 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-white border-gray-300 w-max font-medium sm:font-semibold rounded-2xl text-xs sm:text-sm md:text-base">
        <div className="flex items-center gap-x-2 sm:gap-x-3">
          <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{walletAddress}</span>
          <span className="sm:hidden">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <span className="text-xs opacity-75">({walletTypeDisplay})</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-red-400 hover:text-red-300 font-medium text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Disconnect</span>
          <span className="sm:hidden">✕</span>
        </button>
      </div>
    );
  }

  // If no wallet connected or not authenticated, show connect button
  console.log("🔘 ConnectButton: Showing connect button");
  return (
    <button
      onClick={handleModal}
      className="flex justify-center items-center gap-x-2 sm:gap-x-3 md:gap-x-5 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 border-b-2 text-white font-medium sm:font-semibold rounded-2xl w-max ml-4 sm:ml-6 md:ml-10 text-xs sm:text-sm md:text-base"
    >
      <span className="hidden sm:inline">Connect</span>
      <span className="sm:hidden">Connect</span>
      <Wallet className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
    </button>
  );
};

export default ConnectButton;
