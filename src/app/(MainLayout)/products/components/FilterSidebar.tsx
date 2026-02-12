import { useState, useEffect } from "react";
import { Row, Col, Typography, Button, Input, Slider, Checkbox } from "antd";
import { ICategory } from "@/types/category";

const { Title, Text } = Typography;
const { Search } = Input;

interface FilterSidebarProps {
  searchTerm: string;
  handleSearch: (value: string) => void;
  categoryId: string | undefined;
  handleCategoryChange: (value: string[]) => void;
  categories: ICategory[];
  priceRange: [number, number];
  handlePriceRangeChange: (value: [number, number]) => void;
  handleClearFilters: () => void;
}

const FilterSidebar = ({
  searchTerm,
  handleSearch,
  categoryId,
  handleCategoryChange,
  categories,
  priceRange,
  handlePriceRangeChange,
  handleClearFilters,
}: FilterSidebarProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce search - waits 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        handleSearch(localSearchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with parent searchTerm
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  return (
    <div>
      {/* Search with Debouncing */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={5}>Search</Title>
        <Search
          placeholder="Search products..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onSearch={handleSearch}
          allowClear
        />
      </div>

      {/* Categories */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={5}>Categories</Title>
        <Checkbox.Group
          value={categoryId ? [categoryId] : []}
          onChange={handleCategoryChange}
          style={{ width: "100%" }}
        >
          <Row>
            {categories.map((category: ICategory) => (
              <Col span={24} key={category.id} style={{ marginBottom: "8px" }}>
                <Checkbox value={category.id}>{category.name}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={5}>Price Range</Title>
        <Slider
          range
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onChange={(value) =>
            handlePriceRangeChange(value as [number, number])
          }
          tooltip={{
            formatter: (value) => `৳${value?.toLocaleString()}`,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text>৳{priceRange[0].toLocaleString()}</Text>
          <Text>৳{priceRange[1].toLocaleString()}</Text>
        </div>
      </div>

      {/* Clear Filters */}
      <Button block onClick={handleClearFilters}>
        Clear All Filters
      </Button>
    </div>
  );
};

export default FilterSidebar;
