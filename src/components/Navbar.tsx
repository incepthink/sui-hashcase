"use client";
import { Wallet } from "lucide-react";
import { useWallet } from "@suiet/wallet-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import Link from "next/link";
import { Work_Sans } from "next/font/google";
import { HashcaseText } from "../assets";
import { AppContext } from "@/context/AppContext";
import { useContext, useEffect, useState } from "react";
import Hamburger from "hamburger-react";
import { useGlobalAppStore } from "@/store/globalAppStore";
import ConnectButton from "./ConnectButton";

const workSans = Work_Sans({ subsets: ["latin"] });

export const Navbar = () => {
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();
  // const { openModal, setOpenModal } = useContext(AppContext);

  const [isOpen, setOpen] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const user_address = currentAccount?.address || address;

  useEffect(() => {
    if (currentAccount?.address) {
      setWalletAddress(
        currentAccount.address.slice(0, 6) +
          "..." +
          currentAccount.address.slice(-4)
      );
    } else if (address) {
      setWalletAddress(address.slice(0, 6) + "..." + address.slice(-4));
    }
  }, [address, currentAccount]);

  return (
    <div className="bg-[#00041F]">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/">
              <HashcaseText />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-xl">
            <Link
              href="/"
              className="text-white hover:text-gray-300 transition-colors px-3 py-2"
            >
              Home
            </Link>
            <Link
              href="/collections"
              className="text-white hover:text-gray-300 transition-colors px-3 py-2"
            >
              Collections
            </Link>
            <Link
              href={`/profile/${user_address}`}
              className="text-white hover:text-gray-300 transition-colors px-3 py-2"
            >
              Profile
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ConnectButton />
            <div className="md:hidden">
              <Hamburger
                toggled={isOpen}
                toggle={setOpen}
                color="#ffffff"
                easing="ease-in"
                size={24}
              />
            </div>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-[#00041F] border-t border-white/10">
          <div className="container mx-auto px-6 py-4 space-y-4">
            <Link className="block text-white py-2" href="/">
              Home
            </Link>
            <Link className="block text-white py-2" href="/collections">
              Collections
            </Link>
            <Link className="block text-white py-2" href={`/profile/${user_address}`}>
              Profile
            </Link>
            <div className="pt-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
