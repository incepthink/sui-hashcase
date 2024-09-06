"use client";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ProductShowcase } from "@/components/ProductShowcase";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricingdemo";
import ExploreSection from "@/components/ExploreSection";
import "@mysten/dapp-kit/dist/index.css";
import { useState } from "react";
import Modal from "@/components/Modal";
import ZkLogin from "@/components/ZkLogin";
import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import { ConnectModal as SuietConnectModal } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";

export default function Home() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="overflow-x-hidden">
        <Navbar setOpenModal={setOpenModal} />
        <Hero />
        <Features />
        <ProductShowcase />
        <ExploreSection />
        <Pricing />
        <CallToAction />
        <Modal openModal={openModal} onClose={() => setOpenModal(false)}>
          <div className="flex flex-col justify-center items-center gap-y-4 my-4 mx-4">
            <ConnectModal
              trigger={
                <button
                  className="bg-[#2b2b2b] border-black/20 px-4 py-2 text-white font-semibold rounded-md w-full"
                  disabled={!!currentAccount}
                >
                  {" "}
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
              <button className="bg-[#2b2b2b] border-black/20 px-4 py-2 text-white font-semibold rounded-md w-full">
                Suiet Wallet
              </button>
            </SuietConnectModal>
            <ZkLogin />
          </div>
        </Modal>
      </div>
      <Footer />
    </>
  );
}
