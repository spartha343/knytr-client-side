"use client";

import { Card, Descriptions, Tag, Alert } from "antd";
import { RocketOutlined, CheckCircleOutlined } from "@ant-design/icons";

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
    PICKED_UP: "geekblue",
    IN_TRANSIT: "purple",
    DELIVERED: "green",
    CANCELLED: "red",
    FAILED: "red",
  };
  return colors[status] || "default";
};

const PathaoDeliveryCard = ({ delivery }: PathaoDeliveryCardProps) => {
  const isDelivered = delivery.status === "DELIVERED";

  return (
    <Card
      title={
        <span>
          <RocketOutlined /> Pathao Delivery Information
        </span>
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
