import { ICategory } from "./category";
import { IBrand } from "./brand";
import { IAttribute, IAttributeValue } from "./attribute";

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  comparePrice?: number;
  categoryId: string;
  brandId: string;
  storeId: string;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  freeShipping: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ICategory;
  brand?: IBrand;
  store?: {
    id: string;
    name: string;
    slug: string;
  };
  media?: IProductMedia[];
  variants?: IProductVariant[];
  productAttributes?: IProductAttribute[];
  sections?: IProductSection[];
}

export interface IProductMedia {
  id: string;
  productId: string;
  mediaType: string;
  mediaUrl: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface IProductSection {
  id: string;
  productId: string;
  title: string;
  type: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  items?: IProductSectionItem[];
}

export interface IProductSectionItem {
  id: string;
  sectionId: string;
  label?: string;
  value: string;
  order: number;
}

export interface IProductAttribute {
  productId: string;
  attributeId: string;
  attribute?: IAttribute;
}

export interface IProductVariant {
  id: string;
  productId: string;
  sku: string;
  price: number;
  comparePrice?: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  product?: IProduct;
  variantAttributes?: IVariantAttribute[];
  inventories?: IInventory[];
}

export interface IVariantAttribute {
  variantId: string;
  attributeValueId: string;
  attributeValue?: IAttributeValue & {
    attribute?: IAttribute;
  };
}

export interface IInventory {
  id: string;
  variantId: string;
  branchId: string;
  quantity: number;
  reservedQty: number;
  lowStockAlert: number;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: string;
    name: string;
  };
}

export interface ICreateProductInput {
  name: string;
  description?: string;
  basePrice: number;
  comparePrice?: number;
  categoryId: string;
  brandId: string;
  storeId: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  freeShipping?: boolean;
  attributeIds?: string[];
}

export interface IUpdateProductInput {
  name?: string;
  description?: string;
  basePrice?: number;
  comparePrice?: number;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  freeShipping?: boolean;
}

export interface ICreateProductVariantInput {
  productId: string;
  sku: string;
  price: number;
  comparePrice?: number;
  imageUrl?: string;
  attributeValueIds: string[];
}

export interface ICreateInventoryInput {
  variantId: string;
  branchId: string;
  quantity: number;
  reservedQty?: number;
  lowStockAlert?: number;
}
