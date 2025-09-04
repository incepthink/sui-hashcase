"use client";
import React, { useEffect, useState } from "react";

import Modal from "@/components/Modal";
import ZkLogin from "@/components/ZkLogin";
import SuiWalletConnect from "@/components/SuiWalletConnect";
import EVMWalletConnect from "@/components/WalletConnect/EvmWalletConnect";
import { useGlobalAppStore } from "@/store/globalAppStore";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import { useAccount } from "wagmi";

interface WalletConnectionModalProps {
  requiredChain?: "sui" | "evm";
}

const WalletConnectionModal = ({
  requiredChain,
}: WalletConnectionModalProps) => {
  const {
    openModal,
    setOpenModal,
    isUserVerified,
    getWalletForChain,
    hasWalletForChain,
  } = useGlobalAppStore();

  // Wallet connections
  const currentAccount = useCurrentAccount(); // Sui wallet
  const { address: zkAddress } = useZkLogin(); // Sui zkLogin
  const { address: evmAddress } = useAccount(); // EVM wallet

  const [activeTab, setActiveTab] = useState<"sui" | "evm">("sui");

  // Get wallet states from store
  const suiWallet = getWalletForChain("sui");
  const evmWallet = getWalletForChain("evm");

  // Auto-close modal when user is verified and has required wallet
  useEffect(() => {
    let shouldClose = false;

    if (requiredChain === "sui" && hasWalletForChain("sui") && isUserVerified) {
      shouldClose = true;
    } else if (
      requiredChain === "evm" &&
      hasWalletForChain("evm") &&
      isUserVerified
    ) {
      shouldClose = true;
    } else if (
      !requiredChain &&
      isUserVerified &&
      (hasWalletForChain("sui") || hasWalletForChain("evm"))
    ) {
      shouldClose = true;
    }

    if (shouldClose && openModal) {
      setOpenModal(false);
    }
  }, [
    isUserVerified,
    suiWallet,
    evmWallet,
    openModal,
    setOpenModal,
    requiredChain,
    hasWalletForChain,
  ]);

  // Set active tab based on required chain
  useEffect(() => {
    if (requiredChain) {
      setActiveTab(requiredChain);
    }
  }, [requiredChain]);

  const renderSuiWalletContent = () => {
    // If already connected to Sui wallet, show connection status
    if (suiWallet && (currentAccount?.address || zkAddress)) {
      return <SuiWalletConnect />;
    }

    // If no Sui wallet connected, show both options
    return (
      <div className="space-y-3">
        <SuiWalletConnect />
        <ZkLogin setOpenModal={setOpenModal} />
      </div>
    );
  };

  const renderEvmWalletContent = () => {
    return <EVMWalletConnect />;
  };

  const renderTabContent = () => {
    if (activeTab === "evm") {
      return renderEvmWalletContent();
    } else {
      return renderSuiWalletContent();
    }
  };

  const getModalTitle = () => {
    if (requiredChain) {
      return `Connect Your ${requiredChain.toUpperCase()} Wallet`;
    }
    return "Connect Your Wallet";
  };

  const getWarningMessage = () => {
    if (!requiredChain) return null;

    const chainName = requiredChain === "sui" ? "Sui" : "EVM";
    const walletTypes =
      requiredChain === "sui"
        ? "Sui wallet or Google (ZkLogin)"
        : "EVM wallet (MetaMask, Phantom, Coinbase, etc.)";

    return (
      <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              {chainName} Wallet Required
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              This action requires a {walletTypes} connection to continue.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      context={getModalTitle()}
      openModal={openModal}
      onClose={() => setOpenModal(false)}
    >
      <div className="flex flex-col z-[9999] justify-center items-center gap-y-4 my-4 mx-4">
        {/* Chain Selection Tabs (only show if no specific chain required) */}
        {!requiredChain && (
          <div className="flex w-full rounded-lg bg-gray-100 p-1 mb-4">
            <button
              onClick={() => setActiveTab("sui")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "sui"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>Sui Network</span>
                {suiWallet && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("evm")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "evm"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>EVM Networks</span>
                {evmWallet && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Connection Status Summary (only show if no specific chain required) */}
        {!requiredChain && (suiWallet || evmWallet) && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">Connected Wallets:</div>
              {suiWallet && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    Sui: {suiWallet.address.slice(0, 8)}...
                    {suiWallet.address.slice(-6)}
                  </span>
                </div>
              )}
              {evmWallet && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>
                    EVM: {evmWallet.address.slice(0, 8)}...
                    {evmWallet.address.slice(-6)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Required Chain Warning */}
        {getWarningMessage()}

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </Modal>
  );
};

export default WalletConnectionModal;
