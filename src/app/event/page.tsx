"use client";
import axiosInstance from "@/utils/axios";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

import Image from "next/image";

import foregroundImageHeroSection from "@/assets/images/sui-bg.png";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

import "./page.css";
import { useRouter } from "next/navigation";
import { useCollections } from "@/hooks/useCollections";

const HeaderSection = () => {
  return (
    <div className="relative w-full py-14">
      <div className="max-w-6xl mx-auto px-4">
        <div className="">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover <span className=" text-purple-600">Events</span>
          </h1>
          <p>
            Explore popular events near you, browse by category, or check out
            some of the great community calendars.
          </p>
        </div>
      </div>
    </div>
  );
};

const CollectionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const { data: dataold, isLoading, isError, error } = useCollections();
  const data = dataold?.collections ? [...dataold.collections].reverse() : [];
  if (isLoading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4DA2FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading Events...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">API Error</h2>
          <p className="text-white/80 mb-4">
            Failed to load collections from the backend API.
          </p>

          {/* Show detailed error info for debugging */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-red-400 font-semibold mb-2">
                Error Details:
              </h3>
              <p className="text-red-300 text-sm mb-2">
                <strong>Type:</strong> {(error as any).name || "Unknown"}
              </p>
              <p className="text-red-300 text-sm mb-2">
                <strong>Message:</strong>{" "}
                {(error as any).message || "No message available"}
              </p>
              {(error as any).response && (
                <p className="text-red-300 text-sm mb-2">
                  <strong>Status:</strong> {(error as any).response.status} -{" "}
                  {(error as any).response.statusText}
                </p>
              )}
              <p className="text-red-300 text-sm">
                <strong>Endpoint:</strong> /platform/collections-sui
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#4DA2FF] text-black rounded-lg hover:bg-[#3a8fef] transition-colors font-semibold"
            >
              Retry
            </button>
            <div className="text-white/60 text-sm">
              <p>
                Check if your backend server is running and the API endpoint
                exists.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle different possible data structures
  const collections = data || [];
  const totalPages = dataold?.totalPages || dataold?.total_pages || 1;

  console.log("Processed collections:", collections);
  console.log("Total pages:", totalPages);

  if (!collections || collections.length === 0) {
    return (
      <div className="min-h-screen  text-white">
        <HeaderSection />
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-semibold mb-2">
              No Collections Found
            </h3>
            <p className="text-white/60">
              There are no collections available at the moment. Check back
              later!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="  text-white">
      <HeaderSection />

      {/* Collections Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Collections Header */}
        <div className="flex justify-between items-center mb-8">
          {/* <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
              Sort
            </button>
          </div> */}
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection: any) => {
            if (collection.id !== 231) return;

            // Handle different possible data structures
            let contractAddress =
              collection.contract?.contract_address ||
              collection.contract_address ||
              collection.address ||
              "";
            const oldPackage =
              "0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0";
            const newCollection =
              "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";
            if (contractAddress === oldPackage) contractAddress = newCollection;
            const chainType =
              collection.chain_name || collection.chainType || "SUI";
            const collectionName = collection.name || "Unnamed Collection";
            const dbCollection =
              "0x6c7ff54132f7693ad1334e85ff7c5cf2f967b37cc785e51019c42b42a5c38b6f";
            if (contractAddress === dbCollection)
              contractAddress = newCollection;
            const collectionId = collection.id || collection.collection_id;

            // Use specific image for NS Daily collection
            const isNSDaily =
              collectionName.toLowerCase().includes("ns daily") ||
              collectionName.toLowerCase().includes("network school") ||
              contractAddress === newCollection;
            const collectionImage = isNSDaily
              ? "https://client-uploads.nyc3.digitaloceanspaces.com/images/3b1daaad-c7dc-4884-a78b-739a3ce3dfaa/2025-08-28T12-25-58-895Z-38bc0eae.png"
              : backgroundImageHeroSection;

            // Determine if this is a SUI chain collection
            const isBaseChain = chainType.toLowerCase() === "base";
            const linkUrl = isBaseChain
              ? `https://hashcase.co/collections/${collectionName}/${collectionId}`
              : `/event/${collectionName}/${collectionId}`;

            const LinkComponent = isBaseChain ? "a" : Link;
            const linkProps = isBaseChain
              ? {
                  href: linkUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "block group h-full",
                }
              : {
                  href: linkUrl,
                  className: "block group h-full",
                };

            return (
              <LinkComponent key={collectionId} {...linkProps}>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer">
                  {/* Portrait image */}
                  <div className="relative w-full aspect-[4/5] overflow-hidden">
                    <Image
                      src={collection.image_uri}
                      alt={collectionName}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Info section */}
                  <div className="p-3">
                    <p className="text-xs text-gray-400 mb-1">
                      Wed, 04 Mar, 10:00 AM
                    </p>
                    <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
                      {collectionName}
                    </h3>
                    <div className="flex items-center gap-1 mb-1">
                      <svg
                        className="w-3 h-3 text-white/50 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs text-white/60 line-clamp-1">
                        Jawaharlal Nehru Stadium, Delhi/NCR
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      ₹1178 onwards
                    </p>
                  </div>
                </div>
              </LinkComponent>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    pageNum === page
                      ? "bg-[#4DA2FF] text-black font-semibold border-[#4DA2FF]"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
