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
  const collectionAddress = decodeURIComponent(String(params.collection_address || "")).trim();
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
  const fetchCollectionNFTs = async (collectionAddress: string) => {
    if (!collectionAddress) {
      setMintedNFTs([]);
      return;
    }
    setIsLoadingMinted(true);
    try {
      const response = await axiosInstance.get(
        "/platform/sui/nfts/by-collection",
        { params: { collection_id: collectionAddress } }
      );
      if (response.data.success && response.data.data && response.data.data.nfts) {
        const rawNfts: any[] = response.data.data.nfts || [];
        // Ensure we only show NFTs for this collection
        const filtered = rawNfts.filter((nft: any) => String(nft.collection_id).toLowerCase() === String(collectionAddress).toLowerCase());
        const nfts: BlockchainNFT[] = filtered.map((nft: any) => ({
          id: nft.id,
          name: nft.name || 'Unnamed NFT',
          description: nft.description || 'No description',
          image_url: nft.image_url || 'https://via.placeholder.com/300',
          token_id: nft.token_number?.toString() || nft.id,
          owner: nft.owner || 'Unknown',
        }));
        setMintedNFTs(nfts);
      } else {
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
    try {
      // Always request geolocation first; success means we can enable the toggle
      const { latitude, longitude } = await getCurrentPosition();

      // If DB collection exists, try to fetch geofenced metadata; otherwise skip silently
      if (collectionData?.id) {
        try {
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
        } catch (geoErr) {
          console.log("Geofenced metadata not available:", geoErr);
          setGeofencedMetadata([]);
        }
      }

      return true;
    } catch (err: unknown) {
      const anyErr = err as any;
      const code = typeof anyErr?.code === "number" ? anyErr.code : undefined;
      const message = anyErr?.message || "Unknown error";
      console.warn("Location error:", message);
      if (code === 1) {
        alert("Location access denied. Please allow location access in your browser settings and try again.");
      } else if (code === 2) {
        alert("Location unavailable. Please check your device's location services and try again.");
      } else if (code === 3) {
        alert("Location request timed out. Please try again.");
      }
      setGeofencedMetadata([]);
      return false;
    }
  };

  const getLocation = async () => {
    setIsLoading(true);
    try {
      // Attempt to fetch geofenced data; enable only on success
      const ok = await getLocationData();
      setIsLocationEnabled(!!ok);
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
      setIsLocationEnabled(false);
      // Keep location enabled; user can disable manually using the toggle
    } finally {
      setIsLoading(false);
    }
  };

  const disableLocation = () => {
    setIsLocationEnabled(false);
    setGeofencedMetadata([]);
    setRandomizedTokenMetadata([]);
    // Best-effort revoke (may not be supported by all browsers)
    try {
      const anyNav: any = navigator as any;
      if (anyNav?.permissions?.revoke) {
        anyNav.permissions.revoke({ name: 'geolocation' as PermissionName }).catch(() => {});
      }
    } catch {}
  };

  // Fetch collection data on component mount
  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        // Try to load collection details from DB (non-fatal)
        try {
          const collectionRes = await axiosInstance.get(
            "/platform/collection-by-address",
            { params: { contract_address: collectionAddress } }
          );
          const { collection_instance } = collectionRes.data;
          setCollectionData(collection_instance);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            console.warn('Collection not found in DB, continuing with chain-only data');
          } else {
            throw err;
          }
        }

        // Fetch NFTs from backend API using the route param address
        await fetchCollectionNFTs(collectionAddress);

        // Only fetch DB metadata if we have a DB collection
        if (collectionData?.id) {
          try {
            const response = await axiosInstance.get(
              "platform/metadata/by-collection",
              { params: { collection_id: collectionData.id } }
            );
            setMetadata(response.data.metadata_instances);
          } catch (metadataError) {
            console.log("Metadata not available for this collection:", metadataError);
            setMetadata([]);
          }

          try {
            const randomizedToken = await axiosInstance.get(
              "/platform/metadata-set/by-collection",
              { params: { collection_id: collectionData.id } }
            );
            setRandomizedTokenMetadata(randomizedToken.data.metadataSets);
          } catch (randomizedError) {
            console.log("Randomized token metadata not available:", randomizedError);
            setRandomizedTokenMetadata([]);
          }
        }
      } catch (error) {
        console.error("Error fetching collection data:", error);
        setError(error as Error);
      }
    };

    if (collectionAddress) {
      fetchNFTData();
    }
  }, [collectionAddress]);

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

  // Do not block render if DB collection is missing; render with fallbacks
  return (
    <div className="min-h-screen  bg-gradient-to-b from-[#00041f] to-[#030828]">
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
        <div className="max-w-6xl mx-auto  p-6 flex items-center gap-6">
          <div className="flex-shrink-0">
            <img
              src={
                // collectionData.image_uri ||
                "https://i.pinimg.com/564x/49/cc/10/49cc10386c922de5e2e3c0bb66956e65.jpg"
              }
              alt="Logo"
              className="w-24 h-24 rounded-full border-2 border-gray-300"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{collectionData?.name || 'Sui Collection'}</h2>
            <p className="text-gray-300">{collectionData?.description || ''}</p>
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
                {mintedNFTs.length} minted
              </p>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-end">
              <span className="text-white/70 text-sm px-4 py-2 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
                {mintedNFTs.length} total assets
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
            <div className="mt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
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
                          View NFT
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* Removed DB-driven sections: Lucky Draw / Location Specific */}
          {/* Intentionally hidden per requirement to show only on-chain NFTs from this collection */}

          {/* No Assets Message - Only show if no minted NFTs AND no mintable assets */}
          {!isLoadingMinted && mintedNFTs.length === 0 && (
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
          {isLocationEnabled && (
          <div className="mt-16">
            <h3 className="py-6 font-semibold tracking-widest text-2xl border-b-2 border-white/20 text-white text-center">
              Randomized NFTs Nearby
            </h3>

            {(() => {
              let cards = (geofencedMetadata && geofencedMetadata.length > 0)
                ? geofencedMetadata.map((m) => ({ id: m.id, image: m.image_url, title: m.title, description: m.description }))
                : (randomizedTokenMetadata && randomizedTokenMetadata.length > 0)
                ? (randomizedTokenMetadata || []).map((set) => ({ id: set.id, image: set.Collection.image_uri, title: set.name, description: set.Collection.description }))
                : (mintedNFTs && mintedNFTs.length > 0)
                ? mintedNFTs.map((n) => ({ id: n.id, image: n.image_url, title: n.name, description: n.description }))
                : [] as { id: string | number; image: string; title: string; description: string }[];

              // If falling back to on-chain minted NFTs, pick up to 2 at random
              if (cards.length > 0 && (randomizedTokenMetadata?.length ?? 0) === 0 && (geofencedMetadata?.length ?? 0) === 0) {
                const shuffled = [...cards].sort(() => Math.random() - 0.5);
                cards = shuffled.slice(0, Math.min(2, shuffled.length));
              }

              if (!cards || cards.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center min-h-32 space-y-2 bg-white/5 rounded-lg border border-white/10 p-6 text-white/70">
                    <p>No location-based NFTs are available for this collection yet.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 mt-10 mb-10 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cards.map((c) => (
                    <NftCard
                      key={`loc-${c.id}`}
                      href={`/freeMint/${c.id}`}
                      imageUrl={c.image || "https://via.placeholder.com/300"}
                      title={c.title}
                      description={c.description}
                      footer={
                        <div className="flex justify-center py-4">
                          <button className="border-2 border-gray-700 rounded-xl py-2 px-8 font-semibold transition-all duration-200">
                            View NFT
                          </button>
                        </div>
                      }
                    />
                  ))}
                </div>
              );
            })()}
          </div>
          )}

          {/* Geofenced NFTs Section */}
         {/* (hidden) */}
        </div>
      </div>

      <CustomNftModal
        isOpen={isModalOpen}
        nftCollectionAddress={collectionAddress || ""}
        collectionOwnerAddress={collectionAddress || ""}
        onClose={closeModal}
        onMintSuccess={() => {
          // Refresh the collection NFTs after successful mint
          fetchCollectionNFTs(collectionAddress);
        }}
      />
    </div>
  );
} 