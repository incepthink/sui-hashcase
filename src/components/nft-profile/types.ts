export interface Contract {
  id: number;
  chain_name: string;
  contract_address: string;
  standard: string;
  paymaster_id?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  image_uri?: string;
  banner_image?: string | null;
  chain_name: string;
  owner_id: number;
  priority?: number;
  attributes?: string;
  collection_address: string;
  cap_id?: string | null;
  package_id?: string | null;
  contract_id?: number | null;
  telegram_id?: string | null;
  tags?: string | null;
  contract?: Contract;
  createdAt: string;
  updatedAt: string;
}

export interface NFT {
  id: number;
  token_id: number;
  user_id: number;
  collection_id: number;
  metadata_id: number;
  name: string;
  description: string;
  image_uri: string;
  attributes: string;
  sui_object_id?: string;
  type: string;
  status: string;
  priority: number;
  can_mint_again: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Metadata {
  id: number;
  title?: string;
  description?: string;
  animation_url?: string;
  image_url?: string;
  collection_id: number;
  token_uri?: string;
  attributes?: string;
  latitude?: string;
  longitude?: string;
  price?: number | null;
  set_id?: number | null;
  is_active: boolean;
  probability?: number | null;
  unlockable_content?: string | null;
  collection?: Collection;
  nft?: NFT;
  createdAt: string;
  updatedAt: string;
}