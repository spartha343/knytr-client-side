/**
 * ProductPricing Component
 * Displays product price, discount, and shipping info
 */

import { Typography, Space, Tag } from "antd";

const { Title, Text } = Typography;

interface ProductPricingProps {
  currentPrice: number | string;
  comparePrice?: number | string | null;
  freeShipping?: boolean;
}

export const ProductPricing = ({
  currentPrice,
  comparePrice,
  freeShipping,
}: ProductPricingProps) => {
  const discountPercentage =
    comparePrice && Number(comparePrice) > Number(currentPrice)
      ? Math.round(
          ((Number(comparePrice) - Number(currentPrice)) /
            Number(comparePrice)) *
            100,
        )
      : 0;

  return (
    <Space
      orientation="vertical"
      size="small"
      style={{ marginBottom: "24px", width: "100%" }}
    >
      <Space align="baseline">
        <Title level={3} style={{ margin: 0, color: "#ff4d4f" }}>
          ৳{Number(currentPrice).toLocaleString()}
        </Title>
        {comparePrice && Number(comparePrice) > Number(currentPrice) && (
          <>
            <Text delete style={{ fontSize: "18px", color: "#999" }}>
              ৳{Number(comparePrice).toLocaleString()}
            </Text>
            <Tag color="red">{discountPercentage}% OFF</Tag>
          </>
        )}
      </Space>
      {freeShipping && <Tag color="success">Free Shipping</Tag>}
    </Space>
  );
};
