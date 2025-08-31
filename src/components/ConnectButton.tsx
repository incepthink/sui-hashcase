"use client";

import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin, useEnokiFlow } from "@mysten/enoki/react";
import { Wallet } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useDisconnectWallet } from "@mysten/dapp-kit";
import axiosInstance from "@/utils/axios";
import { AppContext } from "@/context/AppContext";
import { ActionKind } from "@/context/context-types";

const ConnectButton = () => {
  const {
    openModal,
    setOpenModal,
    unsetUser,
    setUserWalletAddress,
    isUserVerified,
    user,
    setUser,
  } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();
  const { mutate: disconnect } = useDisconnectWallet();
  const enokiFlow = useEnokiFlow();

  const { state, dispatch } = useContext(AppContext);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const user_address = currentAccount?.address || address;

  const handleUserCreation = async () => {
    if (isUserVerified) return;

    const res = await axiosInstance.post("auth/zk-login/login", {
      address: address,
    });
    console.log("AUTH RES", res);

    const token = res.data.token;
    const user_instance = res.data.user_instance;

    // Update AppContext
    dispatch({
      type: ActionKind.SET_USER,
      payload: [user_instance, token],
    });

    // Also update global app store for ConnectButton compatibility
    const userDataToStoreInGlobalStore = {
      id: user_instance.id,
      walletAddress: user_instance.sui_wallet_address || address,
      email: user_instance.email,
      badges: user_instance.badges,
      user_name: user_instance.username || "guest_user",
      description:
        user_instance.description || "this is a guest_user description",
      profile_image: user_instance.profile_image,
      banner_image: user_instance.banner_image,
    };

    setUser(userDataToStoreInGlobalStore, token);
  };

  useEffect(() => {
    if (address) {
      if (!state.user) {
        console.log("call the user create server api for zklogin");
        handleUserCreation();
      }
    }
  }, [address]);

  // Debug logging
  useEffect(() => {
    console.log("🔍 ConnectButton Debug:", {
      openModal,
      isUserVerified,
      user,
      currentAccountAddress: currentAccount?.address,
      zkAddress: address,
      user_address,
      walletAddress,
    });
  }, [
    openModal,
    isUserVerified,
    user,
    currentAccount?.address,
    address,
    user_address,
    walletAddress,
  ]);

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
    console.log(
      "🔘 Connect button clicked, current openModal state:",
      openModal
    );
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
