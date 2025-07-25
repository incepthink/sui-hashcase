"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";
import React, { useContext } from "react";

import axiosInstance from "@/utils/axios";
import { Frown } from "lucide-react";
import CustomNftModal from "./CustomNftModal";
import {
  Metadata,
  MetadataSetWithAllMetadataInstances,
} from "@/utils/modelTypes";

import { Orbitron } from "next/font/google";
import NeonHeader from "@/components/NeonHeader";
const orbitron = Orbitron({ subsets: ["latin"], weight: "700" });

interface Collection {
  id: number;
  name: string;
  description?: string;
  image_uri?: string;
  chain_name: string;
  owner_id: number;
  priority?: number;
  attributes?: string;
  contract_id?: number;
  createdAt: string;
  updatedAt: string;
  contract: {
    id: number;
    chain_name: string;
    contract_address: string;
    standard: string;
    paymaster_id?: number | null;
    Chain: {
      chain_name: string;
      chain_id: number;
      chain_type: string;
    };
  };
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

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
      try {
        const collectionData = await axiosInstance.get(
          "/platform/collection-by-address",
          {
            params: {
              contract_address: params.collection_address,
            },
          }
        );
        const { collection_instance } = collectionData.data;

        setCollectionData(collection_instance);

        const response = await axiosInstance.get(
          "platform/metadata/by-collection",
          {
            params: {
              collection_id: collection_instance.id,
            },
          }
        ); // Update with actual API endpoint

        setMetadata(response.data.metadata_instances);

        const randomizedToken = await axiosInstance.get(
          "/platform/metadata-set/by-collection",
          {
            params: {
              collection_id: collection_instance.id,
            },
          }
        );

        setRandomizedTokenMetadata(randomizedToken.data.metadataSets);
      } catch (error) {
        console.error(error);
      }
    };

    if (params.collection_address) {
      fetchNFTData();
    }
  }, [params.collection_address]);

  const [allMetadata, setMetadata] = useState<Metadata[]>([]);

  const [randomizedTokenMetadata, setRandomizedTokenMetadata] = useState<
    MetadataSetWithAllMetadataInstances[]
  >([]);

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
          <div className="relative mb-9">
            <div className="flex items-center justify-between max-md:flex-col">
              <h1
                className={`${orbitron.className} text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-[0_0_12px_#60a5fa] hover:drop-shadow-[0_0_20px_#a78bfa] transition-all duration-500`}
              >
                {" "}
                Collection Assets
              </h1>
              {/* Gradient horizontal rule */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400/85 via-blue-400/85 to-purple-500/50"></div>
              <button
                onClick={openModal}
                className={`${orbitron.className} md:-mt-7 max-md:my-2 px-8 py-3 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg border border-blue-400/50 shadow-[0_0_15px_-3px_#60a5fa,0_0_30px_-5px_#8b5cf6] hover:shadow-[0_0_20px_-5px_#3b82f6,0_0_40px_-10px_#a78bfa] hover:brightness-110 transition-all duration-300 whitespace-nowrap`}
              >
                MINT CUSTOM NFT
              </button>{" "}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {allMetadata.length > 0 ? (
              allMetadata.map((metadata) => (
                <Link
                  key={metadata.id}
                  className="block"
                  href={`/freeMint/${metadata.id}`}
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:bg-white/15">
                    {/* NFT Image */}
                    <div className="relative aspect-square">
                      <img
                        src={
                          metadata.image_url ||
                          "https://via.placeholder.com/300"
                        }
                        alt={metadata.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-xl font-bold text-white">
                          {metadata.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex flex-col justify-between min-h-[150px]">
                      {/* Description with line clamp */}
                      <p className="text-sm text-white/80 line-clamp-2 mb-4">
                        {metadata.description}
                      </p>

                      {/* Stats Row */}
                      <div className="flex justify-between items-center text-xs text-green-400 mb-3">
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
          {randomizedTokenMetadata?.length > 0 && (
            <NeonHeader>Randomized NFT</NeonHeader>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {randomizedTokenMetadata?.length > 0 &&
              randomizedTokenMetadata?.map((metadataSet) => (
                <Link
                  key={metadataSet.id}
                  className="block"
                  href={`/randomizedMint/${metadataSet.id}`}
                >
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:bg-white/15">
                    {/* NFT Image */}
                    <div className="relative aspect-square">
                      <img
                        src={
                          metadataSet.Collection.image_uri ||
                          "https://via.placeholder.com/300"
                        }
                        alt={metadataSet.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-xl font-bold text-white">
                          {metadataSet.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex flex-col justify-between min-h-[150px]">
                      {/* Description with line clamp */}
                      <p className="text-sm text-white/80 line-clamp-2 mb-4">
                        {metadataSet.Collection.description}
                      </p>

                      {/* Stats Row */}
                      <div className="flex justify-between items-center text-xs text-green-400 mb-3">
                        <p>
                          Created:{" "}
                          {new Date(metadataSet.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                          Updated:{" "}
                          {new Date(metadataSet.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>{" "}
        </div>
      </div>

      <CustomNftModal
        isOpen={isModalOpen}
        nftCollectionAddress={collectionData.contract.contract_address!}
        onClose={closeModal}
      />
    </div>
  );
}
