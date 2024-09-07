"use client";
import React from "react";
import { useEnokiFlow, useZkLogin } from "@mysten/enoki/react";

interface ZkLoginProps {
  setOpenModal: (open: boolean) => void;
}

const ZkLogin = ({ setOpenModal }: ZkLoginProps) => {
  const CLIENT_ID_GOOGLE =
    "899345727751-h3g8il9amouo0qqg9lk6cuijg5m6vjvq.apps.googleusercontent.com"; //todo pranav vinodan
  // const CLIENT_ID_GOOGLE =
  //   "1048172124002-m8at7os92r09enad8ldvffbnh0ie2gm9.apps.googleusercontent.com"; //? jas krrish singh

  const enokiFlow = useEnokiFlow();
  const { address } = useZkLogin();
  const handleSignIn = () => {
    setOpenModal(false);
    const protocol = window.location.protocol;
    const host = window.location.host;

    const redirectUrl = `${protocol}//${host}/login`;

    enokiFlow
      .createAuthorizationURL({
        provider: "google",
        network: "testnet",
        clientId: CLIENT_ID_GOOGLE!,
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

  return (
    <>
      <button
        className="bg-[#2b2b2b] border-black/20 px-4 py-2 text-white font-semibold rounded-md w-full"
        onClick={handleSignIn}
      >
        {address ? address.slice(0, 6) + "..." + address.slice(-4) : "ZkLogin"}
      </button>
    </>
  );
};

export default ZkLogin;
