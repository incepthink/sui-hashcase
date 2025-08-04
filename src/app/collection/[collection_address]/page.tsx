"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Link from "next/link";
import React, { useContext } from "react";

import axiosInstance from "@/utils/axios";
import { Frown, MapPin } from "lucide-react";
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

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function NFTPage() {
  const params = useParams();
  const [collectionData, setCollectionData] = useState<Collection | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(() => {
    // Check multiple sources for location state
    if (typeof window !== 'undefined') {
      // Check sessionStorage first (persists during browser session)
      const sessionState = sessionStorage.getItem('locationEnabled');
      if (sessionState === 'true') return true;
      
      // Check URL parameter as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const urlState = urlParams.get('location');
      if (urlState === 'enabled') return true;
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);

  //needed for the NFT modal to function
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Function to save location state with multiple fallbacks
  const saveLocationState = (enabled: boolean) => {
    setIsLocationEnabled(enabled);
    
    if (typeof window !== 'undefined') {
      // Save to sessionStorage (persists during browser session)
      sessionStorage.setItem('locationEnabled', enabled.toString());
      
      // Update URL parameter as backup
      const url = new URL(window.location.href);
      if (enabled) {
        url.searchParams.set('location', 'enabled');
      } else {
        url.searchParams.delete('location');
      }
      
      // Update URL without page reload
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Function to disable location
  const disableLocation = () => {
    saveLocationState(false);
    // Clear the metadata when location is disabled
    setMetadata([]);
    setGeofencedMetadata([]);
    setRandomizedTokenMetadata([]);
  };

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

  const getLocation = async () => {
    setIsLoading(true);
    try {
      // First fetch collection data if not already fetched
      if (!collectionData) {
        const collectionDataResponse = await axiosInstance.get(
          "/platform/collection-by-address",
          {
            params: {
              contract_address: params.collection_address,
            },
          }
        );
        const { collection_instance } = collectionDataResponse.data;
        setCollectionData(collection_instance);
      }

      // Get user location with better error handling
      const { latitude, longitude } = await getCurrentPosition();
      saveLocationState(true);

      // Fetch all metadata
      const response = await axiosInstance.get(
        "platform/metadata/by-collection",
        {
          params: {
            collection_id: collectionData?.id || collectionData?.id,
          },
        }
      );
      setMetadata(response.data.metadata_instances);

      // Fetch geofenced metadata
      const geofenced = await axiosInstance.get(
        "/platform/metadata/geo-fenced",
        {
          params: {
            user_lat: latitude,
            user_lon: longitude,
            collection_id: collectionData?.id || collectionData?.id,
          },
        }
      );
      setGeofencedMetadata(geofenced.data.data);

      // Fetch randomized token metadata
      const randomizedToken = await axiosInstance.get(
        "/platform/metadata-set/by-collection",
        {
          params: {
            collection_id: collectionData?.id || collectionData?.id,
          },
        }
      );
      setRandomizedTokenMetadata(randomizedToken.data.metadataSets);

    } catch (error: any) {
      console.error("Location error:", error);
      
      // Handle different types of location errors
      if (error.code === 1) {
        alert("Location access denied. Please allow location access in your browser settings and try again.");
      } else if (error.code === 2) {
        alert("Location unavailable. Please check your device's location services and try again.");
      } else if (error.code === 3) {
        alert("Location request timed out. Please try again.");
      } else {
        alert("Failed to get location. Please check your browser settings and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch collection data on component mount
  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const collectionDataResponse = await axiosInstance.get(
          "/platform/collection-by-address",
          {
            params: {
              contract_address: params.collection_address,
            },
          }
        );
        const { collection_instance } = collectionDataResponse.data;
        setCollectionData(collection_instance);
      } catch (error) {
        console.error(error);
      }
    };

    if (params.collection_address) {
      fetchCollectionData();
    }
  }, [params.collection_address]);

  // Auto-fetch NFT data if location is already enabled
  useEffect(() => {
    const fetchNFTData = async () => {
      if (isLocationEnabled && collectionData) {
        setIsLoading(true);
        try {
          // Get current location with retry mechanism
          let coordinates;
          try {
            coordinates = await getCurrentPosition();
          } catch (locationError) {
            console.error("Location access failed:", locationError);
            // If location fails, disable it and show message
            saveLocationState(false);
            alert("Location access failed. Please enable location permissions and try again.");
            return;
          }

          const { latitude, longitude } = coordinates;

          // Fetch all metadata
          const response = await axiosInstance.get(
            "platform/metadata/by-collection",
            {
              params: {
                collection_id: collectionData.id,
              },
            }
          );
          setMetadata(response.data.metadata_instances);

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

          // Fetch randomized token metadata
          const randomizedToken = await axiosInstance.get(
            "/platform/metadata-set/by-collection",
            {
              params: {
                collection_id: collectionData.id,
              },
            }
          );
          setRandomizedTokenMetadata(randomizedToken.data.metadataSets);

        } catch (error: any) {
          console.error("Auto-fetch error:", error);
          // If any API call fails, keep location enabled but show error
          alert("Failed to fetch NFT data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      fetchNFTData();
    }, 100);

    return () => clearTimeout(timer);
  }, [isLocationEnabled, collectionData]);

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
      <div className="bg-gradient-to-b from-[#00041f] to-[#030828] text-white flex flex-col justify-center items-center py-20">

        {/* Profile Section */}
        <div className="flex items-center mt-[-30px] p-6 bg-white/5 rounded-lg border border-white/10 w-4/5 mx-auto">
          <div className="flex-shrink-0">
            <img
              src={
                collectionData.image_uri ||
                "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
              }
              alt="Logo"
              className="w-20 h-20 rounded-full border-2 border-gray-300"
            />
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-semibold text-white">{collectionData.name}</h2>
            <p className="text-gray-300">{collectionData.description}</p>
          </div>
        </div>

        <div className="p-8 max-w-[1600px] mx-auto w-full">
          <h1 className="text-4xl font-bold mb-8 text-white text-center">
            Collection Assets
          </h1>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={isLocationEnabled ? disableLocation : getLocation}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isLocationEnabled 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </div>
              ) : isLocationEnabled ? (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Disable Location
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Enable Location
                </div>
              )}
            </button>
            
            <button
              onClick={() => openModal()}
              className="px-6 py-3 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Mint Custom NFT
            </button>
          </div>

          {!isLocationEnabled ? (
            // Show enable location message instead of NFTs
            <div className="flex flex-col items-center justify-center min-h-64 space-y-6">
              <MapPin className="w-16 h-16 text-blue-400" />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-white">
                  Enable Location to View NFTs
                </h2>
                <p className="text-gray-300 max-w-md">
                  Click the "Enable Location" button above to view available NFTs in your area.
                </p>
              </div>
            </div>
          ) : (
            // Show NFTs after location is enabled
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {allMetadata.length > 0 ? (
                  allMetadata.map((metadata) => (
                    <Link
                      key={metadata.id}
                      className="block"
                      href={`/freeMint/${metadata.id}`}
                    >
                      <div className="bg-white/10 rounded-lg border border-white/20 overflow-hidden hover:bg-white/15 transition-colors">
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
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                            <h3 className="text-lg font-semibold text-white">
                              {metadata.title}
                            </h3>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                            {metadata.description}
                          </p>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Created: {new Date(metadata.createdAt).toLocaleDateString()}</span>
                            <span>Updated: {new Date(metadata.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center min-h-48 space-y-4">
                    <Frown className="w-16 h-16 text-gray-400" />
                    <div className="text-center">
                      <p className="text-xl text-gray-300 font-medium">
                        This Collection does not have any mintable assets.
                      </p>
                      <p className="text-gray-500 mt-2">
                        Check back later or explore other collections.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {randomizedTokenMetadata?.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-white text-center mb-6">
                    Lucky Draw NFTs
                  </h3>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {randomizedTokenMetadata?.length > 0 &&
                  randomizedTokenMetadata?.map((metadataSet) => (
                    <Link
                      key={metadataSet.id}
                      className="block"
                      href={`/randomizedMint/${metadataSet.id}`}
                    >
                      <div className="bg-purple-500/10 rounded-lg border border-purple-400/30 overflow-hidden hover:bg-purple-500/15 transition-colors">
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
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                            <h3 className="text-lg font-semibold text-white">
                              {metadataSet.name}
                            </h3>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                            {metadataSet.Collection.description}
                          </p>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Created: {new Date(metadataSet.createdAt).toLocaleDateString()}</span>
                            <span>Updated: {new Date(metadataSet.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>

              {geofencedMetadata.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-white text-center mb-6">
                    Exclusive Location-Based NFTs
                  </h3>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {geofencedMetadata.length > 0 &&
                  geofencedMetadata.map((metadata) => (
                    <Link
                      key={metadata.id}
                      className="block"
                      href={`/freeMint/${metadata.id}`}
                    >
                      <div className="bg-green-500/10 rounded-lg border border-green-400/30 overflow-hidden hover:bg-green-500/15 transition-colors">
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
                          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                            EXCLUSIVE
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                            <h3 className="text-lg font-semibold text-white">
                              {metadata.title}
                            </h3>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                            {metadata.description}
                          </p>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Created: {new Date(metadata.createdAt).toLocaleDateString()}</span>
                            <span>Updated: {new Date(metadata.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </>
          )}
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
