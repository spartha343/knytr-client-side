"use client";

import {
  Card,
  Descriptions,
  Tag,
  Alert,
  Button,
  message,
  Popconfirm,
} from "antd";
import {
  RocketOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useRetryDeliveryMutation } from "@/redux/api/pathaoApi";

interface PathaoDeliveryCardProps {
  delivery: {
    id: string;
    consignmentId?: string | null;
    invoiceId?: string | null;
    status: string;
    deliveryFee?: number | null;
    createdAt: string;
  };
}

const getDeliveryStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    CREATING: "blue",
    CREATED: "cyan",
    PENDING: "orange",
    PICKUP_REQUESTED: "gold",
    ASSIGNED_FOR_PICKUP: "lime",
    PICKED_UP: "geekblue",
    AT_SORTING_HUB: "purple",
    IN_TRANSIT: "purple",
    RECEIVED_AT_LAST_MILE: "geekblue",
    ASSIGNED_FOR_DELIVERY: "blue",
    DELIVERED: "green",
    PARTIAL_DELIVERY: "gold",
    RETURNED: "volcano",
    DELIVERY_FAILED: "red",
    PICKUP_FAILED: "red",
    ON_HOLD: "orange",
    CANCELLED: "red",
    FAILED: "red",
  };
  return colors[status] || "default";
};

const PathaoDeliveryCard = ({ delivery }: PathaoDeliveryCardProps) => {
  const isDelivered = delivery.status === "DELIVERED";
  const isFailed = delivery.status === "FAILED";
  const isPickupFailed = delivery.status === "PICKUP_FAILED";
  const isDeliveryFailed = delivery.status === "DELIVERY_FAILED";
  const canRetry = isFailed || isPickupFailed || isDeliveryFailed;

  const [retryDelivery, { isLoading: isRetrying }] = useRetryDeliveryMutation();

  const handleRetry = async () => {
    try {
      await retryDelivery(delivery.id).unwrap();
      message.success("Delivery retry initiated successfully");
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : ((error as { data?: { message?: string } })?.data?.message ??
            "Failed to retry delivery");
      message.error(errMsg);
    }
  };

  return (
    <Card
      title={
        <span>
          <RocketOutlined /> Pathao Delivery Information
        </span>
      }
      extra={
        canRetry && (
          <Popconfirm
            title="Retry Delivery"
            description="Are you sure you want to retry this delivery?"
            onConfirm={handleRetry}
            okText="Yes, Retry"
            cancelText="Cancel"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<ReloadOutlined />}
              loading={isRetrying}
            >
              Retry
            </Button>
          </Popconfirm>
        )
      }
      style={{ marginBottom: 16 }}
    >
      {isDelivered && (
        <Alert
          title="Delivery Completed"
          description="This order has been successfully delivered via Pathao"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      {canRetry && (
        <Alert
          title="Delivery Failed"
          description="This delivery encountered an issue. You can retry up to 3 times."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Status" span={2}>
          <Tag
            color={getDeliveryStatusColor(delivery.status)}
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {delivery.status.replace(/_/g, " ")}
          </Tag>
        </Descriptions.Item>

        {delivery.consignmentId && (
          <Descriptions.Item label="Consignment ID" span={2}>
            <strong>{delivery.consignmentId}</strong>
          </Descriptions.Item>
        )}

        {delivery.invoiceId && (
          <Descriptions.Item label="Invoice ID" span={2}>
            {delivery.invoiceId}
          </Descriptions.Item>
        )}

        {delivery.deliveryFee && (
          <Descriptions.Item label="Delivery Fee" span={2}>
            {delivery.deliveryFee} BDT
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Booked At" span={2}>
          {new Date(delivery.createdAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default PathaoDeliveryCard;
