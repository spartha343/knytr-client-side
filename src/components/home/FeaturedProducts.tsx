"use client";

import { Card, Row, Col, Typography, Button, Spin, Badge } from "antd";
import { ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useGetPublicProductsQuery } from "@/redux/api/publicProductApi";

const { Title, Text } = Typography;

interface ProductMedia {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  comparePrice?: string;
  media?: ProductMedia[];
}

const FeaturedProducts = () => {
  const { data, isLoading } = useGetPublicProductsQuery({ limit: 8 });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const products = (data?.products as Product[]) || [];

  if (products.length === 0) {
    return null;
  }

  // Find primary image or first image
  const getProductImage = (product: Product) => {
    if (!product.media || product.media.length === 0) return null;
    const primaryImage = product.media.find((m) => m.isPrimary);
    return primaryImage?.url || product.media[0]?.url;
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
                  ((parseFloat(product.comparePrice) -
                    parseFloat(product.basePrice)) /
                    parseFloat(product.comparePrice)) *
                    100,
                )
              : 0;

          return (
            <Col xs={12} sm={12} md={6} key={product.id}>
              <Card
                hoverable
                cover={
                  <Link href={`/products/${product.slug}`}>
                    <div
                      style={{
                        height: "200px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                          style={{ objectFit: "cover" }}
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
                    type="text"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => console.log("Add to cart:", product.id)}
                  >
                    Cart
                  </Button>,
                  <Button
                    key="wishlist"
                    type="text"
                    icon={<HeartOutlined />}
                    onClick={() => console.log("Add to wishlist:", product.id)}
                  >
                    Wishlist
                  </Button>,
                ]}
              >
                <Link href={`/products/${product.slug}`}>
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
                          ৳{product.basePrice.toLocaleString()}
                        </Text>
                        {product.comparePrice &&
                          product.comparePrice > product.basePrice && (
                            <>
                              <br />
                              <Text
                                delete
                                style={{ color: "#999", fontSize: "14px" }}
                              >
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
