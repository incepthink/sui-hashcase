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

export type { ItemAttributes, Item };
