"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Row, Col, Card, Drawer } from "antd";
import { useGetPublicProductsQuery } from "@/redux/api/publicProductApi";
import { useGetPublicCategoriesQuery } from "@/redux/api/publicCategoryApi";
import { IProduct } from "@/types/product";
import { ICategory } from "@/types/category";
import ProductsHeader from "./components/ProductsHeader";
import FilterSidebar from "./components/FilterSidebar";
import ProductsGrid from "./components/ProductsGrid";

const ProductsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  // Fetch data
  const { data: productsData, isLoading: productsLoading } =
    useGetPublicProductsQuery({
      page,
      limit,
      searchTerm: searchTerm || undefined,
      categoryId,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    });

  const { data: categoriesData } = useGetPublicCategoriesQuery({ limit: 100 });

  const products = (productsData?.products as IProduct[]) || [];
  const meta = productsData?.meta;
  const categories = (categoriesData?.categories as ICategory[]) || [];

  // Initialize from URL params
  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");

    // Update search
    if (search) {
      setSearchTerm(search);
    } else if (!search && searchTerm) {
      setSearchTerm("");
    }

    // Update category
    if (category) {
      setCategoryId(category);
    } else if (!category && categoryId) {
      setCategoryId(undefined);
    }

    // Update sort - simplified
    if (sort) {
      const [field, order] = sort.split("-");
      setSortBy(field);
      setSortOrder(order as "asc" | "desc");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    router.push(`/products?${newParams.toString()}`);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    updateURL({ search: value });
  };

  // Handle category filter
  const handleCategoryChange = (categoryIds: string[]) => {
    const selectedCategory =
      categoryIds.length > 0 ? categoryIds[0] : undefined;
    setCategoryId(selectedCategory);
    setPage(1);
    updateURL({ category: selectedCategory || "" });
  };

  // Handle price range filter
  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    setMinPrice(value[0]);
    setMaxPrice(value[1]);
    setPage(1);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    if (value === "price-asc") {
      setSortBy("basePrice");
      setSortOrder("asc");
    } else if (value === "price-desc") {
      setSortBy("basePrice");
      setSortOrder("desc");
    } else if (value === "createdAt-desc") {
      setSortBy("createdAt");
      setSortOrder("desc");
    } else if (value === "createdAt-asc") {
      setSortBy("createdAt");
      setSortOrder("asc");
    }
    updateURL({ sort: value });
  };
  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryId(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPriceRange([0, 10000]);
    setPage(1);
    router.push("/products");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header Section */}
      <ProductsHeader totalProducts={meta?.total || 0} />

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
        <Row gutter={24}>
          {/* Desktop Filters Sidebar */}
          <Col xs={0} md={6} className="desktop-only">
            <Card style={{ position: "sticky", top: "88px" }}>
              <FilterSidebar
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                categoryId={categoryId}
                handleCategoryChange={handleCategoryChange}
                categories={categories}
                priceRange={priceRange}
                handlePriceRangeChange={handlePriceRangeChange}
                handleClearFilters={handleClearFilters}
              />
            </Card>
          </Col>

          {/* Products Grid */}
          <Col xs={24} md={18}>
            <ProductsGrid
              products={products}
              isLoading={productsLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onFilterClick={() => setMobileFiltersVisible(true)}
              page={page}
              total={meta?.total || 0}
              pageSize={limit}
              onPageChange={setPage}
              onClearFilters={handleClearFilters}
            />
          </Col>
        </Row>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        title="Filters"
        placement="left"
        onClose={() => setMobileFiltersVisible(false)}
        open={mobileFiltersVisible}
      >
        <FilterSidebar
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          categoryId={categoryId}
          handleCategoryChange={handleCategoryChange}
          categories={categories}
          priceRange={priceRange}
          handlePriceRangeChange={handlePriceRangeChange}
          handleClearFilters={handleClearFilters}
        />
      </Drawer>
    </div>
  );
};

export default ProductsPage;
