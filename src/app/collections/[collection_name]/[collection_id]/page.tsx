// sui

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppSnackbar } from "@/providers/SnackbarProvider";

import { useLoyaltyPointsTransactions } from "@/app/hooks/useLoyaltyPointsTransactions";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useAccount } from "wagmi";

import { useGlobalAppStore } from "@/store/globalAppStore";
import { useWalletAddress } from "@/hooks/useWalletAddress";
import { useCollectionById } from "@/hooks/useCollections";

import LeaderboardTable from "@/components/collection/LeaderboardTable";
import LoyaltyCodesTable from "@/components/collection/LoyaltyCodesTable";
import ContentSkeleton from "@/components/collectionShell/ContentSkeleton";
import { collectionTheme } from "@/components/collectionShell/theme";

export default function CollectionPointsPage() {
  const { showError } = useAppSnackbar();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams();
  const currentAccount = useCurrentAccount();
  const { address: evmAddress } = useAccount();
  const { user } = useGlobalAppStore();
  const { isConnected: hasSuiWallet } = useWalletAddress();

  const hasEvmWallet = !!evmAddress;

  const userTokenType =
    process.env.NEXT_PUBLIC_USER_TOKEN_TYPE ||
    "0x2::token::Token<0xdcbdbd4ef617c266d71cb8b5042d09cfcf2895bb7e05b1cbebd8adb5fc6f1f8d::loyalty_points::LOYALTY_POINTS>";

  const [onChainPointsState, setOnChainPointsState] = useState(0);
  const [offChainPointsState, setOffChainPointsState] = useState(0);
  const [points, setPoints] = useState<string>("");
  const [userTokenId, setUserTokenId] = useState<string | null>(null);

  const { spendLoyaltyPoints } = useLoyaltyPointsTransactions();

  // Fetch collection data
  const {
    collection,
    isLoading: isCollectionLoading,
    isError: isCollectionError,
  } = useCollectionById(params.collection_id as string);

  // Get owner_id directly from collection data
  const ownerId = collection?.owner_id;

  // Handle points update from loyalty codes
  const handlePointsUpdate = (newPoints: number) => {
    setOffChainPointsState(newPoints);
  };

  // Fetch token data - only for Sui wallets
  const {
    data: fetchedTokenData,
    isLoading: isTokenLoading,
    refetch: refetchTokenData,
  } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: currentAccount?.address!,
      filter: {
        StructType: userTokenType,
      },
      options: {
        showDisplay: true,
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!currentAccount?.address,
    }
  );

  // Process token data and set states
  useEffect(() => {
    if (fetchedTokenData?.data?.[0]?.data?.objectId) {
      setUserTokenId(fetchedTokenData.data[0].data.objectId);
      const balance = (fetchedTokenData.data[0].data?.content as any)?.fields
        ?.balance;
      if (balance !== undefined) {
        setOnChainPointsState(balance);
      }
    }
  }, [fetchedTokenData]);

  // For zk login users and EVM users, set on-chain points to 0
  useEffect(() => {
    if ((hasSuiWallet && !currentAccount?.address) || hasEvmWallet) {
      setOnChainPointsState(0);
    }
  }, [hasSuiWallet, currentAccount?.address, hasEvmWallet]);

  const handleSpendLoyaltyPoints = async () => {
    if (points && userTokenId) {
      await spendLoyaltyPoints(userTokenId, points);
      const { data } = await refetchTokenData();
      if (data?.data?.[0]?.data?.content) {
        const newBalance = (data.data[0].data.content as any)?.fields?.balance;
        setOnChainPointsState(newBalance);
      }
      setPoints("");
    } else {
      showError("Please enter an amount and ensure you have loyalty tokens");
    }
  };

  // Show loading skeleton for token data
  if (isTokenLoading && hasSuiWallet && !hasEvmWallet) {
    return <ContentSkeleton theme={collectionTheme} variant="points" />;
  }

  if (!mounted) return null;

  return (
    <>
      {ownerId && (
        <LoyaltyCodesTable
          owner_id={ownerId}
          onPointsUpdate={handlePointsUpdate}
          collection={collection}
          theme={collectionTheme}
        />
      )}
      {ownerId && <LeaderboardTable owner_id={ownerId} />}
    </>
  );
}
