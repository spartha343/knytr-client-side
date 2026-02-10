import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const PRODUCT_MEDIA_URL = "/product-media";

export const productMediaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProductMedia: build.query({
      query: (productId: string) => ({
        url: `${PRODUCT_MEDIA_URL}/product/${productId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.product],
    }),

    uploadProductMedia: build.mutation({
      query: (data: { productId: string; urls: string[] }) => ({
        url: PRODUCT_MEDIA_URL,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.product],
    }),

    setPrimaryMedia: build.mutation({
      query: (id: string) => ({
        url: `${PRODUCT_MEDIA_URL}/${id}/set-primary`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.product],
    }),

    deleteProductMedia: build.mutation({
      query: (id: string) => ({
        url: `${PRODUCT_MEDIA_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetProductMediaQuery,
  useUploadProductMediaMutation,
  useSetPrimaryMediaMutation,
  useDeleteProductMediaMutation,
} = productMediaApi;
