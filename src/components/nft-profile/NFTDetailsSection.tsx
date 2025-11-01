import { Metadata } from "./types";
import NFTHeader from "./NFTHeader";
import NFTPrice from "./NFTPrice";
import NFTStatus from "./NFTStatus";
import NFTAttributes from "./NFTAttributes";
import NFTLocation from "./NFTLocation";
import NFTUnlockable from "./NFTUnlockable";
import NFTOwnerInfo from "./NFTOwnerInfo";
import NFTContractInfo from "./NFTContractInfo";
import NFTAdditionalDetails from "./NFTAdditionalDetails";
import { useGlobalAppStore } from "@/store/globalAppStore";

interface NFTDetailsSectionProps {
  metadata: Metadata;
  ownerAddress?: string;
}

export default function NFTDetailsSection({
  metadata,
  ownerAddress,
}: NFTDetailsSectionProps) {
  const { connectedWallets } = useGlobalAppStore();
  
  const connectedUserAddress = connectedWallets?.sui?.address || connectedWallets?.evm?.address;
  const isOwner = !!(connectedUserAddress && ownerAddress && 
    connectedUserAddress.toLowerCase() === ownerAddress.toLowerCase());

  return (
    <div className="space-y-6">
      <NFTHeader metadata={metadata} />

      {ownerAddress && (
        <NFTOwnerInfo
          ownerAddress={ownerAddress}
          chainName={metadata.collection?.chain_name}
        />
      )}

      {metadata.price && <NFTPrice price={metadata.price} />}

      <NFTStatus metadata={metadata} />

      {metadata.attributes && (
        <NFTAttributes attributes={metadata.attributes} />
      )}

      {(metadata.latitude || metadata.longitude) && (
        <NFTLocation
          latitude={metadata.latitude}
          longitude={metadata.longitude}
        />
      )}

      {metadata.unlockable_content && (
        <NFTUnlockable content={metadata.unlockable_content} isOwner={isOwner} />
      )}

      {/* {metadata.collection?.contract && (
        <NFTContractInfo
          contract={metadata.collection.contract}
          chainName={metadata.collection.chain_name}
        />
      )} */}

      <NFTAdditionalDetails metadata={metadata} />
    </div>
  );
}
