export interface IAddress {
  id: string;
  branchId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBranch {
  id: string;
  name: string;
  storeId: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  store?: {
    id: string;
    name: string;
    vendor?: {
      id: string;
      email: string;
    };
  };
  address?: IAddress;
}

export interface ICreateBranchInput {
  name: string;
  storeId: string;
  contactPhone?: string;
  contactEmail?: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface IUpdateBranchInput {
  name?: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive?: boolean;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
}
