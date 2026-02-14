export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  SHIPPED = "SHIPPED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum DeliveryLocation {
  INSIDE_DHAKA = "INSIDE_DHAKA",
  OUTSIDE_DHAKA = "OUTSIDE_DHAKA",
}

export enum PaymentMethod {
  COD = "COD",
  BKASH = "BKASH",
  NAGAD = "NAGAD",
  ROCKET = "ROCKET",
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  branchId?: string | null;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  productName: string;
  variantName?: string | null;
  productImage?: string | null;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  };
  variant?: {
    id: string;
    sku: string;
  } | null;
  branch?: {
    id: string;
    name: string;
    address?: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
    } | null;
  } | null;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  customerPhone: string;
  customerName?: string | null;
  customerEmail?: string | null;
  policeStation?: string | null;
  deliveryDistrict?: string | null;
  deliveryArea?: string | null;
  deliveryAddress?: string | null;
  deliveryLocation: DeliveryLocation;
  deliveryCharge: number;
  userId?: string | null;
  storeId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  isVoiceConfirmed: boolean;
  voiceConfirmedAt?: string | null;
  voiceConfirmedBy?: string | null;
  isEditedByVendor: boolean;
  editedAt?: string | null;
  editNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email?: string | null;
    firebaseUid: string;
  } | null;
  store?: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    contactPhone?: string | null;
    whatsappNumber?: string | null;
  };
  items: IOrderItem[];
}

export interface ICreateOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface ICreateOrderInput {
  customerPhone: string;
  customerName?: string;
  customerEmail?: string;
  policeStation?: string;
  deliveryDistrict?: string;
  deliveryArea?: string;
  deliveryAddress?: string;
  deliveryLocation: DeliveryLocation;
  storeId: string;
  paymentMethod?: PaymentMethod;
  items: ICreateOrderItem[];
}

export interface IUpdateOrderInput {
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  policeStation?: string;
  deliveryDistrict?: string;
  deliveryArea?: string;
  deliveryAddress?: string;
  deliveryLocation?: DeliveryLocation;
  editNotes?: string;
}

export interface IUpdateOrderStatusInput {
  status: OrderStatus;
  editNotes?: string;
}

export interface IAssignBranchInput {
  branchId: string;
}
