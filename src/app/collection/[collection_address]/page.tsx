"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";
import React, { useContext } from "react";

import axiosInstance from "@/utils/axios";
import { Frown } from "lucide-react";
import CustomNftModal from "./CustomNftModal";

interface Collection {
  name: string;
  description?: string;
  image_uri?: string;
  chain_type: string;
  chain_id: number;
  contract_address: string;
  standard: string;
  owner_id: number;
  paymaster_id?: number;
  priority?: number;
  attributes?: string;
}

interface NFTMetadata {
  id: number;
  title: string;
  description: string;
  animation_url: string;
  image_url: string;
  collection_id: number;
  token_uri: string;
  attributes: string;
  createdAt: string;
  updatedAt: string;
}

export default function NFTPage() {
  const params = useParams();
  const [collectionData, setCollectionData] = useState<Collection | null>(null);

  //needed for the NFT modal to function
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchNFTData = async () => {
      const collectionData = await axiosInstance.get(
        "/platform/collection-by-address",
        {
          params: {
            contract_address: params.collection_address,
          },
        }
      );
      const { collection_instance } = collectionData.data;

      console.log(collection_instance);

      setCollectionData(collection_instance);

      const response = await axiosInstance.get(
        "platform/metadata/by-collection",
        {
          params: {
            collection_id: collection_instance.id,
          },
        }
      ); // Update with actual API endpoint

      console.log(response);

      setMetadata(response.data.metadata_instances);
    };

    if (params.collection_address) {
      fetchNFTData();
    }
  }, [params.collection_address]);

  const [metadata, setMetadata] = useState<NFTMetadata[]>([]);

  // useEffect(() => {
  //   const fetchMetadata = async () => {
  //     try {
  //       const response = await axiosInstance.get(
  //         "platform/metadata/by-collection",
  //         {
  //           params: {
  //             collection_id: params.collection_id,
  //           },
  //         }
  //       ); // Update with actual API endpoint

  //       console.log(response);

  //       setMetadata(response.data.metadata_instances);
  //     } catch (error) {
  //       console.error("Error fetching metadata", error);
  //     }
  //   };
  //   fetchMetadata();
  // }, [params.collection_address]);

  if (!collectionData) {
    return <div>Collection does not exist</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828]">
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
        {/* Banner Section */}
        <div className="w-full h-[200px] overflow-hidden">
          <img
            src={
              collectionData.image_uri ||
              "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
            }
            alt="Banner"
            className="w-full h-auto"
          />
        </div>

        {/* Profile Section */}
        <div className="flex items-center mt-[-50px] p-6  shadow-lg rounded-lg w-4/5 mx-auto">
          <div className="flex-shrink-0">
            <img
              src={
                collectionData.image_uri ||
                "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
              }
              alt="Logo"
              className="w-24 h-24 rounded-full border-2 border-gray-300"
            />
          </div>
          <div className="ml-6 mt-3">
            <h2 className="text-2xl font-semibold">{collectionData.name}</h2>
            <p className="text-gray-300">{collectionData.description}</p>
          </div>
        </div>

        <div className="p-8 max-w-[1600px] mx-auto">
          <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg text-center">
            Collection Assets{" "}
          </h1>
          <div className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-center my-3">
            <button
              onClick={() => openModal()}
              className="px-2 text-xl font-extrabold bg-gradient-to-r py-2 from-blue-400 to-purple-500 w-full"
            >
              Mint Custom NFT
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metadata.length > 0 ? (
              metadata.map((metadata) => (
                <Link key={metadata.id} href={`/freeMint/${metadata.id}`}>
                  <div className="bg-[#0a0f3b] shadow-lg rounded-lg p-4 transform transition-transform duration-300 hover:scale-105 hover:bg-[#141a52] cursor-pointer">
                    <img
                      src={
                        metadata.image_url || "https://via.placeholder.com/300"
                      }
                      alt={metadata.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <h2 className="text-2xl font-semibold mt-4">
                      {metadata.title}
                    </h2>
                    <p className="text-sm text-gray-300 mt-2">
                      {metadata.description.length > 100
                        ? `${metadata.description.substring(0, 100)}...`
                        : metadata.description}
                    </p>

                    <div className="hidden hover:block text-gray-400 mt-2 text-sm">
                      <p>
                        Created:{" "}
                        {new Date(metadata.createdAt).toLocaleDateString()}
                      </p>
                      <p>
                        Updated:{" "}
                        {new Date(metadata.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center min-h-52 space-y-4">
                <Frown className="w-24 h-24 text-blue-600 animate-bounce" />{" "}
                {/* Sad icon with bounce animation */}
                <p className="text-xl text-gray-400 font-semibold">
                  This Collection does not have any mintable assets.
                </p>
                <p className="text-sm text-gray-500">
                  Check back later or explore other collections.
                </p>
              </div>
            )}
          </div>{" "}
        </div>
      </div>

      <CustomNftModal
        isOpen={isModalOpen}
        nftCollectionAddress={collectionData.contract_address!}
        onClose={closeModal}
      />
    </div>
  );
}
