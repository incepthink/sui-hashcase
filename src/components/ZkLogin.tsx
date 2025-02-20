"use client";
import React, { useContext, useEffect } from "react";
import {
  useEnokiFlow,
  useZkLogin,
  useZkLoginSession,
} from "@mysten/enoki/react";
import { formatAddress } from "@mysten/sui/utils";
import Google from "../assets/icons/google.png";
import Image from "next/image";
import axiosInstance from "@/utils/axios";
import { ActionKind } from "@/context/context-types";
import { AppContext } from "@/context/AppContext";

interface ZkLoginProps {
  setOpenModal: (open: boolean) => void;
}

const ZkLogin = ({ setOpenModal }: ZkLoginProps) => {
  const { state, dispatch } = useContext(AppContext);

  const clientGoogleId = process.env.NEXT_PUBLIC_CLIENT_ID_GOOGLE;

  const enokiFlow = useEnokiFlow();
  const { address } = useZkLogin();

  const handleUserCreation = async () => {
    if (state.isUserVerified) return;

    const res = await axiosInstance.post("auth/zk-login/login", {
      address: address,
    });

    const token = res.data.token;
    const user_instance = res.data.user_instance;

    dispatch({
      type: ActionKind.SET_USER,
      payload: [user_instance, token],
    });
  };

  useEffect(() => {
    if (address) {
      if (!state.user) {
        console.log("call the user create server api for zklogin");
        handleUserCreation();
      }
    }
  }, [address]);

  const handleSignIn = () => {
    setOpenModal(false);
    const protocol = window.location.protocol;
    const host = window.location.host;

    const redirectUrl = `${protocol}//${host}/login`;

    enokiFlow
      .createAuthorizationURL({
        provider: "google",
        network: "testnet",
        clientId: clientGoogleId!,
        redirectUrl,
        extraParams: {
          scope: ["openid", "email", "profile"],
        },
      })
      .then((url) => {
        window.location.href = url;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  if (address) {
    return (
      <button
        onClick={() => {
          enokiFlow.logout();
        }}
        className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
      >
        <Image src={Google} alt="Google" width={30} height={30} />
        Disconnect From ZkLogin
      </button>
    );
  }

  return (
    <>
      <button
        className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
        onClick={handleSignIn}
      >
        <Image src={Google} alt="Google" width={30} height={30} />
        {address
          ? address.slice(0, 6) + "..." + address.slice(-4)
          : "Login with Google"}
      </button>
      {address
        ? console.log(
            `https://suiexplorer.com/address/${address}?network=testnet`
          )
        : null}
    </>
  );
};

export default ZkLogin;
