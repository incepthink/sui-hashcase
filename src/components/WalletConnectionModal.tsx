"use client";
import React, { useEffect } from "react";
import { useContext, useState } from "react";

import Modal from "@/components/Modal";
import ZkLogin from "@/components/ZkLogin";

import SuiWalletConnect from "@/components/SuiWalletConnect";
import { AppContext } from "@/context/AppContext";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";

const WalletConnectionModal = () => {
  // const [showModal, setShowModal] = useState(false);
  // const { openModal, setOpenModal } = useContext(AppContext);
  const { openModal, setOpenModal } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();

  // Check if any wallet is connected
  const isWalletConnected = currentAccount?.address || address;

  // Auto-close modal when wallet is connected
  useEffect(() => {
    if (isWalletConnected && openModal) {
      setOpenModal(false);
    }
  }, [isWalletConnected, openModal, setOpenModal]);

  return (
    <Modal
      context="Connect Your Wallet"
      openModal={openModal}
      onClose={() => setOpenModal(false)}
    >
      {" "}
      <div className="flex flex-col z-[9999] justify-center items-center gap-y-4 my-4 mx-4">
        {isWalletConnected ? (
          // Show only the connected wallet when wallet is connected
          <SuiWalletConnect />
        ) : (
          // Show both connection options when no wallet is connected
          <>
            <SuiWalletConnect />
            <ZkLogin setOpenModal={setOpenModal} />
          </>
        )}
      </div>
    </Modal>
  );
};

export default WalletConnectionModal;
