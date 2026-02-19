"use client";

import { Card, Row, Col, Typography, Button, Spin, Badge, message } from "antd";
import { ShoppingCartOutlined, CheckOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetPublicProductsQuery } from "@/redux/api/publicProductApi";
import { useAddToCartMutation, useGetCartQuery } from "@/redux/api/cartApi";
import { GuestCartManager } from "@/utils/guestCart";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/hooks/useGuestCart";
import { IProduct } from "@/types/product";
import type { ICart } from "@/types/cart";
import { useState } from "react";

const { Title, Text } = Typography;

const FeaturedProducts = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useGetPublicProductsQuery({ limit: 8 });
  const [addToCart] = useAddToCartMutation();

  // Track which product is being added
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Get guest cart items
  const { items: guestCartItems } = useGuestCart();

  // Get DB cart for authenticated users
  const { data: dbCartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dbCart = dbCartResponse as ICart | undefined;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const products = (data?.products as IProduct[]) || [];

  if (products.length === 0) {
    return null;
  }

  // Find primary image or first image
  const getProductImage = (product: IProduct) => {
    if (!product.media || product.media.length === 0) return null;
    const primaryImage = product.media.find((m) => m.isPrimary);
    return primaryImage?.mediaUrl || product.media[0]?.mediaUrl;
  };

  // Check if product is in cart
  const isProductInCart = (productId: string) => {
    if (isAuthenticated) {
      return (
        dbCart?.items?.some((item) => item.productId === productId) || false
      );
    } else {
      return guestCartItems.some((item) => item.productId === productId);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If already in cart, navigate to cart page
    if (isProductInCart(product.id)) {
      router.push("/cart");
      return;
    }

    setAddingProductId(product.id);

    try {
      if (isAuthenticated) {
        // Get first variant if product has variants
        const variantId =
          product.variants && product.variants.length > 0
            ? product.variants[0].id
            : undefined;

        // Add to DB cart
        await addToCart({
          productId: product.id,
          variantId,
          quantity: 1,
        }).unwrap();
        message.success("Added to cart!");
      } else {
        // Add to guest cart with full product info
        const imageUrl = getProductImage(product);
        const firstVariant = product.variants?.[0];

        GuestCartManager.add({
          productId: product.id,
          variantId: firstVariant?.id,
          quantity: 1,
          priceSnapshot: firstVariant?.price
            ? Number(firstVariant.price)
            : Number(product.basePrice),
          productName: product.name,
          productSlug: product.slug,
          storeId: product.store?.id || product.storeId,
          storeName: product.store?.name || "Unknown Store",
          storeSlug: product.store?.slug || "unknown",
          imageUrl: firstVariant?.imageUrl || imageUrl || undefined,
          comparePrice: firstVariant?.comparePrice
            ? Number(firstVariant.comparePrice)
            : product.comparePrice
              ? Number(product.comparePrice)
              : undefined,
          variantName: firstVariant?.variantAttributes
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
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div
      style={{
        padding: "48px 24px",
        maxWidth: "1400px",
        margin: "0 auto",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
        Featured Products
      </Title>

      <Row gutter={[16, 16]}>
        {products.map((product) => {
          const imageUrl = getProductImage(product);
          const discount =
            product.comparePrice && product.comparePrice > product.basePrice
              ? Math.round(
                  ((product.comparePrice - product.basePrice) /
                    product.comparePrice) *
                    100,
                )
              : 0;
          const isInCart = isProductInCart(product.id);
          const isAdding = addingProductId === product.id;

          return (
            <Col xs={12} sm={12} md={6} key={product.id}>
              <Card
                hoverable
                cover={
                  <Link
                    href={`/products/${product.store?.slug}/${product.slug}`}
                  >
                    <div
                      style={{
                        height: "200px",
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
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                          style={{
                            objectFit: "cover",
                            borderRadius: "8px 8px 0 0",
                          }}
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
                      {discount > 0 && (
                        <Badge.Ribbon text={`-${discount}%`} color="red" />
                      )}
                    </div>
                  </Link>
                }
                actions={[
                  <Button
                    key="cart"
                    type={isInCart ? "primary" : "text"}
                    icon={
                      isInCart ? <CheckOutlined /> : <ShoppingCartOutlined />
                    }
                    onClick={(e) => handleAddToCart(product, e)}
                    loading={isAdding}
                    style={{
                      backgroundColor: isInCart ? "#52c41a" : undefined,
                      borderColor: isInCart ? "#52c41a" : undefined,
                      color: isInCart ? "#fff" : undefined,
                    }}
                  >
                    {isInCart ? "In Cart" : "Cart"}
                  </Button>,
                  // Wishlist feature not implemented yet
                  // <Button
                  //   key="wishlist"
                  //   type="text"
                  //   icon={<HeartOutlined />}
                  //   onClick={() => {
                  //     message.info("Wishlist feature coming soon!");
                  //   }}
                  // >
                  //   Wishlist
                  // </Button>,
                ]}
              >
                <Link href={`/products/${product.store?.slug}/${product.slug}`}>
                  <Card.Meta
                    title={
                      <div style={{ height: "40px", overflow: "hidden" }}>
                        {product.name}
                      </div>
                    }
                    description={
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "18px", color: "#1890ff" }}
                        >
                          ৳{Number(product.basePrice).toLocaleString()}
                        </Text>
                        {product.comparePrice &&
                          product.comparePrice > product.basePrice && (
                            <>
                              <br />
                              <Text
                                delete
                                style={{ color: "#999", fontSize: "14px" }}
                              >
                                ৳{Number(product.comparePrice).toLocaleString()}
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
                          )}
                      </div>
                    }
                  />
                </Link>
              </Card>
            </Col>
          );
        })}
      </Row>

      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <Link href="/products">
          <Button type="primary" size="large">
            View All Products
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default FeaturedProducts;
