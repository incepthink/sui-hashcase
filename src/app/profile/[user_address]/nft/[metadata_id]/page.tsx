"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Work_Sans } from "next/font/google";

const workSans = Work_Sans({ subsets: ["latin"] });

// Type definitions based on your models
interface Contract {
  id: number;
  // Add other contract fields as needed
}

interface Collection {
  id: number;
  name: string;
  description?: string;
  image_uri?: string;
  banner_image?: string | null;
  chain_name: string;
  owner_id: number;
  priority?: number;
  attributes?: string;
  collection_address: string;
  cap_id?: string | null;
  package_id?: string | null;
  contract_id?: number | null;
  telegram_id?: string | null;
  tags?: string | null;
  contract?: Contract;
}

interface Metadata {
  id: number;
  title?: string;
  description?: string;
  animation_url?: string;
  image_url?: string;
  collection_id: number;
  token_uri?: string;
  attributes?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  set_id?: number;
  is_active: boolean;
  probability?: number;
  unlockable_content?: string;
  collection?: Collection;
}

interface ApiResponse {
  metadata_instance: Metadata;
}

export default function MetadataPage() {
  const params = useParams();
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metadata_id = Array.isArray(params.metadata_id)
    ? params.metadata_id[0]
    : params.metadata_id;

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse>(
          "/platform/metadata/by-id",
          {
            params: { metadata_id: metadata_id },
          }
        );
        setMetadata(response.data.metadata_instance);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch metadata");
      } finally {
        setLoading(false);
      }
    };

    if (metadata_id) {
      fetchMetadata();
    }
  }, [metadata_id]);

  // Safe JSON parsing function
  const parseAttributes = (attributesString?: string): any[] | null => {
    if (!attributesString) return null;

    try {
      const parsed = JSON.parse(attributesString);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      console.error("Failed to parse attributes:", e);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading NFT...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">No metadata found</p>
        </div>
      </div>
    );
  }

  const parsedAttributes = parseAttributes(metadata.attributes);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] ${workSans.className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Banner Image */}
        {metadata.collection?.banner_image && (
          <div className="relative w-full h-64 mb-8 rounded-2xl overflow-hidden">
            <Image
              src={metadata.collection.banner_image}
              alt={metadata.collection.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Images */}
          <div className="space-y-6">
            {/* Main Image */}
            {metadata.image_url && (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
                <img
                  src={metadata.image_url}
                  alt={metadata.title || "NFT Image"}
                  className="w-full h-full object-contain p-4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            {/* Animation/Video */}
            {metadata.animation_url && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
                <video
                  src={metadata.animation_url}
                  controls
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Collection Info Card */}
            {metadata.collection && (
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20 space-y-4">
                <h3 className="text-xl font-semibold text-white/90">
                  Collection
                </h3>
                <div className="flex items-center gap-4">
                  {metadata.collection.image_uri && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={metadata.collection.image_uri}
                        alt={metadata.collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-white">
                      {metadata.collection.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {metadata.collection.chain_name}
                    </p>
                  </div>
                </div>
                {metadata.collection.description && (
                  <p className="text-sm text-gray-300">
                    {metadata.collection.description}
                  </p>
                )}
                {metadata.collection.tags && (
                  <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm border border-blue-500/30">
                    {metadata.collection.tags}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Metadata Details */}
          <div className="space-y-6">
            {/* Title and Description */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                {metadata.title}
              </h1>
              {metadata.description && (
                <p className="text-gray-300 text-lg">{metadata.description}</p>
              )}
            </div>

            {/* Price */}
            {metadata.price && (
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
                <p className="text-sm text-gray-400 mb-1">Price</p>
                <p className="text-3xl font-bold text-white">
                  {metadata.price}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  metadata.is_active
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}
              >
                {metadata.is_active ? "Active" : "Inactive"}
              </span>
              {metadata.probability && (
                <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium border border-purple-500/30">
                  Probability: {metadata.probability}%
                </span>
              )}
            </div>

            {/* Attributes */}
            {metadata.attributes && (
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="font-semibold text-white/90 text-xl mb-4">
                  Attributes
                </h3>
                {parsedAttributes && parsedAttributes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {parsedAttributes.map((attr: any, index: number) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-500/20"
                      >
                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                          {attr.trait_type || "Attribute"}
                        </p>
                        <p className="font-semibold text-white">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                      {metadata.attributes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            {(metadata.latitude || metadata.longitude) && (
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
                <h3 className="font-semibold text-white/90 mb-2">Location</h3>
                <p className="text-sm text-gray-300">
                  Lat: {metadata.latitude}, Long: {metadata.longitude}
                </p>
              </div>
            )}

            {/* Unlockable Content */}
            {metadata.unlockable_content && (
              <div className="bg-gradient-to-r from-orange-900/30 to-yellow-900/30 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
                <h3 className="font-semibold text-orange-200 mb-2 flex items-center gap-2">
                  <span>🔒</span> Unlockable Content
                </h3>
                <p className="text-sm text-orange-100">
                  {metadata.unlockable_content}
                </p>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
              <h3 className="font-semibold text-white/90 text-xl mb-4">
                Details
              </h3>
              <div className="text-sm space-y-3">
                {metadata.collection?.collection_address && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Contract Address:</span>
                    <span className="font-mono text-xs text-blue-300">
                      {metadata.collection.collection_address.slice(0, 6)}...
                      {metadata.collection.collection_address.slice(-4)}
                    </span>
                  </div>
                )}
                {metadata.token_uri && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Token URI:</span>
                    <a
                      href={metadata.token_uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors text-xs flex items-center gap-1"
                    >
                      View
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
                {metadata.set_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Set ID:</span>
                    <span className="text-white">{metadata.set_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
