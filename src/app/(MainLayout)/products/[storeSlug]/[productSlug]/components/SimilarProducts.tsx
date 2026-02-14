import { Typography, Row, Col } from "antd";
import ProductCard from "@/app/(MainLayout)/products/components/ProductCard";
import { IProduct } from "@/types/product";

const { Title } = Typography;

interface SimilarProductsProps {
  products: IProduct[];
}

export const SimilarProducts = ({ products }: SimilarProductsProps) => {
  if (!products || products.length === 0) return null;

  return (
    <div style={{ marginTop: "60px", marginBottom: "100px" }}>
      <Title level={3} style={{ marginBottom: "24px" }}>
        Similar Products
      </Title>
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col key={product.id} xs={12} sm={8} md={6} lg={4}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </div>
  );
};
