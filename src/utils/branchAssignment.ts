/**
 * Frontend Branch Assignment Helper
 *
 * Groups cart items by store and branch to minimize number of orders
 */

import type { ICartItem } from "@/types/cart";
import type { GuestCartItem } from "./guestCart";

export interface BranchGroup {
  branchId: string;
  branchName: string;
  items: (ICartItem | GuestCartItem)[];
}

export interface StoreWithBranches {
  storeId: string;
  storeName: string;
  branches: BranchGroup[];
}

interface StoreGroup {
  storeId: string;
  items: (ICartItem | GuestCartItem)[];
}

/**
 * Group cart items by store and then by branch
 * For now, we'll use a simple heuristic:
 * - Group items by their product's store
 * - Within each store, items need to be assigned to branches based on inventory
 *
 * Note: This is a client-side helper. The actual branch assignment
 * will be determined by checking inventory on the backend.
 * For the checkout UI, we'll show items grouped by store and warn about potential splits.
 */
export function groupCartByStoreForCheckout(
  items: (ICartItem | GuestCartItem)[],
  isAuthenticated: boolean,
): {
  storeId: string;
  storeName: string;
  items: (ICartItem | GuestCartItem)[];
}[] {
  const groups: Record<
    string,
    { storeId: string; storeName: string; items: (ICartItem | GuestCartItem)[] }
  > = {};

  items.forEach((item) => {
    let storeId: string;
    let storeName: string;

    if (isAuthenticated) {
      const dbItem = item as ICartItem;
      storeId = dbItem.product.storeId;
      storeName = `Store ${storeId.substring(0, 8)}`; // Remove store.name access since it's not in the type
    } else {
      const guestItem = item as GuestCartItem;
      storeId = guestItem.storeId || "unknown";
      storeName = guestItem.storeName || `Store ${storeId.substring(0, 8)}`;
    }

    if (!groups[storeId]) {
      groups[storeId] = {
        storeId,
        storeName,
        items: [],
      };
    }

    groups[storeId].items.push(item);
  });

  return Object.values(groups);
}

/**
 * Estimate the potential number of orders that might be created
 * This is just an estimate - actual splitting happens on backend based on inventory
 */
export function estimateOrderCount(storeGroups: StoreGroup[]): {
  minOrders: number;
  maxOrders: number;
  message: string;
} {
  const storeCount = storeGroups.length;

  // Minimum: 1 order per store (if all items from same branch)
  const minOrders = storeCount;

  // Maximum: Could be more if items need to be split by branch
  // For conservative estimate, assume potential split if store has multiple items
  const maxOrders = storeGroups.reduce((total, group) => {
    // If store has multiple items, there's a chance they might be from different branches
    return total + Math.max(1, Math.min(group.items.length, 3)); // Cap at 3 branches per store as reasonable max
  }, 0);

  let message = "";

  if (storeCount === 1) {
    if (storeGroups[0].items.length === 1) {
      message = "You will receive 1 order.";
    } else {
      message =
        "Your items will be fulfilled from available branch(es). Multiple orders may be created if items are in different branches.";
    }
  } else {
    message = `You have items from ${storeCount} different stores. Your order will be split into at least ${minOrders} separate orders. Additional orders may be created if items from the same store are fulfilled by different branches.`;
  }

  return {
    minOrders,
    maxOrders,
    message,
  };
}
