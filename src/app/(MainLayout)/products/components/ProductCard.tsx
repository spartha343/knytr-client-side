"use client";

import { Card, Button, Typography, message, Row, Col } from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types/product";
import { useAddToCartMutation } from "@/redux/api/cartApi";
import { GuestCartManager } from "@/utils/guestCart";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { useMemo } from "react";
import type { ICart } from "@/types/cart";

const { Text } = Typography;

interface ProductCardProps {
  product: IProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [addToCart, { isLoading }] = useAddToCartMutation();

  // Get guest cart items
  const { items: guestCartItems } = useGuestCart();

  // Get DB cart for authenticated users
  const { data: dbCartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dbCart = dbCartResponse as ICart | undefined;

  // Check if product is already in cart
  const isInCart = useMemo(() => {
    if (isAuthenticated) {
      // Check DB cart
      return (
        dbCart?.items?.some((item) => item.productId === product.id) || false
      );
    } else {
      // Check guest cart
      return guestCartItems.some((item) => item.productId === product.id);
    }
  }, [isAuthenticated, dbCart, guestCartItems, product.id]);

  // Get product image
  const getProductImage = () => {
    if (!product.media || product.media.length === 0) return null;
    const primaryImage = product.media.find((m) => m.isPrimary);
    return primaryImage?.mediaUrl || product.media[0]?.mediaUrl;
  };

  // Calculate discount
  const calculateDiscount = () => {
    if (!product.comparePrice || product.comparePrice <= product.basePrice) {
      return 0;
    }
    return Math.round(
      ((product.comparePrice - product.basePrice) / product.comparePrice) * 100,
    );
  };

  const imageUrl = getProductImage();
  const discount = calculateDiscount();

  // Handle Add to Cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If already in cart, navigate to cart page
    if (isInCart) {
      router.push("/cart");
      return;
    }

    // Pick first in-stock variant, fallback to first variant if all out of stock
    const getFirstInStockVariant = () => {
      if (!product.variants || product.variants.length === 0) return null;
      const inStockVariant = product.variants.find(
        (v) =>
          v.isActive &&
          v.inventories &&
          v.inventories.some((inv) => inv.quantity - inv.reservedQty > 0),
      );
      return inStockVariant || product.variants[0];
    };

    try {
      if (isAuthenticated) {
        const bestVariant = getFirstInStockVariant();

        await addToCart({
          productId: product.id,
          variantId: bestVariant?.id,
          quantity: 1,
        }).unwrap();
        message.success("Added to cart!");
      } else {
        const bestVariant = getFirstInStockVariant();

        GuestCartManager.add({
          productId: product.id,
          variantId: bestVariant?.id,
          quantity: 1,
          priceSnapshot: bestVariant?.price
            ? Number(bestVariant.price)
            : Number(product.basePrice),
          productName: product.name,
          productSlug: product.slug,
          storeId: product.store?.id || product.storeId,
          storeName: product.store?.name || "Unknown Store",
          storeSlug: product.store?.slug || "unknown",
          imageUrl: bestVariant?.imageUrl || imageUrl || undefined,
          comparePrice:
            bestVariant?.comparePrice != null
              ? Number(bestVariant.comparePrice)
              : product.comparePrice != null
                ? Number(product.comparePrice)
                : undefined,
          variantName: bestVariant?.variantAttributes
            ?.map((va) => va.attributeValue?.value)
            .filter(Boolean)
            .join(", "),
        });
        message.success("Added to cart!");
      }
    } catch (error) {
      const errorMsg =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to add to cart";
      message.error(errorMsg);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    message.info("Wishlist feature coming soon!");
  };

  return (
    <Card
      hoverable
      styles={{
        body: { padding: "8px" },
      }}
      cover={
        <Link href={`/products/${product.store?.slug}/${product.slug}`}>
          <div
            style={{
              height: "clamp(120px, 30vw, 180px)",
              position: "relative",
              overflow: "hidden",
              borderRadius: "8px 8px 4px 4px",
              isolation: "isolate",
            }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                style={{ objectFit: "cover", borderRadius: "8px 8px 4px 4px" }}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  borderRadius: "8px 8px 4px 4px",
                }}
              >
                No Image
              </div>
            )}
          </div>
        </Link>
      }
    >
      <Link href={`/products/${product.store?.slug}/${product.slug}`}>
        <Card.Meta
          title={
            <div
              style={{
                height: "20px",
                overflow: "hidden",
                fontSize: "clamp(13px, 3vw, 17px)",
                lineHeight: "20px",
                marginBottom: "4px",
              }}
            >
              {product.name}
            </div>
          }
          description={
            <div style={{ height: "44px", marginBottom: "8px" }}>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "clamp(13px, 3.5vw, 18px)",
                    color: "#1890ff",
                  }}
                >
                  ৳{product.basePrice.toLocaleString()}
                </Text>
                {product.comparePrice &&
                product.comparePrice > product.basePrice ? (
                  <Text
                    delete
                    style={{
                      color: "#999",
                      fontSize: "clamp(11px, 2.5vw, 14px)",
                      marginLeft: "4px",
                    }}
                  >
                    ৳{product.comparePrice.toLocaleString()}
                  </Text>
                ) : null}
              </div>
              <div style={{ height: "18px" }}>
                {product.comparePrice &&
                product.comparePrice > product.basePrice ? (
                  <Text
                    style={{
                      color: "#52c41a",
                      fontSize: "clamp(10px, 2.5vw, 12px)",
                    }}
                  >
                    Save {discount}%
                  </Text>
                ) : null}
              </div>
            </div>
          }
        />
      </Link>

      {/* Buttons in Grid Layout */}
      <Row gutter={[6, 6]}>
        <Col span={16}>
          <Button
            type={isInCart ? "primary" : "default"}
            block
            size="small"
            icon={isInCart ? <CheckOutlined /> : <ShoppingCartOutlined />}
            onClick={handleAddToCart}
            loading={isLoading}
            style={{
              backgroundColor: isInCart ? "#52c41a" : undefined,
              borderColor: isInCart ? "#52c41a" : undefined,
              color: isInCart ? "#fff" : undefined,
              fontSize: "clamp(11px, 2.5vw, 14px)",
            }}
          >
            {isInCart ? "In Cart" : "Add"}
          </Button>
        </Col>
        <Col span={8}>
          <Button
            type="default"
            block
            size="small"
            icon={<HeartOutlined />}
            onClick={handleAddToWishlist}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default ProductCard;
