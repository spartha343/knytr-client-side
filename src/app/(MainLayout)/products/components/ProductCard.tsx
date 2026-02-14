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
    router.push("/cart");

    // If already in cart, navigate to cart page
    if (isInCart) {
      router.push("/cart");
      return;
    }

    try {
      if (isAuthenticated) {
        // Add to DB cart
        await addToCart({
          productId: product.id,
          quantity: 1,
        }).unwrap();
        message.success("Added to cart!");
      } else {
        // Add to guest cart with full product info
        GuestCartManager.add({
          productId: product.id,
          quantity: 1,
          priceSnapshot: Number(product.basePrice),
          productName: product.name,
          productSlug: product.slug,
          storeId: product.store?.id || product.storeId,
          storeName: product.store?.name || "Unknown Store",
          storeSlug: product.store?.slug || "unknown",
          imageUrl: imageUrl || undefined,
          comparePrice: product.comparePrice
            ? Number(product.comparePrice)
            : undefined,
        });
        message.success("Added to cart!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      message.error("Failed to add to cart");
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
        body: { padding: "12px" },
      }}
      cover={
        <Link href={`/products/${product.store?.slug}/${product.slug}`}>
          <div
            style={{
              height: "180px",
              position: "relative",
              overflow: "hidden",
              borderRadius: "8px 8px 0 0",
            }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                style={{ objectFit: "cover", borderRadius: "8px 8px 0 0" }}
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
                  borderRadius: "8px 8px 0 0",
                }}
              >
                No Image
              </div>
            )}
          </div>
        </Link>
      }
    >
      <Link href={`/products/${product.slug}`}>
        <Card.Meta
          title={
            <div
              style={{
                height: "24px",
                overflow: "hidden",
                fontSize: "17px",
                lineHeight: "20px",
                marginBottom: "6px",
              }}
            >
              {product.name}
            </div>
          }
          description={
            <div style={{ marginBottom: "12px", minHeight: "46px" }}>
              <Text strong style={{ fontSize: "18px", color: "#1890ff" }}>
                ৳{product.basePrice.toLocaleString()}
              </Text>
              {product.comparePrice &&
              product.comparePrice > product.basePrice ? (
                <>
                  <br />
                  <Text delete style={{ color: "#999", fontSize: "14px" }}>
                    ৳{product.comparePrice.toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      color: "#52c41a",
                      marginLeft: "8px",
                      fontSize: "12px",
                    }}
                  >
                    Save {discount}%
                  </Text>
                </>
              ) : (
                <div style={{ height: "22px" }}></div>
              )}
            </div>
          }
        />
      </Link>

      {/* Buttons in Grid Layout */}
      <Row gutter={[8, 8]}>
        <Col span={24}>
          <Button
            type={isInCart ? "primary" : "default"}
            block
            size="middle"
            icon={isInCart ? <CheckOutlined /> : <ShoppingCartOutlined />}
            onClick={handleAddToCart}
            loading={isLoading}
            style={{
              backgroundColor: isInCart ? "#52c41a" : undefined,
              borderColor: isInCart ? "#52c41a" : undefined,
              color: isInCart ? "#fff" : undefined,
            }}
          >
            {isInCart ? "Go to Cart" : "Add to Cart"}
          </Button>
        </Col>
        <Col span={24}>
          <Button
            type="default"
            block
            size="middle"
            icon={<HeartOutlined />}
            onClick={handleAddToWishlist}
          >
            Wishlist
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default ProductCard;
