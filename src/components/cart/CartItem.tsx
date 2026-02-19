"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, Button, InputNumber, message, Badge, Grid, Tag } from "antd";
import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} from "@/redux/api/cartApi";
import { GuestCartManager } from "@/utils/guestCart";
import type { ICartItem } from "@/types/cart";
import type { GuestCartItem } from "@/utils/guestCart";

const { useBreakpoint } = Grid;

interface CartItemProps {
  item: ICartItem | GuestCartItem;
  isAuthenticated: boolean;
  onUpdate?: () => void;
}

// Stock info component - defined OUTSIDE CartItem to avoid recreation on render
const StockInfo = ({ availableStock }: { availableStock: number }) => {
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 5;

  if (isOutOfStock) {
    return (
      <Tag color="error" icon={<WarningOutlined />} style={{ margin: 0 }}>
        Out of Stock
      </Tag>
    );
  }

  if (isLowStock) {
    return (
      <Tag color="warning" style={{ margin: 0 }}>
        Only {availableStock} left
      </Tag>
    );
  }

  return (
    <Tag color="success" style={{ margin: 0 }}>
      {availableStock} available
    </Tag>
  );
};

const CartItem = ({ item, isAuthenticated, onUpdate }: CartItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const screens = useBreakpoint();
  const isMobile = !screens.md; // md breakpoint is 768px

  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();

  const isDbItem = (item: ICartItem | GuestCartItem): item is ICartItem => {
    return "id" in item && "product" in item;
  };

  // Calculate available stock from inventories
  const availableStock = useMemo(() => {
    if (!isDbItem(item) || !item.variant?.inventories) {
      return 999; // Default high number for guest cart or products without variants
    }

    const total = item.variant.inventories.reduce(
      (sum, inv) => sum + (inv.quantity - inv.reservedQty),
      0,
    );

    return total;
  }, [item]);

  const isOutOfStock = availableStock <= 0;

  const productName = isDbItem(item) ? item.product.name : item.productName;
  const imageUrl = isDbItem(item)
    ? item.product.media[0]?.mediaUrl
    : item.imageUrl;

  let basePrice = item.priceSnapshot;
  let currentPrice = item.priceSnapshot;

  if (isDbItem(item)) {
    if (item.variant && item.variant.price !== null) {
      currentPrice = Number(item.variant.price);
    } else {
      currentPrice = Number(item.product.basePrice);
    }

    if (
      item.product.comparePrice &&
      Number(item.product.comparePrice) > currentPrice
    ) {
      basePrice = Number(item.product.comparePrice);
    } else {
      basePrice = currentPrice;
    }
  } else {
    if (item.comparePrice && item.comparePrice > item.priceSnapshot) {
      basePrice = item.comparePrice;
      currentPrice = item.priceSnapshot;
    }
  }

  const hasDiscount = basePrice > currentPrice;
  const discountAmount = hasDiscount
    ? (basePrice - currentPrice) * quantity
    : 0;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - currentPrice) / basePrice) * 100)
    : 0;
  const subtotal = currentPrice * quantity;

  const handleQtyChange = async (newQty: number) => {
    if (!newQty || newQty < 1) return;

    // Check stock limit
    if (newQty > availableStock) {
      message.warning(`Only ${availableStock} units available in stock`);
      return;
    }

    setQuantity(newQty);

    if (isAuthenticated && isDbItem(item)) {
      try {
        await updateCartItem({ itemId: item.id, quantity: newQty }).unwrap();
        message.success("Quantity updated");
      } catch (error) {
        const errorMsg =
          (error as { data?: { message?: string } })?.data?.message ||
          "Failed to update quantity";
        message.error(errorMsg);
        setQuantity(item.quantity);
      }
    } else {
      GuestCartManager.updateQuantity(
        item.productId,
        item.variantId || undefined,
        newQty,
      );
      onUpdate?.();
    }
  };

  const handleRemove = async () => {
    if (isAuthenticated && isDbItem(item)) {
      try {
        await removeCartItem(item.id).unwrap();
        message.success("Item removed from cart");
      } catch (error) {
        const errorMsg =
          (error as { data?: { message?: string } })?.data?.message ||
          "Failed to remove item";
        message.error(errorMsg);
      }
    } else {
      GuestCartManager.remove(item.productId, item.variantId || undefined);
      onUpdate?.();
      message.success("Item removed from cart");
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <Card
        style={{ marginBottom: "10px" }}
        styles={{ body: { padding: "12px" } }}
      >
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
          {/* Image */}
          <div style={{ flexShrink: 0 }}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={productName}
                width={60}
                height={60}
                style={{ borderRadius: "6px", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "#f0f0f0",
                  borderRadius: "6px",
                }}
              />
            )}
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: "14px",
                margin: "0 0 6px 0",
                fontWeight: 600,
                lineHeight: "1.4",
              }}
            >
              {productName}
            </h3>

            <div style={{ marginBottom: "4px" }}>
              <span
                style={{
                  fontSize: "16px",
                  color: "#1890ff",
                  fontWeight: "bold",
                }}
              >
                ৳{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      textDecoration: "line-through",
                      marginLeft: "8px",
                    }}
                  >
                    ৳{basePrice.toLocaleString()}
                  </span>
                  <Badge
                    count={`-${discountPercent}%`}
                    style={{
                      backgroundColor: "#ff4d4f",
                      marginLeft: "6px",
                      fontSize: "9px",
                      height: "16px",
                      lineHeight: "16px",
                      padding: "0 5px",
                    }}
                  />
                </>
              )}
            </div>

            {/* Stock Info */}
            <div style={{ marginTop: "6px" }}>
              <StockInfo availableStock={availableStock} />
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "8px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          {/* Quantity */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Button
              size="small"
              icon={<MinusOutlined style={{ fontSize: "10px" }} />}
              onClick={() => quantity > 1 && handleQtyChange(quantity - 1)}
              disabled={quantity <= 1 || isOutOfStock}
              style={{ width: "28px", height: "28px", padding: 0 }}
            />
            <InputNumber
              min={1}
              max={availableStock}
              value={quantity}
              onChange={(val) => val && handleQtyChange(val)}
              style={{ width: "50px" }}
              size="small"
              controls={false}
              disabled={isOutOfStock}
            />
            <Button
              size="small"
              icon={<PlusOutlined style={{ fontSize: "10px" }} />}
              onClick={() => handleQtyChange(quantity + 1)}
              disabled={quantity >= availableStock || isOutOfStock}
              style={{ width: "28px", height: "28px", padding: 0 }}
            />
          </div>

          {/* Subtotal */}
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>
            ৳{subtotal.toLocaleString()}
          </div>

          {/* Remove */}
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          >
            Remove
          </Button>
        </div>
      </Card>
    );
  }

  // Desktop Layout
  return (
    <Card
      style={{ marginBottom: "10px" }}
      styles={{ body: { padding: "12px" } }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        {/* Image */}
        <div style={{ flexShrink: 0 }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={productName}
              width={70}
              height={70}
              style={{ borderRadius: "6px", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "70px",
                height: "70px",
                background: "#f0f0f0",
                borderRadius: "6px",
              }}
            />
          )}
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: "15px",
              margin: "0 0 6px 0",
              fontWeight: 600,
              lineHeight: "1.4",
            }}
          >
            {productName}
          </h3>

          {/* Price */}
          <div style={{ marginBottom: "6px" }}>
            <span
              style={{ fontSize: "17px", color: "#1890ff", fontWeight: "bold" }}
            >
              ৳{currentPrice.toLocaleString()}
            </span>

            {hasDiscount && (
              <>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#999",
                    textDecoration: "line-through",
                    marginLeft: "8px",
                  }}
                >
                  ৳{basePrice.toLocaleString()}
                </span>
                <Badge
                  count={`-${discountPercent}%`}
                  style={{
                    backgroundColor: "#ff4d4f",
                    marginLeft: "8px",
                    fontSize: "10px",
                    height: "18px",
                    lineHeight: "18px",
                    padding: "0 6px",
                  }}
                />
              </>
            )}
          </div>

          {/* Stock Info */}
          <div style={{ marginBottom: "6px" }}>
            <StockInfo availableStock={availableStock} />
          </div>

          {/* Discount Savings */}
          {hasDiscount && (
            <div
              style={{ fontSize: "12px", color: "#52c41a", fontWeight: 500 }}
            >
              💰 You save: ৳{discountAmount.toLocaleString()} on this item
            </div>
          )}
        </div>

        {/* Right Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
            minWidth: "150px",
          }}
        >
          {/* Quantity Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Button
              size="small"
              icon={<MinusOutlined style={{ fontSize: "10px" }} />}
              onClick={() => quantity > 1 && handleQtyChange(quantity - 1)}
              disabled={quantity <= 1 || isOutOfStock}
              style={{ width: "26px", height: "26px", padding: 0 }}
            />
            <InputNumber
              min={1}
              max={availableStock}
              value={quantity}
              onChange={(val) => val && handleQtyChange(val)}
              style={{ width: "50px" }}
              size="small"
              controls={false}
              disabled={isOutOfStock}
            />
            <Button
              size="small"
              icon={<PlusOutlined style={{ fontSize: "10px" }} />}
              onClick={() => handleQtyChange(quantity + 1)}
              disabled={quantity >= availableStock || isOutOfStock}
              style={{ width: "26px", height: "26px", padding: 0 }}
            />
          </div>

          {/* Subtotal */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#999" }}>Subtotal</div>
            <div
              style={{ fontSize: "18px", fontWeight: "bold", color: "#000" }}
            >
              ৳{subtotal.toLocaleString()}
            </div>
          </div>

          {/* Remove Button */}
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleRemove}
          >
            Remove
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;
