import { Typography } from "antd";

const { Title, Text } = Typography;

interface ProductsHeaderProps {
  totalProducts: number;
}

const ProductsHeader = ({ totalProducts }: ProductsHeaderProps) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "48px 24px",
        color: "white",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Title level={1} style={{ color: "white", marginBottom: "8px" }}>
          All Products
        </Title>
        <Text style={{ color: "white", fontSize: "16px" }}>
          {totalProducts} products found
        </Text>
      </div>
    </div>
  );
};

export default ProductsHeader;
