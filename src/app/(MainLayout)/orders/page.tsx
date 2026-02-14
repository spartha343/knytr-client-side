"use client";

import { useState } from "react";
import { Card, Tag, Empty, Spin, Input, Alert } from "antd";
import { ShoppingOutlined, SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useGetCustomerOrdersQuery } from "@/redux/api/orderApi";
import type { IOrder } from "@/types/order";
import { OrderStatus } from "@/types/order";
import useDebounce from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";

const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    PLACED: "blue",
    VOICE_CONFIRMED: "cyan",
    VENDOR_CONFIRMED: "purple",
    PROCESSING: "orange",
    READY_TO_SHIP: "gold",
    SHIPPED: "geekblue",
    DELIVERED: "green",
    CANCELLED: "red",
    RETURNED: "volcano",
  };
  return colors[status] || "default";
};

const formatStatus = (status: OrderStatus) => {
  return status.replace(/_/g, " ");
};

const CustomerOrdersPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data,
    isLoading: ordersLoading,
    error,
  } = useGetCustomerOrdersQuery(
    {
      page,
      limit: size,
      searchTerm: debouncedSearchTerm,
    },
    {
      skip: !isAuthenticated,
    },
  );

  if (authLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Alert
          title="Please Log In"
          description="You need to be logged in to view your orders."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (ordersLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    const err = error as { status?: number; data?: { message?: string } };
    return (
      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
        <Alert
          title="Error Loading Orders"
          description={
            err?.data?.message || "Failed to load orders. Please try again."
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  const orders = (data?.orders as IOrder[]) || [];
  const meta = data?.meta;

  if (orders.length === 0 && !searchTerm) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Empty
          image={<ShoppingOutlined style={{ fontSize: 64, color: "#ccc" }} />}
          description={
            <div>
              <h2>No orders yet</h2>
              <p>Start shopping to create your first order!</p>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      <h1>My Orders</h1>

      <div style={{ marginBottom: 24 }}>
        <Input
          placeholder="Search by order number or customer info..."
          prefix={<SearchOutlined />}
          style={{ maxWidth: 400 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </div>

      {orders.length === 0 ? (
        <Empty description="No orders found" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order: IOrder) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              style={{ textDecoration: "none" }}
            >
              <Card hoverable style={{ cursor: "pointer" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  {/* Order Info */}
                  <div style={{ flex: 1, minWidth: 250 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 8,
                      }}
                    >
                      Order #{order.orderNumber}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#888", marginBottom: 4 }}
                    >
                      Store: {order.store?.name}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#888", marginBottom: 4 }}
                    >
                      Date:{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      Items: {order.items.length}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ textAlign: "center", minWidth: 150 }}>
                    <Tag
                      color={getStatusColor(order.status)}
                      style={{ fontSize: 12, padding: "4px 12px" }}
                    >
                      {formatStatus(order.status)}
                    </Tag>
                    {order.isVoiceConfirmed && (
                      <div
                        style={{ fontSize: 11, color: "#52c41a", marginTop: 4 }}
                      >
                        ✓ Voice Confirmed
                      </div>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      Total Amount
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#1890ff",
                      }}
                    >
                      ৳{Number(order.totalAmount).toLocaleString()}
                    </div>
                    {Number(order.totalDiscount) > 0 && (
                      <div style={{ fontSize: 11, color: "#52c41a" }}>
                        Saved ৳{Number(order.totalDiscount).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items Preview */}
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          background: "#f5f5f5",
                          borderRadius: 4,
                        }}
                      >
                        {item.productName}
                        {item.variantName && ` (${item.variantName})`} ×{" "}
                        {item.quantity}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#888",
                          padding: "4px 8px",
                        }}
                      >
                        +{order.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total > size && (
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <div style={{ display: "inline-flex", gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 16px",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                background: page === 1 ? "#f5f5f5" : "white",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <span
              style={{
                padding: "8px 16px",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
              }}
            >
              Page {page} of {Math.ceil(meta.total / size)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(meta.total / size)}
              style={{
                padding: "8px 16px",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                background:
                  page >= Math.ceil(meta.total / size) ? "#f5f5f5" : "white",
                cursor:
                  page >= Math.ceil(meta.total / size)
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
