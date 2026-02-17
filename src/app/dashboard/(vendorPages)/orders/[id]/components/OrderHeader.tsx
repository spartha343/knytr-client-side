"use client";

import { Button, message, Space, Tag, Typography } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { OrderStatus } from "@/types/order";
import ActionBar from "@/components/ui/ActionBar";
import { DownloadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { auth } from "@/firebase/firebase.config";
import { useAuthState } from "react-firebase-hooks/auth";
import { getBaseUrl } from "@/helpers/config/envConfig";

const { Text } = Typography;

interface OrderHeaderProps {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  onUpdateStatus: () => void;
  onEditOrder?: () => void;
  onBookPathaoDelivery?: () => void;
  onBack: () => void;
}

// Status color mapping
const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    PENDING: "blue",
    CONFIRMED: "purple",
    PROCESSING: "orange",
    READY_FOR_PICKUP: "gold",
    SHIPPED: "geekblue",
    OUT_FOR_DELIVERY: "cyan",
    DELIVERED: "green",
    CANCELLED: "red",
    RETURNED: "volcano",
  };
  return colors[status] || "default";
};

const OrderHeader = ({
  orderId,
  orderNumber,
  status,
  createdAt,
  onUpdateStatus,
  onEditOrder,
  onBookPathaoDelivery,
  onBack,
}: OrderHeaderProps) => {
  const isStatusUpdateDisabled =
    status === "DELIVERED" || status === "CANCELLED" || status === "RETURNED";
  const [user] = useAuthState(auth);

  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);

      const token = await user?.getIdToken();
      const response = await fetch(
        `${getBaseUrl()}/orders/${orderId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      // Get PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Invoice generation error:", error);
      message.error("Failed to generate invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <div>
      <ActionBar title={`Order #${orderNumber}`} />

      <div style={{ marginBottom: 24 }}>
        <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
          {/* Status and Voice Confirmed Badge */}
          <Space wrap>
            <Tag
              color={getStatusColor(status)}
              style={{ fontSize: 14, padding: "4px 12px" }}
            >
              {status.replace(/_/g, " ")}
            </Tag>
          </Space>

          {/* Order Date */}
          <Text type="secondary">
            Order Date: {new Date(createdAt).toLocaleString()}
          </Text>

          {/* Action Buttons */}
          <Space wrap>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={onUpdateStatus}
              disabled={isStatusUpdateDisabled}
            >
              Update Status
            </Button>
            {onEditOrder && status === "PENDING" && (
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={onEditOrder}
              >
                Edit Order
              </Button>
            )}
            {onBookPathaoDelivery && status === "READY_FOR_PICKUP" && (
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={onBookPathaoDelivery}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                Book Pathao Delivery
              </Button>
            )}
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleDownloadInvoice}
              loading={downloadingInvoice}
            >
              Download Invoice
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              Back to Orders
            </Button>
          </Space>
        </Space>
      </div>
    </div>
  );
};

export default OrderHeader;
