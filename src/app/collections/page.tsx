"use client";
import axiosInstance from "@/utils/axios";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

import Image from "next/image";

import foregroundImageHeroSection from "@/assets/images/sui-bg.png";
import backgroundImageHeroSection from "@/assets/images/high_rise.jpg";

import "./page.css";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface Collection {
  id: number;
  name: string;
  description: string;
  image_uri: string;
  chain_type: string;
  chain_id: number;
  contract_address: string;
  standard: string;
  owner_id: number;
  paymaster_id: number | null;
  priority: number;
  attributes: string;
  createdAt: string;
  updatedAt: string;
}

const HeroSection = ({
  scrollToCollections,
}: {
  scrollToCollections: () => void;
}) => {
  return (
    <div className="relative h-[730px] w-full overflow-hidden">
      {/* Background layer - darker, more transparent */}
      <div className="absolute top-0 left-0 right-0 h-[690px] z-0">
        <Image
          src={backgroundImageHeroSection}
          alt="Background layer"
          layout="fill"
          objectFit="cover"
          className="bg-opacity-70"
          priority
        />
      </div>

      {/* Foreground layer - brighter */}
      <div className="absolute inset-0 z-0">
        <Image
          src={foregroundImageHeroSection} // Replace with your actual image path
          alt="Foreground layer"
          layout="fill"
          objectFit="cover"
          className="opacity-80"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-[189px] h-full text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Discover Unique <span className="text-[#4DA2FF]">Collection</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            Explore a variety of digital assets on our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={scrollToCollections}
              className="px-8 py-3 bg-[#4DA2FF] text-white font-medium rounded-lg hover:bg-[#69b1ff] transition-colors duration-300"
            >
              Explore Collections
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-black transition-colors duration-300">
              Create Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CollectionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const collectionsRef = useRef<HTMLDivElement | null>(null);

  const fetchCollections = async (page: number) => {
    const res = await axiosInstance.get(
      `/platform/collections-sui?page=${page}&limit=12`
    );
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collections", page],
    queryFn: () => fetchCollections(page),
    placeholderData: keepPreviousData,
  });

  const scrollToCollections = () => {
    collectionsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !data) return <div>Error loading collections.</div>;

  const { collections, totalPages } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
      <HeroSection scrollToCollections={scrollToCollections} />

      <div ref={collectionsRef} className="p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection: any) => (
            <Link
              key={collection.id}
              href={`/collection/${collection.contract.contract_address}`}
              className="block"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:bg-white/15">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src={backgroundImageHeroSection} // use fallback or dynamic image
                    alt={collection.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#0e1024]/90 to-transparent pointer-events-none" />
                </div>

                <div className="flex flex-col justify-between relative -mt-6 z-10 px-4 py-6 backdrop-blur-md rounded-xl min-h-52">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-white/80 line-clamp-2 mb-3">
                    {collection.description}
                  </p>
                  {collection.contract_address && (
                    <p className="text-xs text-green-400 mb-4">
                      Contract:{" "}
                      {collection.contract_address.length > 20
                        ? `${collection.contract_address.substring(0, 20)}...`
                        : collection.contract_address}
                    </p>
                  )}

                  <div className="flex gap-4">
                    <Link
                      href={`/loyalties/${collection.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-center rounded-md px-4 py-2 text-sm font-semibold text-cyan-300 border border-cyan-300 hover:bg-cyan-300 hover:text-black transition"
                    >
                      Metadata
                    </Link>
                    <Link
                      href={`/loyalties/${collection.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-center rounded-md px-4 py-2 text-sm font-semibold text-purple-300 border border-purple-300 hover:bg-purple-300 hover:text-black transition"
                    >
                      Loyalties
                    </Link>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Navigator */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-md border transition ${
                    pageNum === page
                      ? "bg-white text-black font-bold"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
