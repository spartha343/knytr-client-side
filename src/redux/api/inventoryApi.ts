import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { ICreateInventoryInput } from "@/types/product";

const INVENTORY_URL = "/inventory";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInventoryByVariant: build.query({
      query: (variantId: string) => ({
        url: `${INVENTORY_URL}/variant/${variantId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.inventory],
    }),

    getInventoryByBranch: build.query({
      query: (branchId: string) => ({
        url: `${INVENTORY_URL}/branch/${branchId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.inventory],
    }),

    getLowStockItems: build.query({
      query: () => ({
        url: `${INVENTORY_URL}/low-stock`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.inventory],
    }),

    createInventory: build.mutation({
      query: (data: ICreateInventoryInput) => ({
        url: INVENTORY_URL,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.inventory],
    }),

    bulkCreateInventory: build.mutation({
      query: (data: {
        variantId: string;
        inventories: Array<{
          branchId: string;
          quantity: number;
          lowStockAlert?: number;
        }>;
      }) => ({
        url: `${INVENTORY_URL}/bulk`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.inventory],
    }),

    updateInventory: build.mutation({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<ICreateInventoryInput>;
      }) => ({
        url: `${INVENTORY_URL}/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.inventory],
    }),

    adjustStock: build.mutation({
      query: ({
        id,
        quantity,
        reason,
      }: {
        id: string;
        quantity: number;
        reason?: string;
      }) => ({
        url: `${INVENTORY_URL}/${id}/adjust`,
        method: "PATCH",
        data: { quantity, reason },
      }),
      invalidatesTags: [tagTypes.inventory],
    }),
  }),
});

export const {
  useGetInventoryByVariantQuery,
  useGetInventoryByBranchQuery,
  useGetLowStockItemsQuery,
  useCreateInventoryMutation,
  useBulkCreateInventoryMutation,
  useUpdateInventoryMutation,
  useAdjustStockMutation,
} = inventoryApi;
