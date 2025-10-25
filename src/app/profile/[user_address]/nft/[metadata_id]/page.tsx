"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { useParams } from "next/navigation";
import { Work_Sans } from "next/font/google";
import NFTImageSection from "@/components/nft-profile/NFTImageSection";
import NFTDetailsSection from "@/components/nft-profile/NFTDetailsSection";
import CollectionBanner from "@/components/nft-profile/CollectionBanner";
import LoadingSpinner from "@/components/nft-profile/LoadingSpinner";
import ErrorMessage from "@/components/nft-profile/ErrorMessage";
import { Metadata } from "@/components/nft-profile/types";

const workSans = Work_Sans({ subsets: ["latin"] });

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

  const user_address = Array.isArray(params.user_address)
    ? params.user_address[0]
    : params.user_address;

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!metadata_id || !user_address) {
        setError("Missing required parameters");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse>(
          "/platform/metadata/user/by-id",
          {
            params: {
              metadata_id: metadata_id,
              user_address: user_address,
            },
          }
        );

        console.log("Metadata Response:", response.data);
        setMetadata(response.data.metadata_instance);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching metadata:", err);
        setError(err.response?.data?.message || "Failed to fetch metadata");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [metadata_id, user_address]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!metadata) {
    return <ErrorMessage message="No metadata found" />;
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] ${workSans.className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Collection Banner */}
        <CollectionBanner collection={metadata.collection} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Images & Collection Info */}
          <NFTImageSection metadata={metadata} />

          {/* Right Column - NFT Details */}
          <NFTDetailsSection metadata={metadata} ownerAddress={user_address} />
        </div>
      </div>
    </div>
  );
}
