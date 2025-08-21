"use client";
import { Wallet } from "lucide-react";
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
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const workSans = Work_Sans({ subsets: ["latin"] });

export const Navbar = () => {
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();
  const router = useRouter();

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
    <div className="sticky top-0 z-50 backdrop-blur bg-gray-900 py-5 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center w-1/3">
            <Link href={"/"} className="flex items-center">
              <HashcaseText />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center w-1/3">
            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 shadow-lg">
              <Link
                href="/"
                className="hover:bg-white/10 hover:backdrop-blur-md rounded-full transition-all duration-300 px-4 py-2 text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Home
              </Link>
              <Link
                href="/collections"
                className="hover:bg-white/10 hover:backdrop-blur-md rounded-full transition-all duration-300 px-4 py-2 text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Collections
              </Link>
              <button
                onClick={() => {
                  if (user_address) {
                    router.push(`/profile/${user_address}`);
                  } else {
                    toast.error("Please connect your wallet to view your profile");
                  }
                }}
                className="hover:bg-white/10 hover:backdrop-blur-md rounded-full transition-all duration-300 px-4 py-2 text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Profile
              </button>
            </div>
          </div>

          {/* Connect / Controls - right aligned */}
          <div className="ml-auto flex items-center gap-3">
            <ConnectButton />
            
            {/* Mobile Menu Button */}
            <div className="md:hidden ml-2">
              <Hamburger
                toggled={isOpen}
                toggle={setOpen}
                color="#ffffff"
                easing="ease-in"
                size={25}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full z-[9999] bg-[#00041F]/95 backdrop-blur-md border-t border-white/10 shadow-lg">
          <div className="flex flex-col px-6 py-4 gap-y-1">
            <Link 
              className="w-full px-4 py-3  transition-colors text-white font-medium" 
              href={"/"}
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link 
              className="w-full px-4 py-3 hover:text-white/10 transition-colors text-white font-medium" 
              href={"/collections"}
              onClick={() => setOpen(false)}
            >
              Collections
            </Link>
            <Link 
              className="w-full px-4 py-3 hover:text-white/10 transition-colors text-white font-medium" 
              href={"/loyalties"}
              onClick={() => setOpen(false)}
            >
              Loyalties
            </Link>
            <button
              onClick={() => {
                if (user_address) {
                  router.push(`/profile/${user_address}`);
                  setOpen(false);
                } else {
                  toast.error("Please connect your wallet to view your profile");
                }
              }}
              className="w-full text-left rounded-lg px-4 py-3 hover:bg-white/10 transition-colors text-white font-medium"
            >
              Profile
            </button>
            <div className="border-t border-white/10 mt-4 pt-4">
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};