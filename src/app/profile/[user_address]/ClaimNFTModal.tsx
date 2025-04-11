import React from "react";

import { useNftTransactions } from "../../hooks/useNftTransactions";

import { X, HandCoins } from "lucide-react";

interface NFTModalProps {
  isOpen: boolean;
  selectedNft: {
    attributes?: string[];
    collection_id: string;
    creator: string;
    description?: string;
    id: { id: string };
    image_url: string;
    metadata_version: string;
    mint_price: string;
    name: string;
    token_number: string;
  };
  onClose: () => void;
}

const NFTModal: React.FC<NFTModalProps> = ({
  isOpen,
  selectedNft,
  onClose,
}) => {
  const { claimNFT, updateNftMetadata } = useNftTransactions();

  const handleClaimNft = async () => {
    await claimNFT(selectedNft.collection_id, selectedNft.id.id);
  };

  const handleUpdateNftMetadata = async () => {
    await updateNftMetadata(selectedNft.collection_id, selectedNft.id.id);
  };

  if (!isOpen || !selectedNft) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1E293B] p-6 rounded-lg shadow-lg text-white relative w-[400px] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
        >
          <X size={24} />
        </button>

        {/* NFT Image */}
        <img
          src={selectedNft.image_url}
          alt={selectedNft.name}
          className="w-full h-auto rounded-md shadow-lg"
        />

        {/* NFT Info */}
        <h2 className="text-2xl font-semibold">{selectedNft.name}</h2>
        <p className="text-gray-300">{selectedNft.description}</p>

        <div className="text-sm text-gray-400 space-y-1">
          <p>
            <span className="font-semibold text-white">Collection ID:</span>{" "}
            {selectedNft.collection_id.slice(0, 10)}...
          </p>
          <p>
            <span className="font-semibold text-white">Creator:</span>{" "}
            {selectedNft.creator.slice(0, 10)}...
          </p>
          <p>
            <span className="font-semibold text-white">Token Number:</span>{" "}
            {selectedNft.token_number}
          </p>
          <p>
            <span className="font-semibold text-white">Mint Price:</span>{" "}
            {selectedNft.mint_price} SUI
          </p>
        </div>

        {/* Attributes */}
        <div className="mt-2">
          <h3 className="font-semibold text-white">Attributes:</h3>
          <ul className="text-sm text-gray-400">
            {selectedNft?.attributes?.map((attr, index) => (
              <li key={index}>{attr}</li>
            ))}
          </ul>
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaimNft}
          className="flex items-center gap-2 justify-center bg-blue-700 text-white px-4 py-2 rounded-md text-lg font-semibold hover:bg-blue-600 transition w-full mt-4"
        >
          <HandCoins size={20} />
          Claim NFT
        </button>
        <button
          onClick={handleUpdateNftMetadata}
          className="flex items-center gap-2 justify-center bg-blue-700 text-white px-4 py-2 rounded-md text-lg font-semibold hover:bg-blue-600 transition w-full mt-4"
        >
          <HandCoins size={20} />
          Update NFT Metadata
        </button>
      </div>
    </div>
  );
};

export default NFTModal;
