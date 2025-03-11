"use client";

import { useContext, useEffect, useState } from "react";

import Logo from "../assets/icons/sui-sui-logo 1.png";
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

import { AppContext } from "@/context/AppContext";
import { ActionKind } from "@/context/context-types";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";

export default function SuiWalletConnect() {
  const { state, dispatch, setOpenModal } = useContext(AppContext);

  const { isUserVerified, setUser, setUserWalletAddress } = useGlobalAppStore();

  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const currentAccount = useCurrentAccount();

  //functions to perform things like connect, disconnect wallet
  const { mutateAsync: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();

  //to get the wallets that the user has installed & can be connected to
  const wallets = useWallets();

  const [loading, setLoading] = useState(true);

  const handleUserCreation = async () => {
    if (isUserVerified) return;
    const notifyId = notifyPromise("Connecting...", "info");

    try {
      setLoading(true);

      const response = await axiosInstance.get("auth/wallet/request-token");

      const message = response.data.message;
      // console.log(message);
      const authToken = response.data.token;

      signPersonalMessage(
        { message: new TextEncoder().encode(message) },
        {
          onSuccess: async (result) => {
            try {
              const res = await axiosInstance.post("auth/sui-wallet/login", {
                signature: result.signature,
                address: currentAccount!.address,
                token: authToken,
              });

              const token = res.data.token;
              const user_instance = res.data.user_instance;

              // console.log(token);
              // console.log(user_instance);

              const userDataToStoreInGlobalStore = {
                id: user_instance.id,
                walletAddress: user_instance.sui_wallet_address,
                email: user_instance.email,
                badges: user_instance.badges,
              };

              //this will set the user state in our global zustand store
              //it will also set the jwt as a cookie
              setUser(userDataToStoreInGlobalStore, token);
              setUserWalletAddress(currentAccount?.address!);

              // dispatch({
              //   type: ActionKind.SET_USER,
              //   payload: [user_instance, token],
              // });

              notifyResolve(notifyId, "Created User", "success");
            } catch (error) {
              console.error("Error verifying token:", error);
            } finally {
              setLoading(false);
            }
          },
          onError: (err) => {
            notifyResolve(notifyId, "Failed to login", "error");
            console.error("Signing error:", err);
            setLoading(false);
          },
        }
      );
    } catch (error) {
      console.log(error);
      notifyResolve(notifyId, "Failed to login", "error");
      //   return false;
    } finally {
      setOpenModal(false);
    }
  };

  useEffect(() => {
    if (currentAccount) {
      if (!isUserVerified) {
        console.log("call the user create server api");
        handleUserCreation();
      }
    }
  }, [currentAccount]);

  const handleWalletConnect = async (wallet) => {
    try {
      await connect({ wallet });
      console.log("connected to", wallet.name);
      handleUserCreation();
    } catch (error) {
      console.log("Failed to connect to the wallet");
      console.error(error);
    }
  };

  if (currentAccount?.address)
    return (
      <button
        className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
        onClick={() => disconnect()} // Pass the correct wallet
      >
        <LucideWalletIcon className="w-5 h-5" />
        {"Disconnect Wallet"}
      </button>
    );

  if (!wallets || wallets.length === 0) {
    return <div>No wallets were found</div>;
  }

  return wallets.map((wallet) => (
    <button
      key={wallet.name} // Add a unique key for each button
      className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
      onClick={() => handleWalletConnect(wallet)} // Pass the correct wallet
    >
      {" "}
      <Image src={wallet.icon} alt="Sui Logo" width={20} height={20} />
      {"Connect Sui Wallet"}{" "}
    </button>
  ));
}
