"use client";
import axiosInstance from "@/utils/axios";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

import "./page.css";

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

const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const collectionsRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch collections data (Replace with actual API call)
    const fetchCollections = async () => {
      try {
        const response = await axiosInstance.get("/platform/collections-sui"); // Update with your API endpoint
        // console.log(response);
        const data: Collection[] = response.data.suiCollections;
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!collections) return <div>Loading collections...</div>;

  const scrollToCollections = () => {
    collectionsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
      <div className="h-screen flex flex-col items-center justify-center text-center p-8 bg-hero ">
        <h1 className="text-5xl font-bold">Discover Unique Collections</h1>
        <p className="text-gray-400 mt-4">
          Explore a variety of digital assets on our platform.
        </p>
        <button
          className="mt-6 px-6 py-3 bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          onClick={scrollToCollections}
        >
          Explore Collections
        </button>
      </div>
      <div ref={collectionsRef} className="p-8 max-w-[1600px] mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Collections</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/metadatas/${collection.id}`}>
              <div className="bg-[#0a0f3b] shadow-lg rounded-lg p-4 transform transition-transform duration-300 hover:scale-105 hover:bg-[#141a52] cursor-pointer">
                <img
                  src={
                    collection.image_uri || "https://via.placeholder.com/300"
                  }
                  alt={collection.name}
                  className="w-full h-48 object-cover rounded-md"
                />
                <h2 className="text-2xl font-semibold mt-4">
                  {collection.name}
                </h2>
                <p className="text-sm text-gray-300 mt-2">
                  {collection.description.length > 100
                    ? `${collection.description.substring(0, 100)}...`
                    : collection.description}
                </p>
                <div className="mt-4">
                  <p className="text-blue-200">
                    Chain: {collection.chain_type}
                  </p>
                  <p className="text-blue-300">
                    Contract:{" "}
                    {collection.contract_address.length > 15
                      ? `${collection.contract_address.substring(0, 15)}...`
                      : collection.contract_address}
                  </p>
                  <p className="text-blue-400">
                    Priority: {collection.priority}
                  </p>
                </div>
                <div className="hidden hover:block text-gray-400 mt-2 text-sm">
                  <p>
                    Created:{" "}
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Updated:{" "}
                    {new Date(collection.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsPage;
