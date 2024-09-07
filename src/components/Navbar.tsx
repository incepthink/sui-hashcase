"use client";
import { Wallet } from "lucide-react";
import { useWallet } from "@suiet/wallet-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import Link from "next/link";
import { Work_Sans } from "next/font/google";
import { Logo } from "../assets";
import Image from "next/image";

const workSans = Work_Sans({ subsets: ["latin"] });

interface NavbarProps {
  setOpenModal: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setOpenModal }) => {
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();

  const handleModal = () => {
    if (currentAccount || wallet.address || address) {
      setOpenModal(false);
    } else {
      setOpenModal(true);
    }
  };
  return (
    <div className="bg-[#00041F]">
      <div className="px-4">
        <div className="flex items-center justify-between gap-x-4 px-20 py-4">
          <div className="flex gap-x-4 items-center justify-center">
            <Logo />
            <p className="text-3xl font-bold text-white">SUI</p>
          </div>
          <div className="border border-white/10 rounded-full px-4 py-2">
            <div
              className={`flex gap-x-12 items-center justify-center text-xl text-white ${workSans.className}`}
            >
              <Link
                href="/"
                className="hover:bg-white/10 hover:backdrop-blur-md rounded-full transition-colors duration-300 px-4 py-2"
              >
                Home
              </Link>
              <Link
                href="/mint"
                className="hover:bg-white/10 hover:backdrop-blur-md rounded-full transition-colors duration-300 px-4 py-2"
              >
                Mint
              </Link>
              <Link
                href="/contact"
                className="hover:bg-white/10 hover:backdrop-blur-md rounded-full transition-colors duration-300 px-4 py-2"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div>
            <button
              onClick={handleModal}
              className="flex justify-center items-center gap-x-4 px-4 py-2 border-2 border-b-4 border-[#4DA2FF] text-white font-semibold rounded-full"
            >
              {currentAccount ? (
                currentAccount.address.slice(0, 6) +
                "..." +
                currentAccount.address.slice(-4)
              ) : wallet.address ? (
                wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4)
              ) : address ? (
                address.slice(0, 6) + "..." + address.slice(-4)
              ) : (
                <>
                  Connect
                  <Wallet />
                </>
              )}
            </button>
            ;
          </div>
        </div>
      </div>
    </div>
  );
};
