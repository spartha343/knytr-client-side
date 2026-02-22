"use client";

import {
  Card,
  Descriptions,
  Tag,
  Alert,
  Button,
  message,
  Popconfirm,
  Timeline,
  Typography,
} from "antd";
import {
  RocketOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import {
  useRetryDeliveryMutation,
  useSyncDeliveryStatusMutation,
} from "@/redux/api/pathaoApi";

const { Text } = Typography;

interface PathaoDeliveryCardProps {
  delivery: {
    id: string;
    consignmentId?: string | null;
    invoiceId?: string | null;
    status: string;
    deliveryFee?: number | null;
    createdAt: string;
    statusHistory?: {
      id: string;
      status: string;
      createdAt: string;
    }[];
  };
  orderId: string;
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

const PathaoDeliveryCard = ({ delivery, orderId }: PathaoDeliveryCardProps) => {
  const isDelivered = delivery.status === "DELIVERED";
  const isFailed = delivery.status === "FAILED";
  const isPickupFailed = delivery.status === "PICKUP_FAILED";
  const isDeliveryFailed = delivery.status === "DELIVERY_FAILED";
  const canRetry = isFailed || isPickupFailed || isDeliveryFailed;

  const [retryDelivery, { isLoading: isRetrying }] = useRetryDeliveryMutation();
  const [syncDeliveryStatus, { isLoading: isSyncing }] =
    useSyncDeliveryStatusMutation();

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

  const handleSyncStatus = async () => {
    try {
      await syncDeliveryStatus(orderId).unwrap();
      message.success("Delivery status synced successfully");
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : ((error as { data?: { message?: string } })?.data?.message ??
            "Failed to sync delivery status");
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
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={isSyncing}
            onClick={handleSyncStatus}
            disabled={isDelivered}
          >
            Sync Status
          </Button>
          {canRetry && (
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
          )}
        </div>
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

      {/* Status History Timeline */}
      {delivery.statusHistory && delivery.statusHistory.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Text strong style={{ display: "block", marginBottom: 12 }}>
            Delivery Status Timeline
          </Text>
          <Timeline
            mode="left"
            items={delivery.statusHistory.map((history, index) => {
              const isLatest = index === delivery.statusHistory!.length - 1;
              const isFailed =
                history.status === "DELIVERY_FAILED" ||
                history.status === "PICKUP_FAILED" ||
                history.status === "CANCELLED";
              const isSuccess = history.status === "DELIVERED";

              return {
                color: isFailed
                  ? "red"
                  : isSuccess
                    ? "green"
                    : isLatest
                      ? "blue"
                      : "gray",
                dot: isFailed ? (
                  <CloseCircleOutlined style={{ fontSize: 14 }} />
                ) : isSuccess ? (
                  <CheckCircleOutlined style={{ fontSize: 14 }} />
                ) : isLatest ? (
                  <ClockCircleOutlined style={{ fontSize: 14 }} />
                ) : undefined,
                label: (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(history.createdAt).toLocaleString()}
                  </Text>
                ),
                children: (
                  <Tag
                    color={getDeliveryStatusColor(history.status)}
                    style={{ marginBottom: 4 }}
                  >
                    {history.status.replace(/_/g, " ")}
                  </Tag>
                ),
              };
            })}
          />
        </div>
      )}
    </Card>
  );
};

export default PathaoDeliveryCard;
