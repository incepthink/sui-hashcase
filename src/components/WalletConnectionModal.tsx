// sui wallet connection modal
"use client";
import React, { useEffect, useState } from "react";

import Modal from "@/components/Modal";
import ZkLogin from "@/components/ZkLogin";
import SuiWalletConnect from "@/components/SuiWalletConnect";
import { useGlobalAppStore } from "@/store/globalAppStore";
// import { useAutoOpenModal } from "@/hooks/useAutoOpenModal";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";

const WalletConnectionModal = () => {
  const {
    openModal,
    setOpenModal,
    isUserVerified,
    getWalletForChain,
    hasWalletForChain,
    setUserHasInteracted,
    unsetUser,
    disconnectAllWallets,
  } = useGlobalAppStore();

  // Enable auto-open functionality
  // const { hasAutoOpened } = useAutoOpenModal({ enabled: true });

  // State for email-based connection
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Wallet hooks for disconnect functionality
  const currentAccount = useCurrentAccount(); // Sui wallet
  const { address: zkAddress } = useZkLogin(); // Sui zkLogin

  // Get Sui wallet state from store ONLY
  const suiWallet = getWalletForChain("sui");

  // Check for pending state (wallet connected but not authenticated)
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let pending = false;

    // Check if any Sui wallet is connected but user not verified
    if ((currentAccount?.address || zkAddress) && !isUserVerified) {
      pending = true;
    }

    setIsPending(pending);
  }, [currentAccount, zkAddress, isUserVerified]);

  // Auto-close modal when user is verified and has Sui wallet
  useEffect(() => {
    const hasWallet = hasWalletForChain("sui");
    if (hasWallet && isUserVerified && openModal) {
      console.log("Auto-closing modal - user verified with wallet");
      setOpenModal(false);
    }
  }, [isUserVerified, suiWallet, openModal, setOpenModal, hasWalletForChain]);

  const handleZkLoginSuccess = () => {
    console.log("ZkLogin successful");
    setEmailSubmitted(false);
    setEmail("");
    // Modal will auto-close via the useEffect above when user becomes verified
  };

  const handleEmailSubmit = () => {
    if (email && email.includes("@")) {
      setEmailSubmitted(true);
    }
  };

  const resetEmailFlow = () => {
    setEmailSubmitted(false);
    setEmail("");
  };

  // Mark user interaction when modal opens
  useEffect(() => {
    if (openModal) {
      setUserHasInteracted(true);
    }
  }, [openModal, setUserHasInteracted]);

  // Handle complete disconnect - clears all wallet connections
  const handleCompleteDisconnect = async () => {
    try {
      console.log("Initiating complete disconnect...");

      // Clear user data from global store immediately
      unsetUser();
      disconnectAllWallets();

      // Complete disconnect from all wallet providers
      // Note: Specific disconnect methods would depend on your Sui wallet implementation
      // You may need to add disconnect methods for Sui wallets and zkLogin

      // Additional cleanup - clear any localStorage tokens or session data
      if (typeof window !== "undefined") {
        // Clear any auth tokens stored in localStorage
        localStorage.removeItem("authToken");
        localStorage.removeItem("userToken");
        localStorage.removeItem("walletConnect");
        localStorage.removeItem("suiWallet");
        localStorage.removeItem("zkLogin");

        // Clear any session storage
        sessionStorage.clear();
      }

      // Reset email flow
      resetEmailFlow();

      console.log("Complete disconnect successful");
    } catch (error) {
      console.error("Error during complete disconnect:", error);
    }
  };

  return (
    <Modal
      context="Connect Wallet"
      openModal={openModal}
      onClose={() => {
        setOpenModal(false);
        resetEmailFlow();
      }}
    >
      <div className="flex flex-col z-[9999] justify-center items-center gap-y-4 my-4 mx-4">
        {/* Auto-opened indicator (optional - for user awareness) */}
        {/* {hasAutoOpened && openModal && (
          <div className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg mb-2">
            <div className="text-xs text-blue-700 text-center">
              Complete your wallet authentication to continue
            </div>
          </div>
        )} */}

        {/* Connection Status (if already connected and verified) */}
        {suiWallet && isUserVerified && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <div className="text-sm text-green-800">
              <div className="font-medium mb-1">
                ✅ Wallet Connected & Authenticated:
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  {suiWallet.type === "zk-login" ? "Google (ZK)" : "Sui"}:{" "}
                  {suiWallet.address.slice(0, 8)}...
                  {suiWallet.address.slice(-6)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status (if connected but not authenticated) */}
        {suiWallet && !isUserVerified && (
          <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <div className="text-sm text-yellow-800">
              <div className="font-medium mb-1">
                ⚠️ Wallet Connected - Authentication Required:
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>
                  {suiWallet.type === "zk-login" ? "Google (ZK)" : "Sui"}:{" "}
                  {suiWallet.address.slice(0, 8)}...
                  {suiWallet.address.slice(-6)}
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                Complete authentication below to finish connecting
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {/* {!suiWallet && (
          <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Connect Your Wallet</div>
              <p className="text-xs text-blue-700">
                Choose a wallet below to connect. After connecting, you'll need
                to authenticate to complete the process.
              </p>
            </div>
          </div>
        )} */}

        {/* ZkLogin Section */}
        <div className="w-full space-y-3 mt-2">
          <ZkLogin setOpenModal={setOpenModal} />
        </div>

        {/* Divider */}
        <div className="flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Sui Wallet Connection */}
        <div className="w-full space-y-3">
          <SuiWalletConnect />
        </div>

        {/* Disconnect Button - Show when in pending state */}
        {/* {isPending && (
          <div className="w-full pt-4 border-t border-gray-200">
            <button
              onClick={handleCompleteDisconnect}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Disconnect All Wallets
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Having trouble? Try disconnecting and reconnecting your wallet.
            </p>
          </div>
        )} */}

        {/* Instructions Footer */}
        <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-600 text-center">
            <p className="font-medium mb-1">How it works:</p>
            <ol className="text-left space-y-1">
              <li>1. Connect your wallet using one of the options above</li>
              <li>2. Sign a message to verify ownership</li>
              <li>3. Complete authentication to access all features</li>
            </ol>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WalletConnectionModal;
