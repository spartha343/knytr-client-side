"use client";

import { Card, Tag, Button, Space } from "antd";
import { CloseCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import { OrderStatus } from "@/types/order";

interface OrderHeaderProps {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  canCancel: boolean;
  onCancelClick: () => void;
  onDownloadInvoice?: () => void;
}

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PENDING: "orange",
    CONFIRMED: "blue",
    PROCESSING: "purple",
    READY_FOR_PICKUP: "gold",
    SHIPPED: "geekblue",
    OUT_FOR_DELIVERY: "cyan",
    DELIVERED: "green",
    CANCELLED: "red",
    RETURNED: "volcano",
  };
  return colors[status] || "default";
};

const formatStatus = (status: OrderStatus): string => {
  return status.replace(/_/g, " ");
};

const OrderHeader = ({
  orderNumber,
  status,
  createdAt,
  canCancel,
  onCancelClick,
  onDownloadInvoice,
}: OrderHeaderProps) => {
  return (
    <Card>
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
        <div>
          <h2 style={{ margin: 0, fontSize: 20, marginBottom: 8 }}>
            Order #{orderNumber}
          </h2>
          <div style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>
            Placed on{" "}
            {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <Tag
            color={getStatusColor(status)}
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {formatStatus(status)}
          </Tag>
        </div>

        {/* Action Buttons */}
        <Space wrap>
          {canCancel && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={onCancelClick}
            >
              Cancel Order
            </Button>
          )}
          {onDownloadInvoice && (
            <Button icon={<DownloadOutlined />} onClick={onDownloadInvoice}>
              Download Invoice
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default OrderHeader;
