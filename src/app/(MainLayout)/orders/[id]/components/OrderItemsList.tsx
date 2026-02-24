"use client";

import { Card, Table, Image, Tag } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import type { IOrderItem } from "@/types/order";

interface OrderItemsListProps {
  items: IOrderItem[];
}

const OrderItemsList = ({ items }: OrderItemsListProps) => {
  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "product",
      render: (_: string, record: IOrderItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Product Image */}
          {record.productImage ? (
            <Image
              src={record.productImage}
              alt={record.productName}
              width={60}
              height={60}
              style={{ objectFit: "cover", borderRadius: 8 }}
              preview={false}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                background: "#f0f0f0",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCartOutlined style={{ fontSize: 24, color: "#ccc" }} />
            </div>
          )}

          {/* Product Info */}
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {record.productName}
            </div>
            {record.variantName && (
              <Tag color="blue" style={{ fontSize: 11 }}>
                {record.variantName}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right" as const,
      render: (price: number) => (
        <span style={{ fontWeight: 500 }}>
          ৳{Number(price).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (quantity: number) => <Tag color="purple">×{quantity}</Tag>,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      align: "right" as const,
      render: (discount: number) => {
        if (Number(discount) > 0) {
          return (
            <span style={{ color: "#52c41a", fontWeight: 500 }}>
              -৳{Number(discount).toLocaleString()}
            </span>
          );
        }
        return <span style={{ color: "#999" }}>-</span>;
      },
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      align: "right" as const,
      render: (total: number) => (
        <span style={{ fontWeight: "bold", fontSize: 16, color: "#1890ff" }}>
          ৳{Number(total).toLocaleString()}
        </span>
      ),
    },
  ];

  // Mobile-friendly columns (fewer columns on small screens)
  const mobileColumns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "product",
      render: (_: string, record: IOrderItem) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            {/* Product Image */}
            {record.productImage ? (
              <Image
                src={record.productImage}
                alt={record.productName}
                width={50}
                height={50}
                style={{ objectFit: "cover", borderRadius: 8 }}
                preview={false}
              />
            ) : (
              <div
                style={{
                  width: 50,
                  height: 50,
                  background: "#f0f0f0",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingCartOutlined style={{ fontSize: 20, color: "#ccc" }} />
              </div>
            )}

            {/* Product Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                {record.productName}
              </div>
              {record.variantName && (
                <Tag color="blue" style={{ fontSize: 11 }}>
                  {record.variantName}
                </Tag>
              )}
            </div>
          </div>

          {/* Price Details */}
          <div style={{ fontSize: 12, color: "#666" }}>
            <div>
              Price: ৳{Number(record.price).toLocaleString()} ×{" "}
              {record.quantity}
            </div>
            {Number(record.discount) > 0 && (
              <div style={{ color: "#52c41a" }}>
                Discount: -৳{Number(record.discount).toLocaleString()}
              </div>
            )}
            <div
              style={{
                fontWeight: "bold",
                fontSize: 14,
                color: "#1890ff",
                marginTop: 4,
              }}
            >
              Total: ৳{Number(record.total).toLocaleString()}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card
      title={
        <span>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          Order Items ({items.length})
        </span>
      }
    >
      {/* Desktop Table */}
      <div className="desktop-table" style={{ display: "block" }}>
        <Table
          dataSource={items}
          columns={columns}
          pagination={false}
          rowKey="id"
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Mobile Table */}
      <div className="mobile-table" style={{ display: "none" }}>
        <Table
          dataSource={items}
          columns={mobileColumns}
          pagination={false}
          rowKey="id"
          showHeader={false}
          scroll={{ x: "max-content" }}
        />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-table {
            display: none !important;
          }
          .mobile-table {
            display: block !important;
          }
        }
      `}</style>
    </Card>
  );
};

export default OrderItemsList;
