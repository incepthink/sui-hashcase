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
import WalletConnectionModal from "@/components/WalletConnectionModal";

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
        <WalletConnectionModal />
      </div>
    </>
  );
}
