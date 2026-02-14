import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import type { ICart } from "@/types/cart";

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
    getCart: build.query<ICart, void>({
      query: () => ({
        url: CART_URL,
        method: "GET",
      }),
      transformResponse: (response: { data: ICart }) => response.data,
      providesTags: [tagTypes.cart],
    }),

    // Update cart item quantity
    updateCartItem: build.mutation({
      query: ({ itemId, quantity }: { itemId: string; quantity: number }) => ({
        url: `${CART_URL}/item/${itemId}`,
        method: "PATCH",
        data: { quantity },
      }),
      // Optimistic update - don't refetch, just update the cache
      async onQueryStarted({ itemId, quantity }, { dispatch, queryFulfilled }) {
        // Optimistically update the cache
        const patchResult = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            const item = draft?.items?.find((i) => i.id === itemId);
            if (item) {
              item.quantity = quantity;
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          patchResult.undo();
        }
      },
    }),

    // Remove cart item
    removeCartItem: build.mutation({
      query: (itemId: string) => ({
        url: `${CART_URL}/item/${itemId}`,
        method: "DELETE",
      }),
      // Optimistic update - remove from cache immediately
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            if (draft?.items) {
              draft.items = draft.items.filter((i) => i.id !== itemId);
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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
