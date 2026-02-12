"use client";

import { Card, Row, Col, Typography, Button, Spin, Avatar } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useGetPublicStoresQuery } from "@/redux/api/publicStoreApi";

const { Title, Text } = Typography;

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
}

const PopularStores = () => {
  const { data, isLoading } = useGetPublicStoresQuery({ limit: 6 });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const stores = (data?.stores as Store[]) || [];

  if (stores.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: "48px 24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
        Popular Stores
      </Title>

      <Row gutter={[16, 16]}>
        {stores.map((store) => (
          <Col xs={24} sm={12} md={8} key={store.id}>
            <Card
              hoverable
              cover={
                store.banner ? (
                  <div
                    style={{
                      height: "150px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={store.banner}
                      alt={store.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: "150px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  />
                )
              }
            >
              <Card.Meta
                avatar={
                  store.logo ? (
                    <Avatar src={store.logo} size={64} />
                  ) : (
                    <Avatar icon={<ShopOutlined />} size={64} />
                  )
                }
                title={<Link href={`/stores/${store.slug}`}>{store.name}</Link>}
                description={
                  <div>
                    <Text
                      ellipsis
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      {store.description || "No description"}
                    </Text>
                    <Link href={`/stores/${store.slug}`}>
                      <Button type="link" style={{ padding: 0 }}>
                        Visit Store →
                      </Button>
                    </Link>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <Link href="/stores">
          <Button type="primary" size="large">
            View All Stores
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PopularStores;
