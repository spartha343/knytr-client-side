import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const CART_URL = "/cart";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Add to cart
    addToCart: build.mutation({
      query: (data) => ({
        url: `${CART_URL}/add`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.cart],
    }),

    // Get user's cart
    getCart: build.query({
      query: () => ({
        url: CART_URL,
        method: "GET",
      }),
      transformResponse: (response: { data: unknown }) => response.data,
      providesTags: [tagTypes.cart],
    }),

    // Update cart item quantity
    updateCartItem: build.mutation({
      query: ({ itemId, quantity }: { itemId: string; quantity: number }) => ({
        url: `${CART_URL}/item/${itemId}`,
        method: "PATCH",
        data: { quantity },
      }),
      invalidatesTags: [tagTypes.cart],
    }),

    // Remove cart item
    removeCartItem: build.mutation({
      query: (itemId: string) => ({
        url: `${CART_URL}/item/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.cart],
    }),

    // Clear cart
    clearCart: build.mutation({
      query: () => ({
        url: `${CART_URL}/clear`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.cart],
    }),

    // Sync guest cart after login
    syncCart: build.mutation({
      query: (data) => ({
        url: `${CART_URL}/sync`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.cart],
    }),
  }),
});

export const {
  useAddToCartMutation,
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useSyncCartMutation,
} = cartApi;
