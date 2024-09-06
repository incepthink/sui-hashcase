"use client";
import React, { useEffect } from "react";
import { useEnokiFlow, useZkLogin } from "@mysten/enoki/react";
import { useAuthCallback } from "@mysten/enoki/react";

const ZkLogin = () => {
  // const CLIENT_ID_GOOGLE =
  //   "899345727751-h3g8il9amouo0qqg9lk6cuijg5m6vjvq.apps.googleusercontent.com"; //! pranav vinodan
  const CLIENT_ID_GOOGLE =
    "1048172124002-m8at7os92r09enad8ldvffbnh0ie2gm9.apps.googleusercontent.com"; //? jas krrish singh

  const enokiFlow = useEnokiFlow();
  const handleSignIn = () => {
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
      {/* {address ? (
        <button className="px-4 font-semibold text-xl py-2 bg-white text-black rounded-md">
          Connected
        </button>
      ) : ( */}
      <button
        className="px-4 font-semibold text-xl py-2 bg-white text-black rounded-md"
        onClick={handleSignIn}
      >
        ZkLogin
      </button>
      {/* )} */}
    </>
  );
};

export default ZkLogin;
