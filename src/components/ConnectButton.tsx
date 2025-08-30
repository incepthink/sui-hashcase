'use client';

import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin, useEnokiFlow } from "@mysten/enoki/react";
import { Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDisconnectWallet } from "@mysten/dapp-kit";

const ConnectButton = () => {
  const { openModal, setOpenModal, unsetUser, setUserWalletAddress, isUserVerified, user } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();
  const { mutate: disconnect } = useDisconnectWallet();
  const enokiFlow = useEnokiFlow();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const user_address = currentAccount?.address || address;

  // Debug logging
  useEffect(() => {
    console.log("🔍 ConnectButton Debug:", {
      openModal,
      isUserVerified,
      user,
      currentAccountAddress: currentAccount?.address,
      zkAddress: address,
      user_address,
      walletAddress
    });
  }, [openModal, isUserVerified, user, currentAccount?.address, address, user_address, walletAddress]);

  useEffect(() => {
    // Show wallet address if user is verified OR if we have a zk login address
    if (isUserVerified && currentAccount?.address) {
      setWalletAddress(
        currentAccount.address.slice(0, 10) +
          "..." +
          currentAccount.address.slice(-8)
      );
    } else if (isUserVerified && address) {
      setWalletAddress(address.slice(0, 10) + "..." + address.slice(-8));
    } else if (address) {
      // Show zk login address even if not fully verified yet
      setWalletAddress(address.slice(0, 10) + "..." + address.slice(-8));
    } else {
      // Clear wallet address when not authenticated
      setWalletAddress(null);
    }
  }, [address, currentAccount, isUserVerified]);

  // Additional effect to handle wallet disconnection
  useEffect(() => {
    if (!currentAccount && !address) {
      setWalletAddress(null);
      console.log("Wallet disconnected - cleared wallet address");
    }
  }, [currentAccount, address]);

  const handleModal = () => {
    console.log("🔘 Connect button clicked, current openModal state:", openModal);
    if (openModal) {
      setOpenModal(false);
    } else {
      setOpenModal(true);
    }
  };

  const handleDisconnect = () => {
    console.log("Disconnect button clicked");
    console.log("Current wallet address:", walletAddress);
    console.log("Current account:", currentAccount);
    console.log("ZkLogin address:", address);
    
    // Clear wallet address state immediately for instant UI feedback
    setWalletAddress(null);
    
    // Clear user data from global store immediately
    unsetUser();
    setUserWalletAddress("");
    console.log("Cleared user data from global store");
    
    // Disconnect based on what type of wallet is connected
    if (address) {
      // Zk login logout
      enokiFlow.logout();
      console.log("Called zk login logout");
    } else {
      // Regular wallet disconnect
      disconnect();
      console.log("Called regular wallet disconnect");
    }
  };



  // If wallet is connected and user is verified, show address and disconnect button
  if (walletAddress && (isUserVerified || address)) {
    console.log("✅ ConnectButton: Showing connected state with address:", walletAddress);
    return (
      <div className="ml-10 flex items-center gap-x-3 px-5 py-2.5  border-b-2  text-white border-gray-300 w-max font-semibold rounded-2xl">
        <div className="flex items-center gap-x-3">
          <Wallet className="w-4 h-4" />
          <span>{walletAddress}</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-red-400 hover:text-red-300 font-medium text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // If no wallet connected or not authenticated, show connect button
  console.log("🔘 ConnectButton: Showing connect button");
  return (
    <button
      onClick={handleModal}
      className="flex justify-center items-center gap-x-5 px-6 py-2.5 border-b-2  text-white font-semibold rounded-2xl w-max ml-10"
    >
      Connect
      <Wallet />
    </button>
  );
};

export default ConnectButton;
