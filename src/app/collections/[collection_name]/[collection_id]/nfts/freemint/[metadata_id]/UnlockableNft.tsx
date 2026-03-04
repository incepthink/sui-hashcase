import React from "react";
import { Lock } from "lucide-react";

interface UnlockableNft {
  isMinted?: boolean;
}

const UnlockableNft: React.FC<UnlockableNft> = ({ isMinted = false }) => {
  return (
    <div className="w-full p-4 bg-gradient-to-br from-blue-400/20 to-purple-500/20 border border-blue-400/30 rounded-lg">
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-blue-300 flex-shrink-0" />
        <p className="text-blue-200 text-sm font-medium">
          {isMinted
            ? "Visit the NFT page from your profile to view unlockable content!"
            : "This NFT contains unlockable content!"}
        </p>
      </div>
    </div>
  );
};

export default UnlockableNft;
