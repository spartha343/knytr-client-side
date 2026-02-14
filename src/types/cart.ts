export interface ICartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  priceSnapshot: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    storeId: string;
    basePrice: number;
    comparePrice: number | null;
    isDeleted: boolean;
    media: Array<{
      mediaUrl: string;
    }>;
  };
  variant: {
    id: string;
    sku: string;
    price: number | null;
    imageUrl: string | null;
    variantAttributes: Array<{
      attributeValue: {
        id: string;
        value: string;
        attribute: {
          id: string;
          name: string;
        };
      };
    }>;
  } | null;
}

export interface ICart {
  id: string;
  userId: string;
  items: ICartItem[];
  createdAt: string;
  updatedAt: string;
}
