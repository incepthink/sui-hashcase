// @/components/nft/NFTUnlockable.tsx
interface NFTUnlockableProps {
  content: string;
  isOwner: boolean;
}

export default function NFTUnlockable({ content, isOwner }: NFTUnlockableProps) {
  const dummyText = "Connect your wallet and mint this NFT to unlock exclusive content.";

  return (
    <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
      {isOwner ? (
        <>
          <h3 className="font-semibold text-orange-200 mb-2 flex items-center gap-2">
            <span>🔒</span> Unlockable Content
          </h3>
          <p className="text-sm text-orange-100">{content}</p>
        </>
      ) : (
        <>
          <h3 className="font-semibold text-orange-200 mb-2 flex items-center gap-2">
            <span>🔐</span> Mint the NFT to view Unlockable Content
          </h3>
          <p className="text-sm text-orange-100 blur-sm select-none">{dummyText}</p>
        </>
      )}
    </div>
  );
}
