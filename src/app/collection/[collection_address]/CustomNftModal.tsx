import React, { useState } from "react";

import { useNftTransactions } from "../../hooks/useNftTransactions";

import { X, HandCoins, Sparkles } from "lucide-react";

interface CustomNftModalProps {
  isOpen: boolean;
  nftCollectionAddress: string;
  onClose: () => void;
}

const CustomNftModal: React.FC<CustomNftModalProps> = ({
  isOpen,
  nftCollectionAddress,
  onClose,
}) => {
  const { freeMintNft } = useNftTransactions();

  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    image_url: "",
    attributes: "user, custom, nft",
    collection_id: nftCollectionAddress,
  });

  const handleFreeMint = async () => {
    if (!formValues.title || !formValues.description || !formValues.image_url) {
      return;
    }
    await freeMintNft(formValues);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  if (!isOpen || !nftCollectionAddress) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999]"
      onClick={onClose}
    >
      <div
        className=" text-white p-6 relative w-[450px] space-y-6 backdrop-blur-sm bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-purple-500/10 border border-blue-400/40 shadow-[inset_0_0_12px_#60a5fa33,0_0_16px_#8b5cf622] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-300" size={20} />
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
              Create Custom NFT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors duration-200 text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>{" "}
        {/* Form */}
        <form className="flex flex-col gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-white/80"
            >
              Title
            </label>
            <input
              name="title"
              id="title"
              type="text"
              placeholder="Enter NFT title"
              value={formValues.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-white/50 text-white"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-white/80"
            >
              Description
            </label>
            <input
              name="description"
              id="description"
              type="text"
              placeholder="Enter NFT description"
              value={formValues.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-white/50 text-white"
            />
          </div>

          {/* Image URL Field */}
          <div className="space-y-2">
            <label
              htmlFor="image_url"
              className="text-sm font-medium text-white/80"
            >
              Image URL
            </label>
            <input
              name="image_url"
              id="image_url"
              type="text"
              placeholder="Enter image URL"
              value={formValues.image_url}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-white/50 text-white"
            />
          </div>
        </form>
        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleFreeMint}
            className={` flex justify-center gap-2 items-center py-2 text-lg font-bold text-white bg-gradient-to-r from-blue-500/55 to-purple-600/55 rounded-lg border border-blue-400/50 shadow-[0_0_15px_-3px_#60a5fa,0_0_30px_-5px_#8b5cf6] hover:shadow-[0_0_20px_-5px_#3b82f6,0_0_40px_-10px_#a78bfa] hover:brightness-110 transition-all duration-75 whitespace-nowrap`}
          >
            <HandCoins size={20} />
            Mint NFT
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomNftModal;
