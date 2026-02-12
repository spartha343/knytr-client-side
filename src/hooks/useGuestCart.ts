import { useState, useEffect } from "react";
import { GuestCartManager, type GuestCartItem } from "@/utils/guestCart";

export const useGuestCart = () => {
  const [items, setItems] = useState<GuestCartItem[]>(() =>
    GuestCartManager.getItems(),
  );
  const [itemCount, setItemCount] = useState(() =>
    GuestCartManager.getItemCount(),
  );
  const [subtotal, setSubtotal] = useState(() =>
    GuestCartManager.getSubtotal(),
  );

  const refreshCart = () => {
    const cartItems = GuestCartManager.getItems();
    setItems(cartItems);
    setItemCount(GuestCartManager.getItemCount());
    setSubtotal(GuestCartManager.getSubtotal());
  };

  useEffect(() => {
    // Set up polling for changes (no initial call needed, useState handles it)
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
