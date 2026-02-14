/**
 * ProductStockStatus Component
 * Displays stock availability status
 */

import { Typography } from "antd";

const { Text } = Typography;

interface ProductStockStatusProps {
  totalStock: number;
}

export const ProductStockStatus = ({ totalStock }: ProductStockStatusProps) => {
  return (
    <div style={{ marginBottom: "24px" }}>
      {totalStock > 0 ? (
        <Text type="success" strong>
          In Stock ({totalStock} available)
        </Text>
      ) : (
        <Text type="danger" strong>
          Out of Stock
        </Text>
      )}
    </div>
  );
};
