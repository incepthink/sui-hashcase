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
        const response = await axiosInstance.get("/platform/collections-sui");
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
        <h1 className="text-4xl font-bold text-center mb-12">Collections</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:bg-white/15"
            >
              {/* Chain Badge */}
              <div className="absolute top-4 left-4 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="text-xs font-semibold text-white uppercase">
                  {collection.chain_type || "SUI"}
                </span>
              </div>

              {/* NFT Image */}
              <div className="relative aspect-square">
                <img
                  src={
                    collection.image_uri || "https://via.placeholder.com/300"
                  }
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-xl font-bold text-white">
                    {collection.name}
                  </h3>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                {/* Description with line clamp */}
                <p className="text-sm text-white/80 line-clamp-2 mb-4">
                  {collection.description}
                </p>

                {/* Stats Row */}
                <div className="flex justify-between items-center text-xs text-white/60 mb-3">
                  <span>
                    {" "}
                    Contract:{" "}
                    {collection.contract_address.length > 15
                      ? `${collection.contract_address.substring(0, 15)}...`
                      : collection.contract_address}
                  </span>
                </div>

                {/* Mint Info */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-400">
                    Live Minted
                  </span>
                  <span className="text-sm font-bold text-white">
                    {collection.chain_id
                      ? `${collection.chain_id / 100}`
                      : "0.42"}
                  </span>
                </div>
              </div>
              {/* Buttons for Metadata & Loyalties */}
              <div className="mt-4 flex gap-4">
                <Link
                  href={`/metadatas/${collection.id}`}
                  onClick={(e) => e.stopPropagation()} // Prevent the parent Link from being triggered
                  className="bg-[#313197] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#3e3eb7] transition"
                >
                  Metadata
                </Link>
                <Link
                  href={`/loyalties/${collection.id}`}
                  onClick={(e) => e.stopPropagation()} // Prevent the parent Link from being triggered
                  className="bg-[#313197] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#3e3eb7] transition"
                >
                  Loyalties
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>{" "}
    </div>
  );
};

export default CollectionsPage;

// <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//   {collections.map((collection) => (
//     <div
//       key={collection.id}
//       className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:bg-white/15"
//     >
//       {/* Chain Badge */}
//       <div className="absolute top-4 left-4 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
//         <span className="text-xs font-semibold text-white uppercase">
//           {collection.chain_type || "SUI"}
//         </span>
//       </div>

//       {/* NFT Image */}
//       <div className="relative aspect-square">
//         <img
//           src={
//             collection.image_uri || "https://via.placeholder.com/300"
//           }
//           alt={collection.name}
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
//           <h3 className="text-xl font-bold text-white">
//             {collection.name}
//           </h3>
//         </div>
//       </div>

//       {/* Card Content */}
//       <div className="p-4 flex flex-col justify-between min-h-[150px]">
//         {/* Description with line clamp */}
//         <p className="text-sm text-white/80 line-clamp-2 mb-4">
//           {collection.description}
//         </p>

//         {/* Stats Row */}
//         <div className="flex justify-between items-center text-xs text-green-400 mb-3">
//           <span>
//             {" "}
//             Contract:{" "}
//             {collection.contract_address.length > 15
//               ? `${collection.contract_address.substring(0, 15)}...`
//               : collection.contract_address}
//           </span>
//         </div>

//         {/* Buttons for Metadata & Loyalties */}
//         <div className="flex gap-4">
//           <Link
//             href={`/metadatas/${collection.id}`}
//             onClick={(e) => e.stopPropagation()} // Prevent the parent Link from being triggered
//             className="bg-[#313197] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#3e3eb7] transition"
//           >
//             Metadata
//           </Link>
//           <Link
//             href={`/loyalties/${collection.id}`}
//             onClick={(e) => e.stopPropagation()} // Prevent the parent Link from being triggered
//             className="bg-[#313197] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#3e3eb7] transition"
//           >
//             Loyalties
//           </Link>
//         </div>
//       </div>
//     </div>
//   ))}
// </div>
