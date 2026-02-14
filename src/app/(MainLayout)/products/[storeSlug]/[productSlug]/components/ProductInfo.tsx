/**
 * ProductInfo Component
 * Displays product title, brand, category, and store info
 */

import { Typography, Space, Tag, Divider } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

interface Store {
  slug: string;
  name: string;
}

interface Brand {
  name: string;
}

interface Category {
  name: string;
}

interface ProductInfoProps {
  productName: string;
  store?: Store;
  brand?: Brand;
  category?: Category;
}

export const ProductInfo = ({
  productName,
  store,
  brand,
  category,
}: ProductInfoProps) => {
  return (
    <>
      {/* Store Info */}
      {store && (
        <Link href={`/stores/${store.slug}`}>
          <Space style={{ marginBottom: "12px", cursor: "pointer" }}>
            <ShopOutlined style={{ fontSize: "16px" }} />
            <Text strong style={{ fontSize: "16px" }}>
              {store.name}
            </Text>
          </Space>
        </Link>
      )}

      {/* Product Title */}
      <Title level={2} style={{ marginBottom: "8px" }}>
        {productName}
      </Title>

      {/* Brand & Category */}
      <Space size="middle" style={{ marginBottom: "16px" }}>
        {brand && (
          <Tag color="blue">
            <strong>Brand:</strong> {brand.name}
          </Tag>
        )}
        {category && (
          <Tag color="green">
            <strong>Category:</strong> {category.name}
          </Tag>
        )}
      </Space>

      <Divider />
    </>
  );
};
