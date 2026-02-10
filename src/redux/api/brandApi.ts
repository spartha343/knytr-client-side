import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { ICreateBrandInput, IUpdateBrandInput } from "@/types/brand";

const BRAND_URL = "/brands";

export const brandApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Create brand (Admin only)
    createBrand: build.mutation({
      query: (data: ICreateBrandInput) => ({
        url: BRAND_URL,
        method: "POST",
        data: data,
      }),
      invalidatesTags: [tagTypes.brand],
    }),

    // Get all brands (Public)
    getAllBrands: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: BRAND_URL,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => {
        return {
          brands: response.data,
          meta: response.meta,
        };
      },
      providesTags: [tagTypes.brand],
    }),

    // Get brand by ID
    getBrandById: build.query({
      query: (id: string) => ({
        url: `${BRAND_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.brand],
    }),

    // Update brand (Admin only)
    updateBrand: build.mutation({
      query: ({ id, data }: { id: string; data: IUpdateBrandInput }) => ({
        url: `${BRAND_URL}/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: [tagTypes.brand],
    }),

    // Delete brand (Admin only)
    deleteBrand: build.mutation({
      query: (id: string) => ({
        url: `${BRAND_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.brand],
    }),
  }),
});

export const {
  useCreateBrandMutation,
  useGetAllBrandsQuery,
  useGetBrandByIdQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;
