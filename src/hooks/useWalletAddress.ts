import { useCurrentAccount } from "@mysten/dapp-kit";
import { useZkLogin } from "@mysten/enoki/react";
import { useGlobalAppStore } from "@/store/globalAppStore";

/**
 * Single source of truth for wallet connection state.
 *
 * Priority:
 * 1. Zustand store (cookie-persisted) — survives page reload, works for zkLogin
 * 2. useZkLogin() hook — in-memory Enoki session
 * 3. useCurrentAccount() hook — browser extension wallets
 *
 * Use this hook everywhere instead of combining useCurrentAccount + useZkLogin manually.
 */
export function useWalletAddress() {
  const { getWalletForChain, isUserVerified } = useGlobalAppStore();
  const currentAccount = useCurrentAccount();
  const { address: zkAddress } = useZkLogin();

  const suiWallet = getWalletForChain("sui");

  const address =
    isUserVerified && suiWallet?.address
      ? suiWallet.address
      : zkAddress || currentAccount?.address || null;

  const type = isUserVerified && suiWallet?.type
    ? suiWallet.type
    : zkAddress ? "zk-login" : currentAccount?.address ? "sui-wallet" : null;

  return { address, isConnected: !!address, type };
}
