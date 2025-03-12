"use client";
import React, { useEffect } from "react";
import { useContext, useState } from "react";

import Modal from "@/components/Modal";
import ZkLogin from "@/components/ZkLogin";

import SuiWalletConnect from "@/components/SuiWalletConnect";
import { AppContext } from "@/context/AppContext";
import { useGlobalAppStore } from "@/store/globalAppStore";

const WalletConnectionModal = () => {
  // const [showModal, setShowModal] = useState(false);
  // const { openModal, setOpenModal } = useContext(AppContext);
  const { openModal, setOpenModal } = useGlobalAppStore();

  return (
    <Modal
      context="Connect Your Wallet"
      openModal={openModal}
      onClose={() => setOpenModal(false)}
    >
      {" "}
      <div className="flex flex-col justify-center items-center gap-y-4 my-4 mx-4">
        <SuiWalletConnect />
        <ZkLogin setOpenModal={setOpenModal} />
      </div>
    </Modal>
  );
};

export default WalletConnectionModal;
