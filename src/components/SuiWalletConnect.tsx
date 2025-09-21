"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Wallet as LucideWalletIcon } from "lucide-react";
import Image from "next/image";
import {
  useConnectWallet,
  useCurrentAccount,
  useDisconnectWallet,
  useSignPersonalMessage,
  useWallets,
} from "@mysten/dapp-kit";

import { notifyPromise, notifyResolve } from "@/utils/notify";
import axiosInstance from "@/utils/axios";
import { useGlobalAppStore } from "@/store/globalAppStore";

// ===== TYPE DEFINITIONS =====

interface AuthenticationResult {
  success: boolean;
  cancelled?: boolean;
}

// ===== MAIN COMPONENT =====

export default function SuiWalletConnect() {
  // ===== HOOKS & GLOBAL STATE =====
  const {
    isUserVerified,
    setUser,
    setSuiWallet,
    setOpenModal,
    unsetUser,
    getWalletForChain,
    disconnectWallet,
    setUserHasInteracted,
    isAuthenticating,
    setIsAuthenticating,
    authenticationLock,
    setAuthenticationLock,
    isLoggingOut,
  } = useGlobalAppStore();

  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();

  // ===== LOCAL STATE =====
  const [loading, setLoading] = useState(true);
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // ===== COMPUTED VALUES =====
  // Check if Sui wallet is connected in store
  const suiWallet = getWalletForChain("sui");

  // ===== UTILITY FUNCTIONS =====

  /**
   * Check if authentication can proceed with timeout handling
   */
  const canAuthenticateWithTimeout = useCallback(
    (walletAddress: string): boolean => {
      if (!authenticationLock) return true;

      // If lock is for different wallet, allow
      if (authenticationLock.walletAddress !== walletAddress) return true;

      // If lock is older than 30 seconds, clear it and allow
      const now = Date.now();
      if (now - authenticationLock.timestamp > 30000) {
        console.log("Clearing expired authentication lock");
        setAuthenticationLock(null);
        setIsAuthenticating(false);
        return true;
      }

      return false;
    },
    [authenticationLock, setAuthenticationLock, setIsAuthenticating]
  );

  /**
   * Complete cleanup of all authentication states
   */
  const completeCleanup = useCallback(() => {
    setIsAuthenticating(false);
    setAuthenticationLock(null);
    setConnectingWallet(false);
    setLastError(null);
    unsetUser();
    disconnectWallet("sui");
  }, [setIsAuthenticating, setAuthenticationLock, unsetUser, disconnectWallet]);

  // ===== MAIN AUTHENTICATION LOGIC =====

  /**
   * Handle user authentication process
   * Called automatically after wallet connection or manually
   */
  const handleUserAuthentication = useCallback(
    async (walletAddress: string): Promise<AuthenticationResult> => {
      console.log("Starting Sui authentication for wallet:", walletAddress);

      if (isUserVerified) return { success: true };

      // Check if authentication is already in progress for this wallet
      if (!canAuthenticateWithTimeout(walletAddress)) {
        console.log("Authentication already in progress for this wallet");
        setConnectingWallet(false);
        return { success: false };
      }

      // Set authentication lock
      setIsAuthenticating(true);
      setAuthenticationLock({
        walletAddress,
        timestamp: Date.now(),
      });

      const notificationController = notifyPromise("Authenticating...", "info");

      try {
        setLastError(null);

        // Create abort controller for this authentication
        const authController = new AbortController();

        // Connect the notification cancellation to the auth controller
        const originalCancel = notificationController.cancel;
        notificationController.cancel = () => {
          authController.abort();
          originalCancel();
        };

        // Step 1: Request authentication token with wallet address
        console.log("Requesting authentication token...");

        let response;
        try {
          response = await axiosInstance.get(
            `auth/wallet/request-token/${walletAddress}`,
            {
              signal: authController.signal,
            }
          );
          console.log("Auth token response:", response.data);
        } catch (axiosError: any) {
          // Handle 400 status specifically (user already signed)
          if (axiosError.response && axiosError.response.status === 400) {
            console.log(
              "User has already signed message, setting user data directly"
            );

            const responseData = axiosError.response.data;
            if (responseData.userInstance) {
              const userInstance = responseData.userInstance;
              const userDataToStoreInGlobalStore = {
                id: userInstance.id,
                email: userInstance.email,
                badges: userInstance.badges || [],
                user_name: userInstance.username || "guest_user",
                description:
                  userInstance.description ||
                  "this is a guest_user description",
                profile_image: userInstance.profile_image,
                banner_image: userInstance.banner_image,
              };

              console.log(
                "Setting existing user data in store:",
                userDataToStoreInGlobalStore
              );

              // Set user with empty token as specified
              setUser(userDataToStoreInGlobalStore, "");

              // Set Sui wallet in store
              setSuiWallet({
                address: walletAddress,
                type: "sui-wallet",
              });

              console.log("Authentication successful for existing user!");
              notifyResolve(
                notificationController,
                "Welcome back! Already authenticated.",
                "success"
              );
              return { success: true };
            }
          }

          // Re-throw if it's not a 400 or doesn't have userInstance
          throw axiosError;
        }

        // Normal flow for new users or users who haven't signed
        if (!response.data.message || !response.data.token) {
          throw new Error(
            "Invalid response from auth server - missing message or token"
          );
        }

        const message = response.data.message as string;
        const authToken = response.data.token as string;

        // Step 2: Sign message using Sui wallet
        console.log("Message to sign:", message);
        console.log("Signing message with Sui wallet...");

        let signedMessageResponse;
        try {
          signedMessageResponse = await signPersonalMessage({
            message: new TextEncoder().encode(message),
          });
        } catch (signError: any) {
          console.error("Signing failed:", signError);

          // Handle user rejection specifically
          if (
            signError?.code === 4001 ||
            signError?.message?.includes("User rejected") ||
            signError?.message?.includes("denied")
          ) {
            throw new Error("USER_REJECTED_SIGNATURE");
          }
          throw new Error("Failed to sign message. Please try again.");
        }

        console.log("Valid signature obtained, logging in...");

        // Step 3: Login with the signature
        const res = await axiosInstance.post(
          "auth/sui-wallet/login",
          {
            signature: signedMessageResponse.signature,
            address: walletAddress,
            token: authToken,
          },
          {
            signal: authController.signal,
          }
        );

        console.log("Login response:", res.data);

        if (!res.data.token || !res.data.user_instance) {
          throw new Error(
            "Invalid login response - missing token or user data"
          );
        }

        // Step 4: Store user data
        const token: string = res.data.token;
        const user_instance = res.data.user_instance;

        const userDataToStoreInGlobalStore = {
          id: user_instance.id,
          email: user_instance.email,
          badges: user_instance.badges || [],
          user_name: user_instance.username || "guest_user",
          description:
            user_instance.description || "this is a guest_user description",
          profile_image: user_instance.profile_image,
          banner_image: user_instance.banner_image,
        };

        console.log(
          "Setting user data in store:",
          userDataToStoreInGlobalStore
        );

        setUser(userDataToStoreInGlobalStore, token);

        // Set Sui wallet in store
        setSuiWallet({
          address: walletAddress,
          type: "sui-wallet",
        });

        console.log("Authentication successful!");
        notifyResolve(
          notificationController,
          "Connected successfully!",
          "success"
        );
        return { success: true };
      } catch (error: any) {
        console.error("Authentication error:", error);
        return handleAuthenticationError(error, notificationController);
      } finally {
        // Always clear authentication states
        setIsAuthenticating(false);
        setAuthenticationLock(null);
        setConnectingWallet(false);
      }
    },
    [
      isUserVerified,
      canAuthenticateWithTimeout,
      setIsAuthenticating,
      setAuthenticationLock,
      setUser,
      setSuiWallet,
      completeCleanup,
      signPersonalMessage,
    ]
  );

  // ===== ERROR HANDLING =====

  /**
   * Handle authentication errors with appropriate user feedback
   */
  const handleAuthenticationError = async (
    error: any,
    notificationController: any
  ): Promise<AuthenticationResult> => {
    const errorMessage = error?.message || "Unknown error";
    setLastError(errorMessage);

    // Enhanced error handling with specific cases
    if (error.name === "AbortError") {
      // User cancelled - don't show error notification
      return { success: false, cancelled: true };
    }

    if (errorMessage === "USER_REJECTED_SIGNATURE") {
      notifyResolve(
        notificationController,
        "Signature cancelled. You can try connecting again.",
        "error"
      );
      completeCleanup();

      // Disconnect wallet on user rejection
      if (currentAccount?.address) {
        try {
          disconnect();
        } catch (disconnectError) {
          console.warn(
            "Failed to disconnect after user rejection:",
            disconnectError
          );
        }
      }
      return { success: false };
    }

    // Handle different HTTP error codes
    if (error?.response?.status === 401) {
      notifyResolve(
        notificationController,
        "Authentication failed - invalid credentials",
        "error"
      );
    } else if (error?.response?.status === 429) {
      notifyResolve(
        notificationController,
        "Too many attempts. Please wait before trying again.",
        "error"
      );
    } else if (error?.response?.data?.message) {
      notifyResolve(
        notificationController,
        `Authentication failed: ${error.response.data.message}`,
        "error"
      );
    } else {
      notifyResolve(
        notificationController,
        `Failed to authenticate: ${errorMessage}`,
        "error"
      );
    }

    // Complete cleanup on error
    completeCleanup();

    // Disconnect wallet on authentication failure
    if (currentAccount?.address) {
      try {
        disconnect();
      } catch (disconnectError) {
        console.warn("Failed to disconnect after auth error:", disconnectError);
      }
    }

    return { success: false };
  };

  // ===== EVENT HANDLERS =====

  /**
   * Handle wallet connection and auto-authentication
   */
  const handleWalletConnect = async (wallet: any) => {
    setUserHasInteracted(true);

    // If already connected to this wallet, authenticate directly
    if (currentAccount?.address) {
      const result = await handleUserAuthentication(currentAccount.address);
      if (result.success) {
        setOpenModal(false);
      }
      return;
    }

    setConnectingWallet(true);
    const notificationController = notifyPromise(
      `Connecting to ${wallet.name}...`,
      "info"
    );

    try {
      // Create abort controller for this connection
      const connectController = new AbortController();

      // Connect the notification cancellation to the connect controller
      const originalCancel = notificationController.cancel;
      notificationController.cancel = () => {
        connectController.abort();
        originalCancel();
      };

      await connect({ wallet });
      console.log("connected to", wallet.name);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const walletAddress =
        currentAccount?.address || wallet.accounts?.[0]?.address;

      if (!walletAddress) {
        throw new Error("No wallet address available");
      }

      notifyResolve(
        notificationController,
        "Wallet connected! Authenticating...",
        "success"
      );

      const authResult = await handleUserAuthentication(walletAddress);

      if (authResult.success) {
        console.log("Wallet connected and authenticated successfully");
        setOpenModal(false);
      } else {
        console.log("Wallet connected but authentication failed");
      }
    } catch (error: any) {
      console.log("Failed to connect to the wallet");
      console.error(error);

      // Handle different error types
      if (error.name === "AbortError") {
        // User cancelled - don't show error notification
        return;
      }

      // Complete cleanup on any error
      completeCleanup();

      if (currentAccount?.address) {
        try {
          disconnect();
          console.log("Disconnected wallet due to connection failure");
        } catch (disconnectError: unknown) {
          console.error("Failed to disconnect wallet:", disconnectError);
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage === "No wallet address available") {
        notifyResolve(
          notificationController,
          "Wallet connected but no address found",
          "error"
        );
      } else if (error?.response?.status === 401) {
        notifyResolve(
          notificationController,
          "Authentication failed - please try again",
          "error"
        );
      } else if (error?.code === 4001) {
        notifyResolve(
          notificationController,
          "User rejected the signature request",
          "error"
        );
      } else {
        notifyResolve(
          notificationController,
          `Failed to connect wallet: ${errorMessage}`,
          "error"
        );
      }
    } finally {
      setConnectingWallet(false);
    }
  };

  // ===== EFFECTS =====

  /**
   * Clear any stuck locks on component mount
   */
  useEffect(() => {
    const now = Date.now();
    if (authenticationLock && now - authenticationLock.timestamp > 30000) {
      console.log("Clearing stuck authentication lock on mount");
      setAuthenticationLock(null);
      setIsAuthenticating(false);
    }
  }, []);

  /**
   * AUTO-AUTHENTICATION: Trigger authentication after successful wallet connection
   */
  useEffect(() => {
    // Auto-authenticate when wallet successfully connects
    if (
      currentAccount?.address &&
      !isUserVerified &&
      !isAuthenticating &&
      !isLoggingOut &&
      !connectingWallet &&
      suiWallet?.address === currentAccount.address // Only if this address is in our store
    ) {
      console.log("Auto-triggering authentication after wallet connection");
      handleUserAuthentication(currentAccount.address);
    }
  }, [
    currentAccount?.address,
    isUserVerified,
    isAuthenticating,
    isLoggingOut,
    connectingWallet,
    suiWallet,
    handleUserAuthentication,
  ]);

  /**
   * Debug logging
   */
  useEffect(() => {
    console.log("Available wallets:", wallets);
    console.log("Current account:", currentAccount);
    console.log("Is user verified:", isUserVerified);
    console.log("Sui wallet in store:", suiWallet);
  }, [wallets, currentAccount, isUserVerified, suiWallet]);

  /**
   * Initialize loading state
   */
  useEffect(() => {
    setLoading(false);
  }, [currentAccount]);

  // ===== RENDER CONDITIONS =====

  if (loading) return <div>Loading Wallets...</div>;

  // Show connected state if user is verified and has Sui wallet
  if (
    isUserVerified &&
    suiWallet &&
    currentAccount?.address &&
    !connectingWallet
  ) {
    return (
      <div className="bg-green-600 border-black/20 px-6 py-2 text-white font-semibold rounded-full w-full flex items-center gap-x-8 justify-center">
        <LucideWalletIcon className="w-4 h-4" />
        Sui Wallet Connected & Authenticated
      </div>
    );
  }

  if (!wallets || wallets.length === 0) {
    return <div>No wallets were found</div>;
  }

  // ===== MAIN RENDER =====

  return (
    <>
      {wallets.map((wallet) => (
        <button
          key={wallet.name}
          disabled={connectingWallet || isAuthenticating}
          className="bg-[#ffffff] border-black/20 px-6 py-2 text-black font-semibold rounded-full w-full flex items-center gap-x-8 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleWalletConnect(wallet)}
        >
          {connectingWallet || isAuthenticating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              {isAuthenticating ? "Authenticating..." : "Connecting..."}
            </>
          ) : (
            <>
              <Image
                src={wallet.icon}
                alt="Wallet Logo"
                width={20}
                height={20}
              />
              {`Connect ${wallet.name}`}
            </>
          )}
        </button>
      ))}

      {lastError && !connectingWallet && !isAuthenticating && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
          <p className="text-sm text-red-700">Error: {lastError}</p>
        </div>
      )}
    </>
  );
}
