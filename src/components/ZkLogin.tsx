"use client";
import React, { useContext, useEffect, useState } from "react";
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

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

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
    setLoading(false);
  }, [address]);

  const handleSignIn = () => {
    setRedirecting(true);
    const protocol = window.location.protocol;
    const host = window.location.host;

    // Store current page URL for redirect after authentication
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem('zklogin_redirect_url', currentPath);

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
        setRedirecting(false);
      });


      
  };

  if (loading) {
    return <div>Loading Enoki Login...</div>;
  }

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

  if (redirecting) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 py-4">
        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <div className="text-white/80 text-sm">Redirecting to Google...</div>
      </div>
    );
  }

  return (
    <>
      <button
        className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
        onClick={handleSignIn}
        disabled={redirecting}
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
