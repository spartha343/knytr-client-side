import { Row, Col, Select, Button, Spin, Empty, Pagination, Card } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { IProduct } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductsGridProps {
  products: IProduct[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (value: string) => void;
  onFilterClick: () => void;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

const ProductsGrid = ({
  products,
  isLoading,
  sortBy,
  sortOrder,
  onSortChange,
  onFilterClick,
  page,
  total,
  pageSize,
  onPageChange,
  onClearFilters,
}: ProductsGridProps) => {
  return (
    <>
      {/* Sort and Mobile Filter Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <Select
          value={`${sortBy}-${sortOrder}`}
          onChange={onSortChange}
          style={{ width: 200 }}
        >
          <Select.Option value="createdAt-desc">Newest First</Select.Option>
          <Select.Option value="createdAt-asc">Oldest First</Select.Option>
          <Select.Option value="basePrice-asc">
            Price: Low to High
          </Select.Option>
          <Select.Option value="basePrice-desc">
            Price: High to Low
          </Select.Option>
        </Select>

        {/* Mobile Filter Button */}
        <Button
          icon={<FilterOutlined />}
          onClick={onFilterClick}
          className="mobile-only"
        >
          Filters
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <Spin size="large" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && products.length === 0 && (
        <Card>
          <Empty
            description="No products found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={onClearFilters}>
              Clear Filters
            </Button>
          </Empty>
        </Card>
      )}

      {/* Products Grid */}
      {!isLoading && products.length > 0 && (
        <>
          <Row gutter={[16, 16]}>
            {products.map((product) => (
              <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={onPageChange}
              showSizeChanger={false}
              showTotal={(total) => `Total ${total} products`}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ProductsGrid;
