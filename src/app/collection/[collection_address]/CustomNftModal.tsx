import React, { useState } from "react";

import { useNftTransactions } from "../../hooks/useNftTransactions";

import { X, HandCoins, Image as ImageIcon, FileText, Tag, Sparkles } from "lucide-react";

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

  const [isLoading, setIsLoading] = useState(false);

  const handleFreeMint = async () => {
    if (!formValues.title || !formValues.description || !formValues.image_url) {
      return;
    }
    setIsLoading(true);
    try {
      await freeMintNft(formValues);
      onClose();
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  if (!isOpen || !nftCollectionAddress) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-[#00041f] via-[#030828] to-[#00041f] border border-white/20 rounded-2xl shadow-2xl text-white relative w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] rounded-lg">
              <Sparkles size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Custom NFT</h2>
              <p className="text-sm text-white/60">Design your unique digital asset</p>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <form className="space-y-5">
              {/* Title Field */}
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="flex items-center gap-2 text-sm font-medium text-white/80"
                >
                  <FileText size={16} />
                  NFT Title
                </label>
                <input
                  name="title"
                  id="title"
                  type="text"
                  placeholder="Enter a unique title for your NFT"
                  value={formValues.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/50 focus:border-[#4DA2FF]/50 placeholder:text-white/40 text-white transition-all duration-200"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-medium text-white/80"
                >
                  <FileText size={16} />
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  placeholder="Describe your NFT in detail"
                  value={formValues.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/50 focus:border-[#4DA2FF]/50 placeholder:text-white/40 text-white transition-all duration-200 resize-none"
                />
              </div>

              {/* Image URL Field */}
              <div className="space-y-2">
                <label
                  htmlFor="image_url"
                  className="flex items-center gap-2 text-sm font-medium text-white/80"
                >
                  <ImageIcon size={16} />
                  Image URL
                </label>
                <input
                  name="image_url"
                  id="image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formValues.image_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/50 focus:border-[#4DA2FF]/50 placeholder:text-white/40 text-white transition-all duration-200"
                />
              </div>

              {/* Attributes Field */}
              <div className="space-y-2">
                <label
                  htmlFor="attributes"
                  className="flex items-center gap-2 text-sm font-medium text-white/80"
                >
                  <Tag size={16} />
                  Attributes (Optional)
                </label>
                <input
                  name="attributes"
                  id="attributes"
                  type="text"
                  placeholder="e.g., rarity: legendary, type: character"
                  value={formValues.attributes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#4DA2FF]/50 focus:border-[#4DA2FF]/50 placeholder:text-white/40 text-white transition-all duration-200"
                />
              </div>
            </form>

            {/* Preview Section */}
            {formValues.image_url && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/80">Preview</p>
                <div className="relative aspect-square rounded-xl overflow-hidden border border-white/20 max-h-48">
                  <img
                    src={formValues.image_url}
                    alt="NFT Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/300x300/1a1a2e/ffffff?text=Invalid+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {formValues.title || "Untitled NFT"}
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex flex-col gap-3">
            <button
              onClick={handleFreeMint}
              disabled={!formValues.title || !formValues.description || !formValues.image_url || isLoading}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-[#4DA2FF] to-[#7ab8ff] hover:from-[#3a8fef] hover:to-[#6aa7f0] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-black transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <HandCoins size={20} />
                  Mint NFT
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-medium text-white transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomNftModal;
