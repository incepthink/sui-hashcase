"use client";

import { useContext, useEffect, useState } from "react";

import Logo from "../assets/icons/sui-sui-logo 1.png";
import Image from "next/image";

import {
  ConnectModal as SuiConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";

import { AppContext } from "@/context/AppContext";
import { ActionKind } from "@/context/context-types";
import { notifyPromise, notifyResolve } from "@/utils/notify";
import axiosInstance from "@/utils/axios";

export default function SuiWalletConnect() {
  const { state, dispatch, setOpenModal } = useContext(AppContext);

  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const handleUserCreation = async () => {
    if (state.isUserVerified) return;
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
              dispatch({
                type: ActionKind.SET_USER,
                payload: [user_instance, token],
              });
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
      if (!state.user) {
        console.log("call the user create server api");
        handleUserCreation();
      }
    }
  }, [currentAccount]);

  if (currentAccount) {
    return (
      <button
        className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
        onClick={() => disconnect()}
      >
        {" "}
        <Image src={Logo} alt="Sui Logo" width={20} height={20} />
        {"Disconnect Wallet"}
      </button>
    );
  }

  return (
    <SuiConnectModal
      trigger={
        <button
          className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
          disabled={!!currentAccount}
          onClick={handleUserCreation}
        >
          {" "}
          <Image src={Logo} alt="Sui Logo" width={20} height={20} />
          {"Connect Sui Wallet"}
        </button>
      }
      open={open}
      onOpenChange={(isOpen) => setOpen(isOpen)}
    />
  );
}
