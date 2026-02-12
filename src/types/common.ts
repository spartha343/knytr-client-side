export interface IMeta {
  limit: number;
  page: number;
  total: number;
}

// Query parameters for public APIs
export interface IQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
}

// Product-specific query params
export interface IProductQueryParams extends IQueryParams {
  categoryId?: string;
  brandId?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

// Category-specific query params
export interface ICategoryQueryParams extends IQueryParams {
  parentId?: string;
  isActive?: boolean;
}

// Store-specific query params
export interface IStoreQueryParams extends IQueryParams {
  isActive?: boolean;
}

// API Response wrapper
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: IMeta;
}
