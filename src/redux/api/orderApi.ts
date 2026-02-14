import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { publicApi } from "./publicApi";
import type {
  ICreateOrderInput,
  IUpdateOrderInput,
  IUpdateOrderStatusInput,
  IAssignBranchInput,
} from "@/types/order";

const ORDER_URL = "/orders";

// PUBLIC API for guest checkout
export const publicOrderApi = publicApi.injectEndpoints({
  endpoints: (build) => ({
    // Create order as guest (no auth)
    createGuestOrder: build.mutation({
      query: (data: ICreateOrderInput) => ({
        url: `${ORDER_URL}/public/create`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.order],
    }),
  }),
});

// AUTHENTICATED API for logged-in users
export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Create order (authenticated)
    createOrder: build.mutation({
      query: (data: ICreateOrderInput) => ({
        url: ORDER_URL,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.order, tagTypes.cart],
    }),

    // Get all orders (admin only)
    getAllOrders: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: `${ORDER_URL}/admin/all`,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => ({
        orders: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.order],
    }),

    // Get vendor orders
    getVendorOrders: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: `${ORDER_URL}/vendor/my-orders`,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => ({
        orders: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.order],
    }),

    // Get customer orders
    getCustomerOrders: build.query({
      query: (arg: Record<string, string | number | boolean>) => ({
        url: `${ORDER_URL}/customer/my-orders`,
        method: "GET",
        params: arg,
      }),
      transformResponse: (response: {
        data: unknown;
        meta: { page: number; limit: number; total: number };
      }) => ({
        orders: response.data,
        meta: response.meta,
      }),
      providesTags: [tagTypes.order],
    }),

    // Get order by ID
    getOrderById: build.query({
      query: (id: string) => ({
        url: `${ORDER_URL}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.order],
    }),

    // Update order (vendor only)
    updateOrder: build.mutation({
      query: ({ id, data }: { id: string; data: IUpdateOrderInput }) => ({
        url: `${ORDER_URL}/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.order],
    }),

    // Update order status (vendor only)
    updateOrderStatus: build.mutation({
      query: ({ id, data }: { id: string; data: IUpdateOrderStatusInput }) => ({
        url: `${ORDER_URL}/${id}/status`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.order],
    }),

    // Assign branch to order item (vendor only)
    assignBranchToItem: build.mutation({
      query: ({
        orderId,
        itemId,
        data,
      }: {
        orderId: string;
        itemId: string;
        data: IAssignBranchInput;
      }) => ({
        url: `${ORDER_URL}/${orderId}/items/${itemId}/assign-branch`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.order],
    }),
  }),
});

export const { useCreateGuestOrderMutation } = publicOrderApi;

export const {
  useCreateOrderMutation,
  useGetAllOrdersQuery,
  useGetVendorOrdersQuery,
  useGetCustomerOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useAssignBranchToItemMutation,
} = orderApi;
