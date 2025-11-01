import Link from "next/link";
import { Lock, Link as LinkIcon } from "lucide-react";

// @/components/nft/NFTUnlockable.tsx
interface NFTUnlockableProps {
  content: string;
  isOwner: boolean;
}

const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

export default function NFTUnlockable({ content, isOwner }: NFTUnlockableProps) {
  const dummyText = "Connect your wallet and mint this NFT to unlock exclusive content.";

  return (
    <div className="bg-gradient-to-br from-purple-900/40 via-slate-900/40 to-blue-900/40 backdrop-blur-md rounded-2xl p-6 border border-purple-500/40 shadow-lg">
      {isOwner ? (
        <>
          <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300 mb-4 flex items-center gap-3">
            <Lock className="w-6 h-6 text-green-400" /> Unlockable Content
          </h3>
          {isValidUrl(content) ? (
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/15 transition-colors">
              <LinkIcon className="w-5 h-5 flex-shrink-0 text-blue-400" />
              <Link
                href={content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-blue-300 hover:text-blue-100 hover:underline break-all transition-colors duration-200 flex-1"
              >
                {content}
              </Link>
            </div>
          ) : (
            <p className="text-sm text-purple-100 leading-relaxed font-medium">{content}</p>
          )}
        </>
      ) : (
        <>
          <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-4 flex items-center gap-3">
            <Lock className="w-6 h-6 text-red-400" /> Mint the NFT to Unlock
          </h3>
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <p className="text-sm text-purple-100 blur-sm select-none leading-relaxed">{dummyText}</p>
          </div>
        </>
      )}
    </div>
  );
}
