"use client";
import React, { useEffect } from "react";

import Modal from "@/components/Modal";
import ZkLogin from "@/components/ZkLogin";
import SuiWalletConnect from "@/components/SuiWalletConnect";
import { useGlobalAppStore } from "@/store/globalAppStore";

const WalletConnectionModal = () => {
  const { openModal, setOpenModal, isUserVerified } = useGlobalAppStore();

  // Auto-close modal only when user is fully verified/authenticated
  useEffect(() => {
    if (isUserVerified && openModal) {
      setOpenModal(false);
    }
  }, [isUserVerified, openModal, setOpenModal]);

  return (
    <Modal
      context="Connect Your Wallet"
      openModal={openModal}
      onClose={() => setOpenModal(false)}
    >
      <div className="flex flex-col z-[9999] justify-center items-center gap-y-4 my-4 mx-4">
        {isUserVerified ? (
          // After verification, keep showing the connected wallet summary/state
          <SuiWalletConnect />
        ) : (
          // Show both connection options when not verified
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