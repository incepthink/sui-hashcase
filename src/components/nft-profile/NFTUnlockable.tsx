// @/components/nft/NFTUnlockable.tsx
interface NFTUnlockableProps {
  content: string;
}

export default function NFTUnlockable({ content }: NFTUnlockableProps) {
  return (
    <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
      <h3 className="font-semibold text-orange-200 mb-2 flex items-center gap-2">
        <span>🔒</span> Unlockable Content
      </h3>
      <p className="text-sm text-orange-100">{content}</p>
    </div>
  );
}
