"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin, Button, message, Grid } from "antd";
import { ArrowLeftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useGetCartQuery, useSyncCartMutation } from "@/redux/api/cartApi";
import { GuestCartManager } from "@/utils/guestCart";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/hooks/useGuestCart";
import Container from "@/components/shared/Container";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import type { ICart, ICartItem } from "@/types/cart";
import type { GuestCartItem } from "@/utils/guestCart";

const { useBreakpoint } = Grid;

const CartPage = () => {
  const router = useRouter();
  const screens = useBreakpoint();
  const isDesktop = screens.lg; // lg breakpoint is 1024px

  const { items: guestCartItems, refreshCart } = useGuestCart();
  const {
    isLoading: authLoading,
    isAuthenticated,
    dbUser,
    syncing,
  } = useAuth();

  const { data: dbCartResponse, isLoading: dbCartLoading } = useGetCartQuery(
    undefined,
    { skip: !isAuthenticated || !dbUser || syncing },
  );

  const dbCart = dbCartResponse as ICart | undefined;
  const [syncCart, { isLoading: isSyncing }] = useSyncCartMutation();

  useEffect(() => {
    if (isAuthenticated && dbUser && !syncing && !authLoading) {
      const guestCart = GuestCartManager.get();

      if (guestCart && guestCart.items.length > 0) {
        const syncCartWithRetry = async (retryCount = 0, maxRetries = 3) => {
          try {
            await syncCart({
              items: guestCart.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot,
              })),
            }).unwrap();

            GuestCartManager.clear();
            refreshCart();
            message.success("Cart synced!");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            const isUserNotFoundError =
              error?.data?.message?.includes("User not found");

            if (isUserNotFoundError && retryCount < maxRetries) {
              const delay = Math.pow(2, retryCount) * 500;
              setTimeout(() => {
                syncCartWithRetry(retryCount + 1, maxRetries);
              }, delay);
            } else {
              console.error("Cart sync error:", error);
              if (retryCount >= maxRetries) {
                message.error("Cart sync failed. Please refresh the page.");
              } else {
                message.error("Failed to sync cart. Please try again.");
              }
            }
          }
        };

        syncCartWithRetry();
      }
    }
  }, [isAuthenticated, dbUser, syncing, authLoading, syncCart, refreshCart]);

  const cartItems: (ICartItem | GuestCartItem)[] = isAuthenticated
    ? dbCart?.items || []
    : guestCartItems;

  const isLoading =
    authLoading || (isAuthenticated && dbCartLoading) || isSyncing;

  const getItemKey = (item: ICartItem | GuestCartItem): string => {
    if ("id" in item) return item.id;
    return `${item.productId}-${item.variantId || "no-variant"}`;
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container>
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "400px",
              padding: "0 20px",
            }}
          >
            <ShoppingCartOutlined
              style={{ fontSize: "80px", color: "#ccc", marginBottom: "20px" }}
            />
            <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
              Your cart is empty
            </h2>
            <p style={{ color: "#666", marginBottom: "30px" }}>
              Start adding products!
            </p>
            <Button
              type="primary"
              size="large"
              onClick={() => router.push("/products")}
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: isDesktop ? "20px 0" : "16px 0",
      }}
    >
      <Container>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/products")}
          style={{ marginBottom: "20px" }}
        >
          Continue Shopping
        </Button>

        <h1
          style={{
            fontSize: isDesktop ? "28px" : "22px",
            marginBottom: "10px",
          }}
        >
          <ShoppingCartOutlined /> Shopping Cart
        </h1>
        <p
          style={{
            color: "#666",
            marginBottom: isDesktop ? "30px" : "20px",
            fontSize: isDesktop ? "15px" : "14px",
          }}
        >
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your
          cart
        </p>

        {/* Desktop Layout */}
        {isDesktop ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 400px",
              gap: "20px",
            }}
          >
            {/* Cart Items */}
            <div>
              {cartItems.map((item) => (
                <CartItem
                  key={getItemKey(item)}
                  item={item}
                  isAuthenticated={isAuthenticated}
                  onUpdate={refreshCart}
                />
              ))}
            </div>

            {/* Summary - Sticky on desktop */}
            <div
              style={{ position: "sticky", top: "20px", height: "fit-content" }}
            >
              <CartSummary items={cartItems} />
            </div>
          </div>
        ) : (
          /* Mobile Layout */
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Cart Items First */}
            <div>
              {cartItems.map((item) => (
                <CartItem
                  key={getItemKey(item)}
                  item={item}
                  isAuthenticated={isAuthenticated}
                  onUpdate={refreshCart}
                />
              ))}
            </div>

            {/* Summary Below on mobile */}
            <div>
              <CartSummary items={cartItems} />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default CartPage;
