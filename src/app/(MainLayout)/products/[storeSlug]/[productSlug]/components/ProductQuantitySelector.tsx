/**
 * ProductQuantitySelector Component
 * Allows users to select product quantity
 */

import { Typography, Space, Button } from "antd";

const { Text } = Typography;

interface ProductQuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onQuantityChange: (quantity: number) => void;
}

export const ProductQuantitySelector = ({
  quantity,
  maxStock,
  onQuantityChange,
}: ProductQuantitySelectorProps) => {
  const handleDecrease = () => {
    onQuantityChange(Math.max(1, quantity - 1));
  };

  const handleIncrease = () => {
    onQuantityChange(Math.min(maxStock, quantity + 1));
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <Text strong style={{ display: "block", marginBottom: "12px" }}>
        Quantity:
      </Text>
      <Space>
        <Button onClick={handleDecrease} disabled={quantity <= 1}>
          -
        </Button>
        <Text
          style={{
            padding: "0 20px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {quantity}
        </Text>
        <Button onClick={handleIncrease} disabled={quantity >= maxStock}>
          +
        </Button>
      </Space>
    </div>
  );
};
