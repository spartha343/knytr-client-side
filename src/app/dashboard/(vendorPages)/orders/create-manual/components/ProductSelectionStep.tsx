"use client";

import { useState } from "react";
import {
  Form,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  Typography,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useGetAllProductsQuery } from "@/redux/api/productApi";
import { IProduct, IProductVariant } from "@/types/product";

const { Text } = Typography;

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantSku?: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

interface ProductSelectionStepProps {
  storeId: string;
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
}

const ProductSelectionStep = ({
  storeId,
  items,
  onItemsChange,
}: ProductSelectionStepProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [itemCounter, setItemCounter] = useState(0);

  // Fetch products for the selected store
  const { data: productsResponse, isLoading } = useGetAllProductsQuery({
    storeId,
  });

  const products = (productsResponse?.products as IProduct[]) || [];

  // Get selected product details
  const selectedProduct = products.find(
    (p: IProduct) => p.id === selectedProductId,
  );
  const hasVariants =
    selectedProduct?.variants && selectedProduct.variants.length > 0;

  // Get price based on variant or product
  const getPrice = (): number => {
    if (!selectedProduct) return 0;

    if (hasVariants && selectedVariantId && selectedProduct.variants) {
      const variant = selectedProduct.variants.find(
        (v: IProductVariant) => v.id === selectedVariantId,
      );
      return variant?.price || 0;
    }
    return selectedProduct.basePrice || 0;
  };

  // Get variant display name (using SKU since name doesn't exist)
  const getVariantDisplay = (variant: IProductVariant): string => {
    return variant.sku;
  };

  // Add item to order
  const handleAddItem = () => {
    if (!selectedProductId || !selectedProduct) {
      return;
    }

    if (hasVariants && !selectedVariantId) {
      return;
    }

    const price = getPrice();
    const variantSku =
      hasVariants && selectedVariantId && selectedProduct.variants
        ? selectedProduct.variants.find(
            (v: IProductVariant) => v.id === selectedVariantId,
          )?.sku
        : null;

    const newItem: OrderItem = {
      id: `${selectedProductId}-${selectedVariantId || "base"}-${itemCounter}`,
      productId: selectedProductId,
      productName: selectedProduct.name,
      variantId: selectedVariantId,
      variantSku,
      price,
      quantity,
      subtotal: price * quantity,
    };

    onItemsChange([...items, newItem]);
    setItemCounter(itemCounter + 1);

    // Reset form
    setSelectedProductId(null);
    setSelectedVariantId(null);
    setQuantity(1);
  };

  // Remove item from order
  const handleRemoveItem = (itemId: string) => {
    onItemsChange(items.filter((item) => item.id !== itemId));
  };

  // Calculate total
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Table columns
  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_: unknown, record: OrderItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.productName}</div>
          {record.variantSku && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              SKU: {record.variantSku}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      width: 120,
      render: (_: unknown, record: OrderItem) =>
        `৳${Number(record.price).toFixed(2)}`,
    },
    {
      title: "Quantity",
      key: "quantity",
      width: 100,
      render: (_: unknown, record: OrderItem) => record.quantity,
    },
    {
      title: "Subtotal",
      key: "subtotal",
      width: 120,
      render: (_: unknown, record: OrderItem) => (
        <Text strong>৳{Number(record.subtotal).toFixed(2)}</Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_: unknown, record: OrderItem) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        >
          Remove
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      {/* Product Selection Form */}
      <Form layout="vertical">
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          {/* Product Selector */}
          <Form.Item
            label={
              <span>
                <ShoppingOutlined /> Select Product
              </span>
            }
            required
          >
            <Select
              placeholder="Search and select a product"
              value={selectedProductId}
              onChange={(value) => {
                setSelectedProductId(value);
                setSelectedVariantId(null);
              }}
              size="large"
              showSearch
              style={{ width: "100%" }}
            >
              {products.map((product: IProduct) => (
                <Select.Option key={product.id} value={product.id}>
                  {product.name} - ৳{Number(product.basePrice).toFixed(2)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Variant Selector (if product has variants) */}
          {hasVariants && selectedProduct && selectedProduct.variants && (
            <Form.Item label="Select Variant" required>
              <Select
                placeholder="Select a variant"
                value={selectedVariantId}
                onChange={setSelectedVariantId}
                size="large"
                style={{ width: "100%" }}
              >
                {selectedProduct.variants.map((variant: IProductVariant) => (
                  <Select.Option key={variant.id} value={variant.id}>
                    {getVariantDisplay(variant)} - ৳
                    {Number(variant.price).toFixed(2)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Quantity */}
          <Form.Item label="Quantity" required>
            <InputNumber
              min={1}
              max={1000}
              value={quantity}
              onChange={(value) => setQuantity(value || 1)}
              size="large"
              style={{ width: 200 }}
            />
          </Form.Item>

          {/* Add Button */}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddItem}
            disabled={!selectedProductId || (hasVariants && !selectedVariantId)}
            size="large"
            block
          >
            Add to Order
          </Button>
        </Space>
      </Form>

      {/* Selected Items Table */}
      <div style={{ marginTop: 32 }}>
        <h3>Order Items ({items.length})</h3>

        {items.length > 0 ? (
          <>
            <Table
              columns={columns}
              dataSource={items}
              rowKey="id"
              pagination={false}
              scroll={{ x: 600 }}
              style={{ marginTop: 16 }}
            />

            {/* Total */}
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "#f0f0f0",
                borderRadius: 4,
                textAlign: "right",
              }}
            >
              <Text strong style={{ fontSize: 18 }}>
                Total: ৳{totalAmount.toFixed(2)}
              </Text>
            </div>
          </>
        ) : (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              background: "#fafafa",
              border: "1px dashed #d9d9d9",
              borderRadius: 4,
            }}
          >
            <p style={{ color: "#888", margin: 0 }}>
              No items added yet. Select products above to add to the order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSelectionStep;
