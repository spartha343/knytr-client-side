import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { ICreateStoreInput, IUpdateStoreInput } from "@/types/store";

const STORE_URL = "/stores";

export const storeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Create store
    createStore: build.mutation({
      query: (data: ICreateStoreInput) => ({
        url: STORE_URL,
        method: "POST",
        data: data,
      }),
      invalidatesTags: [tagTypes.store],
    }),

    // Get all stores (Admin)
    getAllStores: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: STORE_URL,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => {
        return {
          stores: response.data,
          meta: response.meta,
        };
      },
      providesTags: [tagTypes.store],
    }),

    // Get my stores (Vendor)
    getMyStores: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: `${STORE_URL}/my-stores`,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => {
        return {
          stores: response.data,
          meta: response.meta,
        };
      },
      providesTags: [tagTypes.store],
    }),

    // Get store by ID
    getStoreById: build.query({
      query: (id: string) => ({
        url: `${STORE_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.store],
    }),

    // Update store
    updateStore: build.mutation({
      query: ({ id, data }: { id: string; data: IUpdateStoreInput }) => ({
        url: `${STORE_URL}/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: [tagTypes.store],
    }),

    // Delete store
    deleteStore: build.mutation({
      query: (id: string) => ({
        url: `${STORE_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.store],
    }),
  }),
});

export const {
  useCreateStoreMutation,
  useGetAllStoresQuery,
  useGetMyStoresQuery,
  useGetStoreByIdQuery,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} = storeApi;
