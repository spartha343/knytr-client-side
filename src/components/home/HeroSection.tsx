"use client";

import { Input, Button, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Search } = Input;
const { Title, Text } = Typography;

const HeroSection = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "80px 24px",
        textAlign: "center",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Title
          level={1}
          style={{ color: "#fff", fontSize: "48px", marginBottom: "16px" }}
        >
          Discover Amazing Products
        </Title>
        <Text
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: "18px",
            display: "block",
            marginBottom: "32px",
          }}
        >
          Shop from thousands of products across hundreds of stores in
          Bangladesh
        </Text>

        {/* Search Bar */}
        <Search
          size="large"
          placeholder="Search for products..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          enterButton={
            <Button type="primary" size="large" icon={<SearchOutlined />}>
              Search
            </Button>
          }
          style={{ maxWidth: "600px" }}
        />

        {/* Quick Stats */}
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            justifyContent: "center",
            gap: "48px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              1000+
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)" }}>Products</Text>
          </div>
          <div>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              100+
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)" }}>Stores</Text>
          </div>
          <div>
            <Title level={2} style={{ color: "#fff", margin: 0 }}>
              5000+
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.8)" }}>
              Happy Customers
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
