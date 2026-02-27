"use client";

import { Row, Col, Typography, Button, Spin } from "antd";
import Link from "next/link";
import { useGetPublicProductsQuery } from "@/redux/api/publicProductApi";
import { IProduct } from "@/types/product";
import ProductCard from "@/app/(MainLayout)/products/components/ProductCard";

const { Title } = Typography;

const FeaturedProducts = () => {
  const { data, isLoading } = useGetPublicProductsQuery({
    limit: 8,
    isFeatured: true,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const products = (data?.products as IProduct[]) || [];

  if (products.length === 0) return null;

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
        {products.map((product) => (
          <Col xs={12} sm={12} md={6} key={product.id}>
            <ProductCard product={product} />
          </Col>
        ))}
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
