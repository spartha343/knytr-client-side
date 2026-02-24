"use client";

import { Card, Descriptions, Tag } from "antd";
import { EnvironmentOutlined, DollarOutlined } from "@ant-design/icons";
import { DeliveryLocation } from "@/types/order";

interface DeliveryInfoCardProps {
  deliveryAddress?: string | null;
  deliveryLocation: DeliveryLocation;
  deliveryCharge: number;
  specialInstructions?: string | null;
  recipientCityId?: number | null;
  recipientZoneId?: number | null;
  recipientAreaId?: number | null;
}

const DeliveryInfoCard = ({
  deliveryAddress,
  deliveryLocation,
  deliveryCharge,
  specialInstructions,
}: DeliveryInfoCardProps) => {
  const getLocationTag = (location: DeliveryLocation) => {
    if (location === DeliveryLocation.INSIDE_DHAKA) {
      return <Tag color="blue">Inside Dhaka</Tag>;
    }
    return <Tag color="orange">Outside Dhaka</Tag>;
  };

  return (
    <Card
      title={
        <span>
          <EnvironmentOutlined style={{ marginRight: 8 }} />
          Delivery Information
        </span>
      }
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Delivery Location">
          {getLocationTag(deliveryLocation)}
        </Descriptions.Item>

        {deliveryAddress && (
          <Descriptions.Item label="Delivery Address">
            {deliveryAddress}
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Delivery Charge">
          <span style={{ fontWeight: "bold", color: "#1890ff" }}>
            <DollarOutlined /> ৳{Number(deliveryCharge).toLocaleString()}
          </span>
        </Descriptions.Item>

        {specialInstructions && (
          <Descriptions.Item label="Special Instructions">
            <div
              style={{
                padding: "8px 12px",
                background: "#fff7e6",
                borderLeft: "3px solid #faad14",
                borderRadius: 4,
              }}
            >
              {specialInstructions}
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default DeliveryInfoCard;
