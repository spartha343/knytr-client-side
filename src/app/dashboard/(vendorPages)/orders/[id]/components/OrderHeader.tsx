"use client";

import { Button, Space, Tag, Typography } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { OrderStatus } from "@/types/order";
import ActionBar from "@/components/ui/ActionBar";

const { Text } = Typography;

interface OrderHeaderProps {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  isVoiceConfirmed: boolean;
  onUpdateStatus: () => void;
  onBack: () => void;
}

// Status color mapping
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

const OrderHeader = ({
  orderNumber,
  status,
  createdAt,
  isVoiceConfirmed,
  onUpdateStatus,
  onBack,
}: OrderHeaderProps) => {
  const isStatusUpdateDisabled =
    status === "DELIVERED" || status === "CANCELLED" || status === "RETURNED";

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
            {isVoiceConfirmed && (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Voice Confirmed
              </Tag>
            )}
          </Space>

          {/* Order Date */}
          <Text type="secondary">
            Order Date: {new Date(createdAt).toLocaleString()}
          </Text>

          {/* Action Buttons */}
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={onUpdateStatus}
              disabled={isStatusUpdateDisabled}
            >
              Update Status
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
