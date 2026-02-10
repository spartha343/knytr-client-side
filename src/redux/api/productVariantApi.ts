import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { ICreateProductVariantInput } from "@/types/product";

const VARIANT_URL = "/product-variants";

export const productVariantApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProductVariants: build.query({
      query: (productId: string) => ({
        url: `${VARIANT_URL}/product/${productId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.productVariant],
    }),

    getVariantById: build.query({
      query: (id: string) => ({
        url: `${VARIANT_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.productVariant],
    }),

    createProductVariant: build.mutation({
      query: (data: ICreateProductVariantInput) => ({
        url: VARIANT_URL,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.productVariant, tagTypes.product],
    }),

    bulkCreateProductVariants: build.mutation({
      query: (data: {
        productId: string;
        variants: ICreateProductVariantInput[];
      }) => ({
        url: `${VARIANT_URL}/bulk`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.productVariant, tagTypes.product],
    }),

    updateProductVariant: build.mutation({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<ICreateProductVariantInput>;
      }) => ({
        url: `${VARIANT_URL}/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.productVariant, tagTypes.product],
    }),

    deleteProductVariant: build.mutation({
      query: (id: string) => ({
        url: `${VARIANT_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.productVariant, tagTypes.product],
    }),
  }),
});

export const {
  useGetProductVariantsQuery,
  useGetVariantByIdQuery,
  useCreateProductVariantMutation,
  useBulkCreateProductVariantsMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} = productVariantApi;
