import { useState, useEffect } from "react";
import { GuestCartManager, type GuestCartItem } from "@/utils/guestCart";

export const useGuestCart = () => {
  // Use lazy initializer - runs only once on mount, client-side only
  const [items, setItems] = useState<GuestCartItem[]>(() => {
    // This function only runs once during initial render
    // On server, returns empty array
    // On client, loads from localStorage
    return GuestCartManager.getItems();
  });

  const [itemCount, setItemCount] = useState(() => {
    return GuestCartManager.getItemCount();
  });

  const [subtotal, setSubtotal] = useState(() => {
    return GuestCartManager.getSubtotal();
  });

  const refreshCart = () => {
    const cartItems = GuestCartManager.getItems();
    setItems(cartItems);
    setItemCount(GuestCartManager.getItemCount());
    setSubtotal(GuestCartManager.getSubtotal());
  };

  useEffect(() => {
    // Set up polling for changes (no initial call needed - lazy initializer handles it)
    const interval = setInterval(refreshCart, 500);

    return () => clearInterval(interval);
  }, []);

  return {
    items,
    itemCount,
    subtotal,
    refreshCart,
  };
};
