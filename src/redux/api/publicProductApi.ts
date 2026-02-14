import { publicApi } from "./publicApi";
import { tagTypes } from "../tag-types";
import { IProduct } from "@/types/product";
import { IMeta, IProductQueryParams, IApiResponse } from "@/types/common";

export const publicProductApi = publicApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicProducts: build.query<
      { products: IProduct[]; meta: IMeta },
      IProductQueryParams | void
    >({
      query: (arg = {}) => ({
        url: "/products",
        method: "GET",
        params: { ...arg, isPublished: true, isActive: true },
      }),
      transformResponse: (response: IApiResponse<IProduct[]>) => ({
        products: response.data,
        meta: response.meta!,
      }),
      providesTags: [tagTypes.product],
    }),

    getPublicProductById: build.query<IProduct, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      transformResponse: (response: IApiResponse<IProduct>) => response.data,
      providesTags: [tagTypes.product],
    }),

    getPublicProductByStoreAndSlug: build.query<
      IProduct,
      { storeSlug: string; productSlug: string }
    >({
      query: ({ storeSlug, productSlug }) => ({
        url: `/products/store/${storeSlug}/product/${productSlug}`,
        method: "GET",
      }),
      transformResponse: (response: IApiResponse<IProduct>) => response.data,
      providesTags: [tagTypes.product],
    }),

    getSimilarProducts: build.query<IProduct[], string>({
      query: (id) => ({
        url: `/products/${id}/similar`,
        method: "GET",
      }),
      transformResponse: (response: IApiResponse<IProduct[]>) => response.data,
      providesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetPublicProductsQuery,
  useGetPublicProductByIdQuery,
  useGetPublicProductByStoreAndSlugQuery,
  useGetSimilarProductsQuery,
} = publicProductApi;
