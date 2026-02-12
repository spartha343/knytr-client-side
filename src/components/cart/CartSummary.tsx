"use client";

import { useRouter } from "next/navigation";
import { Card, Button } from "antd";
import { ShoppingOutlined, TagOutlined } from "@ant-design/icons";
import type { ICartItem } from "@/types/cart";
import type { GuestCartItem } from "@/utils/guestCart";

interface CartSummaryProps {
  items: (ICartItem | GuestCartItem)[];
}

const CartSummary = ({ items }: CartSummaryProps) => {
  const router = useRouter();

  const isDbItem = (item: ICartItem | GuestCartItem): item is ICartItem => {
    return "id" in item && "product" in item;
  };

  // Calculate totals
  let subtotal = 0;
  let originalTotal = 0;

  items.forEach((item) => {
    let currentPrice = item.priceSnapshot;
    let basePrice = item.priceSnapshot;

    if (isDbItem(item)) {
      // Get current price
      if (item.variant && item.variant.price !== null) {
        currentPrice = Number(item.variant.price);
      } else {
        currentPrice = Number(item.product.basePrice);
      }

      // Get original price (for discount calculation)
      if (
        item.product.comparePrice &&
        Number(item.product.comparePrice) > currentPrice
      ) {
        basePrice = Number(item.product.comparePrice);
      } else {
        basePrice = currentPrice;
      }
    } else {
      // For guest cart items
      if (item.comparePrice && item.comparePrice > item.priceSnapshot) {
        basePrice = item.comparePrice;
        currentPrice = item.priceSnapshot;
      }
    }

    subtotal += currentPrice * item.quantity;
    originalTotal += basePrice * item.quantity;
  });

  const totalDiscount = originalTotal - subtotal;
  const hasDiscount = totalDiscount > 0;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card styles={{ body: { padding: "16px" } }}>
      <h2 style={{ fontSize: "18px", marginBottom: "16px", fontWeight: 600 }}>
        Order Summary
      </h2>

      <div style={{ marginBottom: "12px" }}>
        {/* Items Subtotal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "#666" }}>
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span style={{ fontWeight: 500 }}>
            ৳{(hasDiscount ? originalTotal : subtotal).toLocaleString()}
          </span>
        </div>

        {/* Discount */}
        {hasDiscount && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              color: "#52c41a",
            }}
          >
            <span>
              <TagOutlined /> Total Discount
            </span>
            <span style={{ fontWeight: 600 }}>
              -৳{totalDiscount.toLocaleString()}
            </span>
          </div>
        )}

        {/* Delivery */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "#666" }}>Delivery Charge</span>
          <span style={{ fontSize: "12px", color: "#1890ff", fontWeight: 500 }}>
            At checkout
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop: "2px solid #f0f0f0",
          paddingTop: "12px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: 600 }}>Total</span>
          <span
            style={{ fontSize: "22px", fontWeight: "bold", color: "#1890ff" }}
          >
            ৳{subtotal.toLocaleString()}
          </span>
        </div>

        {hasDiscount && (
          <div
            style={{
              textAlign: "right",
              fontSize: "13px",
              color: "#52c41a",
              marginTop: "6px",
              fontWeight: 600,
            }}
          >
            🎉 You saved ৳{totalDiscount.toLocaleString()} total!
          </div>
        )}
      </div>

      <Button
        type="primary"
        size="large"
        block
        icon={<ShoppingOutlined />}
        onClick={() => router.push("/checkout")}
        style={{ height: "48px", fontSize: "16px", fontWeight: 600 }}
      >
        Proceed to Checkout
      </Button>

      {/* Trust Badge */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          background: "#f6ffed",
          borderRadius: "6px",
          border: "1px solid #b7eb8f",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#52c41a",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          ✓ Secure Checkout | ✓ Cash on Delivery | ✓ 7 Days Return
        </div>
      </div>
    </Card>
  );
};

export default CartSummary;
