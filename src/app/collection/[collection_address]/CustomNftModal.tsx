import React, { useState } from "react";

import { useNftTransactions } from "../../hooks/useNftTransactions";

import { X, HandCoins } from "lucide-react";

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
    attributes: "",
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
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-blue-400 to-purple-500 p-8 rounded-2xl shadow-2xl text-white relative w-[450px] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-300"
        >
          <X size={24} />
        </button>

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

          {/* Attributes Field */}
          <div className="space-y-2">
            <label
              htmlFor="attributes"
              className="text-sm font-medium text-white/80"
            >
              Attributes
            </label>
            <input
              name="attributes"
              id="attributes"
              type="text"
              placeholder="Enter image URL"
              value={formValues.attributes}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-white/50 text-white"
            />
          </div>
        </form>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleFreeMint}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 text-white font-semibold"
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
