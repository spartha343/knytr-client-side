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
  secondaryPhone?: string | null;
  deliveryAddress?: string | null;
  deliveryLocation: DeliveryLocation;
  deliveryCharge: number;
  specialInstructions?: string | null;
  recipientCityId?: number | null;
  recipientZoneId?: number | null;
  recipientAreaId?: number | null;
  userId?: string | null;
  storeId: string;
  assignedBranchId?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: string | null;
  cancelledAt?: string | null;
  activities?: IOrderActivity[];
  cancelledByUser?: {
    id: string;
    email?: string | null;
    firebaseUid: string;
  } | null;
  pathaoDelivery?: {
    id: string;
    consignmentId?: string | null;
    invoiceId?: string | null;
    status: string;
    deliveryFee?: number | null;
    createdAt: string;
    statusHistory?: {
      id: string;
      status: string;
      createdAt: string;
    }[];
  } | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
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
  secondaryPhone?: string;
  deliveryAddress?: string;
  deliveryLocation: DeliveryLocation;
  specialInstructions?: string;
  recipientCityId?: number;
  recipientZoneId?: number;
  recipientAreaId?: number;
  storeId: string;
  paymentMethod?: PaymentMethod;
  items: ICreateOrderItem[];
}

export interface IUpdateOrderInput {
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  secondaryPhone?: string;
  deliveryAddress?: string;
  deliveryLocation?: DeliveryLocation;
  specialInstructions?: string;
  recipientCityId?: number;
  recipientZoneId?: number;
  recipientAreaId?: number;
  items?: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    priceOverride?: number;
  }>;
  deliveryChargeOverride?: number;
  editNotes?: string;
}

export interface IUpdateOrderStatusInput {
  status: OrderStatus;
}

export interface IAssignBranchInput {
  branchId: string;
}

export interface ICancelOrderInput {
  reason?: string;
}

export interface IOrderActivity {
  id: string;
  orderId: string;
  userId?: string | null;
  action: string;
  description?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email?: string | null;
    firebaseUid: string;
  } | null;
}

// Manual order item (vendor-side, with price override)
export interface IManualOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
}

// Manual order creation input (vendor creates directly as CONFIRMED)
export interface ICreateManualOrderInput {
  storeId: string;
  customerPhone: string;
  customerName?: string;
  customerEmail?: string;
  secondaryPhone?: string;
  specialInstructions?: string;
  items: IManualOrderItem[];
  deliveryLocation: DeliveryLocation;
  recipientCityId: number;
  recipientZoneId: number;
  recipientAreaId: number;
  deliveryAddress?: string;
  deliveryCharge: number;
  paymentMethod?: PaymentMethod;
}

// UI-only type for the order item used in the manual order wizard
export interface IManualOrderWizardItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantSku?: string | null;
  originalPrice: number;
  price: number;
  quantity: number;
  subtotal: number;
  availableStock?: number | null; // total available across all inventories (null = not tracked)
}
