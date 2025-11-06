import { ItemStatus, ItemType } from "./enums";

type ItemAttributes = {
  name: string;
  description?: string;
  image_uri?: string;
  collection_id: number;
  token_id: number;
  type?: ItemType;
  status?: ItemStatus;
  priority?: number;
  attributes?: string;
};

type ExtendId = {
  id: number;
};

type Item = ItemAttributes & ExtendId;

type Chain = {
  chain_name: string;
  chain_id: number;
  chain_type: string;
  createdAt: string;
  updatedAt: string;
};

type Contract = {
  id: number;
  chain_name: string;
  contract_address: string;
  standard: string;
  paymaster_id: number | null;
  unlockable_content: string | null;
  createdAt: string;
  updatedAt: string;
  Chain: Chain;
};

type Collection = {
  id: number;
  name: string;
  description: string;
  image_uri: string;
  chain_name: string;
  owner_id: number;
  priority: number;
  attributes: string;
  contract_id: number;
  createdAt: string;
  updatedAt: string;
  contract: Contract;
};

type Metadata = {
  id: number;
  title: string;
  description: string;
  animation_url: string;
  image_url: string;
  collection_id: number;
  token_uri: string;
  attributes: string;
  latitude: number | null;
  longitude: number | null;
  set_id: number;
  probability?: string | null;
  package_id?: string;
  createdAt: string;
  updatedAt: string;
};

type MetadataSet = {
  id: number;
  name: string;
  collection_id: number;
  isRandomized: boolean;
  isUpgradable: boolean;
  createdAt: string; // or Date if you prefer
  updatedAt: string; // or Date if you prefer
};

type MetadataInstanceWithMetadataSet = {
  id: number;
  title: string;
  description: string;
  animation_url: string | null;
  image_url: string;
  collection_id: number;
  token_uri: string;
  attributes: string;
  latitude: string;
  longitude: string;
  set_id: number;
  createdAt: string;
  updatedAt: string;
  metadata_set: MetadataSet;
};

type MetadataSetWithAllMetadataInstances = {
  id: number;
  name: string;
  collection_id: number;
  isRandomized: boolean;
  isUpgradable: boolean;
  createdAt: string; // or Date
  updatedAt: string; // or Date
  Collection: Collection;
  metadata: Metadata[];
};

type EmittedNFTInfo = {
  collection_id: string;
  creator: string;
  mint_price: string;
  nft_id: string;
  recipient: string;
  token_number: string;
};

export interface NFTMetadata {
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
  is_active: boolean;
  set_id?: number | null;
  location?: boolean;
}

export interface SetGroup {
  id: number;
  name: string;
  collection_id: number;
  isRandomized: boolean;
  isUpgradable: boolean;
  createdAt: string;
  updatedAt: string;
  set_nfts: NFTMetadata[];
}

export type MetadataItem = NFTMetadata | SetGroup;

export const isSetGroup = (item: MetadataItem): item is SetGroup => {
  return "set_nfts" in item;
};


export type {
  ItemAttributes,
  Item,
  Collection,
  Metadata,
  MetadataInstanceWithMetadataSet,
  MetadataSetWithAllMetadataInstances,
  EmittedNFTInfo,
};
