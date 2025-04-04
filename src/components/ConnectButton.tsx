import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import { Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";

const ConnectButton = () => {
  const { openModal, setOpenModal } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address } = useZkLogin();

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
  );
};

export default ConnectButton;
