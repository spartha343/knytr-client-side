export interface IPathaoCity {
  cityId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPathaoZone {
  zoneId: number;
  cityId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPathaoArea {
  areaId: number;
  zoneId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPathaoDelivery {
  id: string;
  orderId: string;
  pathaoStoreId: string;
  consignmentId?: string | null;
  invoiceId?: string | null;
  status: string;
  recipientCity: number;
  recipientZone: number;
  recipientArea: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress?: string | null;
  deliveryFee?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePathaoDeliveryInput {
  recipientCityId: number;
  recipientZoneId: number;
  recipientAreaId: number;
}

export interface IPathaoCredentials {
  id: string;
  branchId: string;
  clientId: string;
  clientSecret: string;
  username: string;
  environment: "sandbox" | "production";
  webhookSecret?: string | null;
  isActive: boolean;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPathaoCredentialsInput {
  branchId: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  environment: "sandbox" | "production";
  webhookSecret?: string;
}
