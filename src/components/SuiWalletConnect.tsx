"use client";

import { useEffect, useRef, useState } from "react";

import { Wallet as LucideWalletIcon } from "lucide-react"; // Import the Wallet icon

import Image from "next/image";

import {
  ConnectModal as SuiConnectModal,
  useConnectWallet,
  useCurrentAccount,
  useDisconnectWallet,
  useSignPersonalMessage,
  useWallets,
} from "@mysten/dapp-kit";

import { notifyPromise, notifyResolve } from "@/utils/notify";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";

export default function SuiWalletConnect() {
  const { isUserVerified, setUser, setUserWalletAddress, setOpenModal, unsetUser } =
    useGlobalAppStore();

  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const currentAccount = useCurrentAccount();

  //functions to perform things like connect, disconnect wallet
  const { mutateAsync: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();

  //to get the wallets that the user has installed & can be connected to
  const wallets = useWallets();

  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("Available wallets:", wallets);
    console.log("Current account:", currentAccount);
    console.log("Is user verified:", isUserVerified);
  }, [wallets, currentAccount, isUserVerified]);

  const handleUserCreation = async () => {
    if (isUserVerified) return;

    const notifyId = notifyPromise("Connecting...", "info");

    try {
      // Always require message signing for authentication
      const response = await axiosInstance.get("auth/wallet/request-token");
      const message = response.data.message;
      const authToken = response.data.token;

      const signedMessageResponse = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      });

      const res = await axiosInstance.post("auth/sui-wallet/login", {
        signature: signedMessageResponse.signature,
        address: currentAccount!.address,
        token: authToken,
      });

      const token = res.data.token;
      const user_instance = res.data.user_instance;

      const userDataToStoreInGlobalStore = {
        id: user_instance.id,
        walletAddress: user_instance.sui_wallet_address,
        email: user_instance.email,
        badges: user_instance.badges,
        user_name: user_instance.username || "guest_user",
        description:
          user_instance.description || "this is a guest_user description",
        profile_image: user_instance.profile_image,
        banner_image: user_instance.banner_image,
      };

      setUser(userDataToStoreInGlobalStore, token);
      setUserWalletAddress(currentAccount?.address!);

      notifyResolve(notifyId, "Connected", "success");
    } catch (error: unknown) {
      console.log(error);
      notifyResolve(notifyId, "Failed to login", "error");
    } finally {
      setOpenModal(false);
      setCreatingUser(false);
    }
  };

  // used to try to run the effect a single time
  // so that we don't get the message signer popup multiple times
  const ranEffect = useRef(false);

  useEffect(() => {
    // Remove automatic authentication - let user manually trigger it
    setLoading(false);
  }, [currentAccount]);

  const handleWalletConnect = async (wallet: any) => {
    setConnectingWallet(true);
    const notifyId = notifyPromise(`Connecting to ${wallet.name}...`, "info");

    try {
      // First, connect to the wallet
      await connect({ wallet });
      console.log("connected to", wallet.name);
      
      // Wait a bit for the currentAccount to be available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the wallet address - use currentAccount if available, otherwise use wallet address
      const walletAddress = currentAccount?.address || wallet.accounts?.[0]?.address;
      
      if (!walletAddress) {
        throw new Error("No wallet address available");
      }
      
      // After connection, immediately request a signature for authentication
      // This ensures at least one signature is required
      console.log("Requesting authentication token...");
      
      const response = await axiosInstance.get("auth/wallet/request-token") as any;
      
      const message = response.data.message;
      const authToken = response.data.token;
      console.log("Received auth token, requesting signature...");

      const signedMessageResponse = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      });
      console.log("Message signed successfully");

      const res = await axiosInstance.post("auth/sui-wallet/login", {
        signature: signedMessageResponse.signature,
        address: walletAddress,
        token: authToken,
      }) as any;

      const token = res.data.token;
      const user_instance = res.data.user_instance;

      const userDataToStoreInGlobalStore = {
        id: user_instance.id,
        walletAddress: user_instance.sui_wallet_address,
        email: user_instance.email,
        badges: user_instance.badges,
        user_name: user_instance.username || "guest_user",
        description:
          user_instance.description || "this is a guest_user description",
        profile_image: user_instance.profile_image,
        banner_image: user_instance.banner_image,
      };

      setUser(userDataToStoreInGlobalStore, token);
      setUserWalletAddress(walletAddress);
      
      console.log("Wallet connected and authenticated");
      notifyResolve(notifyId, `Successfully connected to ${wallet.name}!`, "success");
    } catch (error: unknown) {
      console.log("Failed to connect to the wallet");
      console.error(error);
      
      // Clear user data immediately
      unsetUser();
      setUserWalletAddress("");
      
      // If wallet is connected but authentication failed, disconnect it
      if (currentAccount?.address) {
        try {
          // Then disconnect the wallet
          await disconnect();
          console.log("Disconnected wallet due to authentication failure");
        } catch (disconnectError: unknown) {
          console.error("Failed to disconnect wallet:", disconnectError);
        }
      }
      
      // Double-check after a short delay and force disconnect if still connected
      setTimeout(async () => {
        if (currentAccount?.address) {
          try {
            await disconnect();
            console.log("Forced disconnect after delay");
          } catch (error: unknown) {
            console.error("Failed to force disconnect:", error);
          }
        }
      }, 500);
      
      // Show more specific error messages
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorResponse = error as any;
      
      if (errorMessage === "No wallet address available") {
        notifyResolve(notifyId, "Wallet connected but no address found", "error");
      } else if (errorResponse?.response?.status === 401) {
        notifyResolve(notifyId, "Authentication failed - please try again", "error");
      } else if (errorResponse?.code === 4001) {
        notifyResolve(notifyId, "User rejected the signature request", "error");
      } else if (errorMessage.includes("Failed to fetch") || errorMessage.includes("TRPCClientError")) {
        notifyResolve(notifyId, "Network error - please check your connection and try again", "error");
      } else if (errorMessage.includes("Unexpected error") || errorMessage.includes("Oe")) {
        notifyResolve(notifyId, "Wallet extension error - please try refreshing the page", "error");
      } else {
        notifyResolve(notifyId, `Failed to connect wallet: ${errorMessage}`, "error");
      }
    } finally {
      setConnectingWallet(false);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      // Clear user data from global store immediately
      unsetUser();
      setUserWalletAddress("");
      // Then disconnect the wallet
      await disconnect();
      console.log("Disconnected wallet");
    } catch (error: unknown) {
      console.log("Failed to disconnect wallet");
      console.error(error);
    }
  };

  if (loading) return <div>Loading Wallets...</div>;

  // Only show connected state if user is verified (fully authenticated)
  if (isUserVerified && currentAccount?.address && !connectingWallet) {
    return (
      <div className="bg-green-600 border-black/20 px-6 py-2 text-white font-semibold rounded-full w-full flex items-center gap-x-8 justify-center">
        <LucideWalletIcon className="w-4 h-4" />
        Wallet Connected
      </div>
    );
  }

  if (!wallets || wallets.length === 0) {
    return <div>No wallets were found</div>;
  }

  return wallets.map((wallet) => (
    <button
      key={wallet.name}
      disabled={connectingWallet}
      className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => handleWalletConnect(wallet)}
    >
      {connectingWallet ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
          Connecting...
        </>
      ) : (
        <>
          <Image src={wallet.icon} alt="Sui Logo" width={20} height={20} />
          {`Connect ${wallet.name} Wallet`}
        </>
      )}
    </button>
  ));
}
