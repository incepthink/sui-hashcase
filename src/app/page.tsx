"use client";
import { Hero } from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import ExploreSection from "@/components/ExploreSection";
import "@mysten/dapp-kit/dist/index.css";
import { useContext, useState } from "react";
import Modal from "@/components/Modal";
import ZkLogin from "@/components/ZkLogin";
import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import { ConnectModal as SuietConnectModal } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import Collectable from "@/components/Collectable";
import Logo from "../assets/icons/sui-sui-logo 1.png";
import SuietLogo from "../assets/icons/suietlogo.png";
import Image from "next/image";
import { AppContext } from "@/context/AppContext";

export default function Home() {
  const { openModal, setOpenModal } = useContext(AppContext);
  const [showModal, setShowModal] = useState(false);
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="bg-[#00041F]">
        <Hero />
        <Features />
        <hr className="md:m-[100px] m-[20px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        <ExploreSection />
        <hr className="md:m-[100px] m-[20px] bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
        <Collectable />
        <Modal
          context="Connect Your Wallet"
          openModal={openModal}
          onClose={() => setOpenModal(false)}
        >
          <div className="flex flex-col justify-center items-center gap-y-4 my-4 mx-4">
            <ConnectModal
              trigger={
                <button
                  className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
                  disabled={!!currentAccount}
                  onClick={() => setOpenModal(false)}
                >
                  {" "}
                  <Image src={Logo} alt="Sui Logo" width={20} height={20} />
                  {currentAccount ? "Connected" : "Sui Wallet"}
                </button>
              }
              open={open}
              onOpenChange={(isOpen) => setOpen(isOpen)}
            />
            <SuietConnectModal
              open={showModal}
              onOpenChange={(open) => setShowModal(open)}
            >
              <button
                onClick={() => setOpenModal(false)}
                className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8"
              >
                <Image
                  src={SuietLogo}
                  alt="Suiet Logo"
                  width={20}
                  height={20}
                />
                Suiet Wallet
              </button>
            </SuietConnectModal>
            <ZkLogin setOpenModal={setOpenModal} />
          </div>
        </Modal>
        <Footer />
      </div>
    </>
  );
}
