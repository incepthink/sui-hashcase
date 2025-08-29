"use client";
import React, { useEffect } from "react";

import Modal from "@/components/Modal";
import ZkLogin from "@/components/ZkLogin";
import SuiWalletConnect from "@/components/SuiWalletConnect";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";

const WalletConnectionModal = () => {
  const { openModal, setOpenModal, isUserVerified } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();

  // Auto-close modal only when user is verified and a wallet address exists
  useEffect(() => {
    const hasWalletAddress = !!(currentAccount?.address || zkAddress);
    if (isUserVerified && hasWalletAddress && openModal) {
      setOpenModal(false);
    }
  }, [isUserVerified, currentAccount?.address, zkAddress, openModal, setOpenModal]);

  return (
    <Modal
      context="Connect Your Wallet"
      openModal={openModal}
      onClose={() => setOpenModal(false)}
    >
      <div className="flex flex-col z-[9999] justify-center items-center gap-y-4 my-4 mx-4">
        {(() => {
          const hasWalletAddress = !!(currentAccount?.address || zkAddress);
          // If no wallet address yet, always show BOTH options so the user can choose
          if (!hasWalletAddress) {
            return (
              <>
                <SuiWalletConnect />
                <ZkLogin setOpenModal={setOpenModal} />
              </>
            );
          }
          // If an address exists, keep showing SuiWalletConnect summary/state
          return <SuiWalletConnect />;
        })()}
      </div>
    </Modal>
  );
};

export default WalletConnectionModal;