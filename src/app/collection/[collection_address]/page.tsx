"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";
import NftCard from "@/components/NftCard";
import React, { useContext } from "react";

import axiosInstance from "@/utils/axios";
import { Frown, MapPin, MapPinOff } from "lucide-react";
import CustomNftModal from "./CustomNftModal";
import {
  Metadata,
  MetadataSetWithAllMetadataInstances,
} from "@/utils/modelTypes";
  
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

interface BlockchainNFT {
  id: string;
  name: string;
  description: string;
  image_url: string;
  token_id: string;
  owner: string;
}

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function NFTPage() {
  const params = useParams();
  const [collectionData, setCollectionData] = useState<Collection | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mintedNFTs, setMintedNFTs] = useState<BlockchainNFT[]>([]);
  const [isLoadingMinted, setIsLoadingMinted] = useState(false);

  //needed for the NFT modal to function
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fetch NFTs from Sui blockchain
  const fetchCollectionNFTs = async (collectionData: Collection) => {
    if (!collectionData || !collectionData.contract) {
      console.log('No collection data or contract found');
      setMintedNFTs([]);
      return;
    }
    
    setIsLoadingMinted(true);
    try {
      // Now fetch NFTs from Sui blockchain using the correct collection address
      // The contract address in the database is wrong, so we use the actual collection address
      const actualCollectionAddress = "0xdd8720b9dd4e46d9cbc8f74cb9a4bc7654f46729afddb338e5547826ec95863f";
      
      const response = await axiosInstance.get(
        "/platform/sui/nfts/by-collection",
        {
          params: {
            collection_id: actualCollectionAddress,
          },
        }
      );

      console.log('NFTs API response:', response.data);

      if (response.data.success && response.data.data && response.data.data.nfts) {
        const nfts: BlockchainNFT[] = response.data.data.nfts.map((nft: any) => ({
          id: nft.id,
          name: nft.name || 'Unnamed NFT',
          description: nft.description || 'No description',
          image_url: nft.image_url || 'https://via.placeholder.com/300',
          token_id: nft.token_number?.toString() || nft.id,
          owner: nft.owner || 'Unknown',
        }));

        console.log('Mapped NFTs:', nfts);
        setMintedNFTs(nfts);
      } else {
        console.log('No NFTs found in response');
        setMintedNFTs([]);
      }
    } catch (error) {
      console.error('Error fetching collection NFTs:', error);
      setMintedNFTs([]);
    } finally {
      setIsLoadingMinted(false);
    }
  };

  // Check if location permission is already granted
  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      return false;
    }
    
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state === 'granted';
    } catch (error) {
      console.log('Permission API not supported, will check on location request');
      return false;
    }
  };

  // Initialize location state on component mount
  useEffect(() => {
    const initLocationState = async () => {
      const hasPermission = await checkLocationPermission();
      setIsLocationEnabled(hasPermission);
      
      // If we have permission, automatically fetch location data
      if (hasPermission && collectionData) {
        getLocationData();
      }
    };
    
    initLocationState();
  }, [collectionData]);

  function getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error: GeolocationPositionError) => {
          reject(error);
        },
        options
      );
    });
  }

  const [allMetadata, setMetadata] = useState<Metadata[]>([]);
  const [geofencedMetadata, setGeofencedMetadata] = useState<Metadata[]>([]);
  const [randomizedTokenMetadata, setRandomizedTokenMetadata] = useState<
    MetadataSetWithAllMetadataInstances[]
  >([]);

  // Separate function to get location data (without changing permission state)
  const getLocationData = async (): Promise<boolean> => {
    if (!collectionData) return false;

    try {
      // Get user location
      const { latitude, longitude } = await getCurrentPosition();

      // Fetch geofenced metadata
      const geofenced = await axiosInstance.get(
        "/platform/metadata/geo-fenced",
        {
          params: {
            user_lat: latitude,
            user_lon: longitude,
            collection_id: collectionData.id,
          },
        }
      );
      setGeofencedMetadata(geofenced.data.data);
      return true;
    } catch (err: unknown) {
      const anyErr = err as any;
      const code = typeof anyErr?.code === "number" ? anyErr.code : undefined;
      const message = anyErr?.message || "Unknown error";
      console.warn("Location error:", message);

      if (isLocationEnabled) {
        if (code === 1) {
          alert("Location access denied. Please allow location access in your browser settings and try again.");
        } else if (code === 2) {
          alert("Location unavailable. Please check your device's location services and try again.");
        } else if (code === 3) {
          alert("Location request timed out. Please try again.");
        }
      }
      setGeofencedMetadata([]);
      return false;
    }
  };

  const getLocation = async () => {
    setIsLoading(true);
    try {
      // Optimistically enable section so user sees the toggle effect immediately
      setIsLocationEnabled(true);

      // Check if we already have permission
      const hasPermission = await checkLocationPermission();
      
      if (hasPermission) {
        // We already have permission, just get the data
        await getLocationData();
      } else {
        // Request permission by trying to get location
        await getLocationData();
      }
    } catch (err: unknown) {
      const anyErr = err as any;
      const code = typeof anyErr?.code === "number" ? anyErr.code : undefined;
      console.warn("Location error:", anyErr?.message || "Unknown error");
      if (code === 1) {
        alert("Location access denied. Please allow location access in your browser settings and try again.");
      } else if (code === 2) {
        alert("Location unavailable. Please check your device's location services and try again.");
      } else if (code === 3) {
        alert("Location request timed out. Please try again.");
      } else {
        alert("Failed to get location. Please check your browser settings and try again.");
      }
      // Keep location enabled; user can disable manually using the toggle
    } finally {
      setIsLoading(false);
    }
  };

  const disableLocation = () => {
    setIsLocationEnabled(false);
    setGeofencedMetadata([]);
  };

  // Fetch collection data on component mount
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

        // Fetch NFTs from backend API
        await fetchCollectionNFTs(collection_instance);

        // Try to fetch metadata, but don't fail if it doesn't work
        try {
          const response = await axiosInstance.get(
            "platform/metadata/by-collection",
            {
              params: {
                collection_id: collection_instance.id,
              },
            }
          );
          setMetadata(response.data.metadata_instances);
        } catch (metadataError) {
          console.log("Metadata not available for this collection:", metadataError);
          setMetadata([]);
        }

        // Try to fetch randomized token metadata, but don't fail if it doesn't work
        try {
          const randomizedToken = await axiosInstance.get(
            "/platform/metadata-set/by-collection",
            {
              params: {
                collection_id: collection_instance.id,
              },
            }
          );
          setRandomizedTokenMetadata(randomizedToken.data.metadataSets);
        } catch (randomizedError) {
          console.log("Randomized token metadata not available:", randomizedError);
          setRandomizedTokenMetadata([]);
        }
      } catch (error) {
        console.error("Error fetching collection data:", error);
        setError(error as Error);
      }
    };

    if (params.collection_address) {
      fetchNFTData();
    }
  }, [params.collection_address]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Collection API Error</h2>
          <p className="text-white/80 mb-4">Failed to load collection data from the backend API.</p>
          
          {/* Show detailed error info for debugging */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
            <p className="text-red-300 text-sm mb-2">
              <strong>Type:</strong> {error.name || 'Unknown'}
            </p>
            <p className="text-red-300 text-sm mb-2">
              <strong>Message:</strong> {error.message || 'No message available'}
            </p>
            <p className="text-red-300 text-sm mb-2">
              <strong>Collection Address:</strong> {params.collection_address}
            </p>
            <p className="text-red-300 text-sm">
              <strong>Endpoint:</strong> /platform/collection-by-address
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-[#4DA2FF] text-black rounded-lg hover:bg-[#3a8fef] transition-colors font-semibold"
            >
              Retry
            </button>
            <div className="text-white/60 text-sm">
              <p>Check if your backend server is running and the collection exists.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!collectionData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00041f] to-[#030828]">
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-white">
        {/* Banner Section */}
        {/* <div className="w-full h-[200px] overflow-hidden">
          <img
            src={
              collectionData.image_uri ||
              "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
            }
            alt="Banner"
            className="w-full h-auto"
          />
        </div> */}

        {/* Profile Section */}
        <div className="flex items-center mt-[-50px] p-6  shadow-lg rounded-lg w-4/5 mx-auto">
          <div className="flex-shrink-0 py-20 ml-10">
            <img
              src={
                // collectionData.image_uri ||
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

        <div className="p-8 max-w-[1400px] mx-auto">
          {/* Header toolbar */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent  drop-shadow-lg mb-2 text-white/80">
                Collection Assets
              </h1>
              <p className="text-white/60 text-sm md:text-base">
                {mintedNFTs.length} minted, {allMetadata.length} mintable assets
              </p>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-end">
              <span className="text-white/70 text-sm px-4 py-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
                {mintedNFTs.length + allMetadata.length} total assets
              </span>
              <button
                onClick={() => openModal()}
                className="px-6 py-3 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white border-0 transition-all duration-200  shadow-lg" 
              >
                Mint Custom NFT
              </button>
              <button
                onClick={isLocationEnabled ? disableLocation : getLocation}
                disabled={isLoading}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 ${
                  isLocationEnabled
                    ? 'bg-green-600 text-white border-transparent hover:from-green-600 hover:to-emerald-700 shadow-lg'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isLocationEnabled 
                  ? "Location access enabled - Click to disable location tracking" 
                  : "Click to enable location access for location-specific NFTs"
                }
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </div>
                ) : isLocationEnabled ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location Enabled
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPinOff className="w-4 h-4" /> Enable Location
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Minted NFTs Section */}
          {isLoadingMinted ? (
            <div className="mt-12 mb-20 py-10">
             
              <div className="flex items-center justify-center min-h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-white">Loading minted NFTs...</span>
              </div>
            </div>
          ) : mintedNFTs.length > 0 ? (
            <div className="mt-16">
              {/* <h3 className="py-6 font-bold tracking-widest text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg text-center">
                Minted NFTs ({mintedNFTs.length})
              </h3> */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
                {isLocationEnabled && (randomizedTokenMetadata || [])
                  .slice()
                  .sort((a, b) => {
                    const aImg = !!(a?.Collection?.image_uri);
                    const bImg = !!(b?.Collection?.image_uri);
                    return Number(bImg) - Number(aImg);
                  })
                  .map((metadataSet) => {
                  const isNearby = (geofencedMetadata || []).some((m) => m.set_id === metadataSet.id);
                  return (
                    <NftCard
                      key={`lucky-${metadataSet.id}`}
                      href={`/randomizedMint/${metadataSet.id}`}
                      imageUrl={metadataSet.Collection.image_uri || "https://via.placeholder.com/300"}
                      title={metadataSet.name}
                      description={metadataSet.Collection.description}
                      badge={{
                        text: isNearby ? "Lucky Draw • Nearby" : "Lucky Draw",
                        className: isNearby ? "bg-orange-500" : "bg-purple-600",
                      }}
                      footer={
                        <div className="flex justify-center py-4">
                          <button className="border-2 border-gray-700 rounded-xl py-2 px-8 font-semibold transition-all duration-200 hover:scale-105 shadow-lg">
                            Mint NFT
                          </button>
                        </div>
                      }
                    />
                  );
                })}
                {mintedNFTs
                  .slice()
                  .sort((a, b) => {
                    const aHasHttps = typeof a.image_url === "string" && a.image_url.startsWith("https://");
                    const bHasHttps = typeof b.image_url === "string" && b.image_url.startsWith("https://");
                    return Number(bHasHttps) - Number(aHasHttps);
                  })
                  .map((nft: BlockchainNFT) => (
                  <NftCard
                    key={nft.id}
                    href={`/freeMint/${nft.id}`}
                    imageUrl={nft.image_url}
                    title={nft.name}
                    description={nft.description}
                    footer={
                      <div className="flex justify-center py-4">
                        <button className="border-2 border-gray-700 rounded-xl py-2 px-10 hover:text-white transition-all duration-200 shadow-lg shadow-gray-700">
                          Mint NFT
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* (Removed) Global assets section per requirement: show only Nearby (location) and Lucky Draw */}

          {/* Location Specific Assets Section */}
          {geofencedMetadata.length > 0 && (
            <div className="mt-16 mb-20">
              <h3 className="py-6 font-bold tracking-widest text-2xl bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 drop-shadow-lg text-center">
                Location Specific ({geofencedMetadata.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {geofencedMetadata.map((metadata) => (
                  <div
                    key={metadata.id}
                    className="bg-white/5 backdrop-blur-lg rounded-xl border border-orange-400/30 overflow-hidden shadow-lg transition-all hover:scale-[1.02] hover:bg-white/10 relative opacity-70"
                  >
                      {/* Location Badge */}
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Location
                      </div>
                      
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
                        <p className="text-sm text-white/60 line-clamp-2 mb-4">
                          {metadata.description}
                        </p>

                        {/* Location Restriction Message */}
                        <div className="flex items-center justify-between text-xs text-orange-400 mb-3">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>Available in specific locations only</span>
                          </span>
                          <button className="border-2 border-gray-700 rounded-xl py-1 px-3 text-white hover:text-white transition-all duration-200 shadow-lg shadow-gray-800">
                            Mint NFT
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* No Assets Message - Only show if no minted NFTs AND no mintable assets */}
          {mintedNFTs.length === 0 && allMetadata.length === 0 && !isLoadingMinted && (
            <div className="mt-12">
              <div className="flex flex-col items-center justify-center min-h-52 space-y-4">
                <Frown className="w-24 h-24 text-blue-600 animate-bounce" />
                <p className="text-xl text-gray-400 font-semibold">
                  This Collection does not have any assets yet.
                </p>
                <p className="text-sm text-gray-500">
                  Check back later or explore other collections.
                </p>
              </div>
            </div>
          )}

          {/* Lucky Draw NFTs Section with Location Control */}
          <div className="mt-16">
            <h3 className="py-6 font-semibold tracking-widest text-2xl border-b-2 border-white/20 bg-clip-text text-transparent text-white drop-shadow-lg text-center">
              Lucky Draw NFTs
            </h3>

            {!isLocationEnabled ? (
              <div className="flex flex-col items-center justify-center min-h-32 space-y-4 bg-white/5 rounded-lg border border-white/10 p-8">
                <MapPin className="w-12 h-12 text-blue-400" />
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-semibold text-white">
                    Enable Location to View Lucky Draw NFTs
                  </h4>
                  <p className="text-gray-300 max-w-md">
                    Use the &quot;Enable Location&quot; button above to view available Lucky Draw NFTs in your area.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {(() => {
                  const geofencedSetIds = new Set(
                    (geofencedMetadata || [])
                      .map((m) => m.set_id)
                      .filter((id) => typeof id === "number") as number[]
                  );
                  const allSets = (randomizedTokenMetadata || []).slice();
                  // Sort: nearby first
                  allSets.sort((a, b) => {
                    const aNear = geofencedSetIds.has(a.id) ? 1 : 0;
                    const bNear = geofencedSetIds.has(b.id) ? 1 : 0;
                    return bNear - aNear;
                  });

                  if (allSets.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center min-h-32 space-y-2 bg-white/5 rounded-lg border border-white/10 p-6 text-white/70">
                        <p>No Lucky Draw NFTs are available for this collection yet.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 mt-20 mb-20 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {allSets.map((metadataSet) => (
                        <NftCard
                          key={metadataSet.id}
                          href={`/randomizedMint/${metadataSet.id}`}
                          imageUrl={metadataSet.Collection.image_uri || "https://via.placeholder.com/300"}
                          title={metadataSet.name}
                          description={metadataSet.Collection.description}
                          badge={
                            geofencedSetIds.has(metadataSet.id)
                              ? { text: "Nearby", className: "bg-orange-500" }
                              : undefined
                          }
                          footer={
                            <div className="flex justify-center py-4">
                              <button className="border-2 border-gray-700 rounded-xl py-2 px-8 font-semibold transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-lg">
                                Mint NFT
                              </button>
                            </div>
                          }
                        />
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Geofenced NFTs Section */}
          {geofencedMetadata.length > 0 && (
            <div className="mt-12">
              <h3 className="py-6 font-bold tracking-widest text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg text-center">
                Congratulations, There are Exclusive NFTs available in your
                location
              </h3>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {geofencedMetadata.length > 0 &&
              geofencedMetadata.map((metadata) => (
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
                      <p className="text-sm text-white/80 line-clamp-2 mb-4">
                        {metadata.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-green-400 mb-3">
                        <p>
                          Created: {new Date(metadata.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                          Updated: {new Date(metadata.updatedAt).toLocaleDateString()}
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
        nftCollectionAddress={collectionData?.contract?.contract_address || ""}
        collectionOwnerAddress={collectionData?.contract?.contract_address || ""}
        onClose={closeModal}
        onMintSuccess={() => {
          // Refresh the collection NFTs after successful mint
          if (collectionData) {
            fetchCollectionNFTs(collectionData);
          }
        }}
      />
    </div>
  );
} 