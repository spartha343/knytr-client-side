export interface IBrand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateBrandInput {
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface IUpdateBrandInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface IBrandResponse {
  success: boolean;
  message: string;
  data: IBrand;
}

export interface IBrandsResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: IBrand[];
}
