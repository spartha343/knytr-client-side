import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { ICreateProductInput, IUpdateProductInput } from "@/types/product";

const PRODUCT_URL = "/products";

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllProducts: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: PRODUCT_URL,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => ({
        products: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.product],
    }),

    getProductById: build.query({
      query: (id: string) => ({
        url: `${PRODUCT_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.product],
    }),

    createProduct: build.mutation({
      query: (data: ICreateProductInput) => ({
        url: PRODUCT_URL,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.product],
    }),

    updateProduct: build.mutation({
      query: ({ id, data }: { id: string; data: IUpdateProductInput }) => ({
        url: `${PRODUCT_URL}/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.product],
    }),

    deleteProduct: build.mutation({
      query: (id: string) => ({
        url: `${PRODUCT_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
