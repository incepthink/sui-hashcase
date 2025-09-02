// components/NFTSuccessModal.tsx
"use client";

import Image, { StaticImageData } from "next/image";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface MintedNFTData {
  name: string;
  description: string;
  image_url: string | StaticImageData;
  recipient: string;
}

interface NFTSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  mintedNftData: MintedNFTData | null;
  walletAddress: string | null | undefined;
  isNSCollection: boolean;
}

export const NFTSuccessModal: React.FC<NFTSuccessModalProps> = ({
  isOpen,
  onClose,
  mintedNftData,
  walletAddress,
  isNSCollection,
}) => {
  const router = useRouter();

  if (!isOpen || !mintedNftData) return null;

  const handleViewProfile = () => {
    if (walletAddress) {
      router.push(`/profile/${walletAddress}`);
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isNSCollection ? "bg-black" : "bg-[#000421]"
      } bg-opacity-80 backdrop-blur-md p-4`}
    >
      {/* Particle Effects Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-ping"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Modal Content */}
      <div
        className={`relative ${
          isNSCollection ? "bg-black" : "bg-[#000421]"
        } backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 border border-white/10 shadow-2xl`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-white transition-colors text-lg"
        >
          ✕
        </button>

        {/* Profile Navigation Arrow */}
        <button
          onClick={handleViewProfile}
          className="absolute top-3 sm:top-4 right-12 sm:right-16 text-gray-400 hover:text-blue-400 transition-colors flex flex-row items-center gap-1"
          title="View in Profile"
        >
          <span className="text-xs hidden sm:inline">View in Profile</span>
          <span className="text-xs sm:hidden">Profile</span>
          <ArrowRight size={14} className="sm:hidden" />
          <ArrowRight size={16} className="hidden sm:block" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* NFT Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-2xl overflow-hidden border border-white/20">
            <Image
              src={mintedNftData.image_url}
              alt={mintedNftData.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
            {mintedNftData.name}
          </h2>
          <p className="text-green-400 text-sm mb-4">Successfully minted! ✨</p>

          {/* Wallet */}
          <div className="bg-white/5 rounded-lg p-3 mb-6">
            <p className="text-gray-400 text-xs mb-1">Sent to:</p>
            <p className="text-white font-mono text-xs break-all">
              <span className="sm:hidden">
                {mintedNftData.recipient.slice(0, 6)}...
                {mintedNftData.recipient.slice(-6)}
              </span>
              <span className="hidden sm:inline">
                {mintedNftData.recipient.slice(0, 8)}...
                {mintedNftData.recipient.slice(-8)}
              </span>
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
