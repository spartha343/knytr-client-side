"use client";

import { Card, Row, Col, Typography, Spin } from "antd";
import Link from "next/link";
import Image from "next/image";
import { useGetPublicCategoriesQuery } from "@/redux/api/publicCategoryApi";

const { Title } = Typography;

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

const CategoryGrid = () => {
  const { data, isLoading } = useGetPublicCategoriesQuery({ limit: 8 });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const categories = (data?.categories as Category[]) || [];

  if (categories.length === 0) {
    return null; // Don't show section if no categories
  }

  return (
    <div style={{ padding: "48px 24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
        Shop by Category
      </Title>

      <Row gutter={[16, 16]}>
        {categories.map((category, index) => (
          <Col xs={12} sm={8} md={6} key={category.id}>
            <Link href={`/products?category=${category.id}`}>
              <Card
                hoverable
                cover={
                  category.imageUrl ? (
                    <div
                      style={{
                        height: "150px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        priority={index === 0 && !!category.imageUrl}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "150px",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "48px",
                      }}
                    >
                      📦
                    </div>
                  )
                }
                style={{ textAlign: "center" }}
              >
                <Card.Meta title={category.name} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CategoryGrid;
