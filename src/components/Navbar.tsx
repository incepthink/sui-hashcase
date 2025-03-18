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

const workSans = Work_Sans({ subsets: ["latin"] });

export const Navbar = () => {
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();
  // const { openModal, setOpenModal } = useContext(AppContext);
  const { openModal, setOpenModal } = useGlobalAppStore();

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

  const handleModal = () => {
    if (openModal) {
      setOpenModal(false);
    } else {
      setOpenModal(true);
    }
  };
  return (
    <div className="bg-[#00041F]">
      <div className="px-4">
        <div className="flex items-center justify-between gap-x-4 md:px-20 px-4 py-4">
          <div className="flex gap-x-4 items-center md:justify-center justify-between w-full md:w-auto">
            <HashcaseText />
            <div className="md:hidden">
              <Hamburger
                toggled={isOpen}
                toggle={setOpen}
                color="#ffffff"
                easing="ease-in"
                size={25}
              />
            </div>
          </div>
          <div className="border border-white/10 rounded-full px-4 py-2 hidden md:flex">
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
                href="/collections"
                className="hover:bg-white/10 hover:backdrop-blur-md rounded-full transition-colors duration-300 px-4 py-2"
              >
                Collections
              </Link>
              <Link
                href={`/${user_address}`}
                className="hover:bg-white/10 hover:backdrop-blur-md rounded-full transition-colors duration-300 px-4 py-2"
              >
                Profile
              </Link>
            </div>
          </div>

          <button
            onClick={handleModal}
            className="md:flex hidden justify-center items-center gap-x-4 px-4 py-2 border-2 border-b-4 border-[#4DA2FF] text-white font-semibold rounded-full"
          >
            {walletAddress ? (
              walletAddress
            ) : (
              <>
                Connect
                <Wallet />
              </>
            )}
          </button>
        </div>
      </div>
      {isOpen && (
        <div
          className={`md:hidden absolute w-full text-right p-2 flex-col justify-center items-center bg-[#00041F]/10 backdrop-blur-md text-white gap-y-8  ml-auto z-10`}
        >
          <Link className="m-4 flex  justify-start" href={"/"}>
            Home
          </Link>
          <Link className="m-4 flex justify-start" href={"/collections"}>
            Collections
          </Link>
          <Link className="m-4 flex justify-start" href={"#"}>
            Contact Us
          </Link>
          <div className="flex w-full my-4">
            <button
              onClick={handleModal}
              className="flex justify-center items-center gap-x-4 px-4 py-2 border-2 border-b-4 border-[#4DA2FF] text-white font-semibold rounded-full w-full"
            >
              {walletAddress ? (
                walletAddress
              ) : (
                <>
                  Connect
                  <Wallet />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
