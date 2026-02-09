export interface IStore {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  vendorId: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    email: string;
  };
}

export interface ICreateStoreInput {
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface IUpdateStoreInput {
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface IStoreResponse {
  success: boolean;
  message: string;
  data: IStore;
}

export interface IStoresResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: IStore[];
}
