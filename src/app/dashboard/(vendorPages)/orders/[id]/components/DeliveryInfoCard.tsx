"use client";

import { Card, Descriptions, Tag } from "antd";
import { HomeOutlined, ShopOutlined } from "@ant-design/icons";
import { DeliveryLocation } from "@/types/order";

interface DeliveryInfoCardProps {
  deliveryType: DeliveryLocation;
  deliveryDistrict?: string | null;
  policeStation?: string | null;
  deliveryArea?: string | null;
  deliveryAddress?: string | null;
  deliveryInstructions?: string | null;
  storeName?: string | null;
  branchName?: string | null;
  branchCity?: string | null;
}

const DeliveryInfoCard = ({
  deliveryType,
  deliveryDistrict,
  policeStation,
  deliveryArea,
  deliveryAddress,
  deliveryInstructions,
  storeName,
  branchName,
  branchCity,
}: DeliveryInfoCardProps) => {
  const isHomeDelivery =
    deliveryType === "INSIDE_DHAKA" || deliveryType === "OUTSIDE_DHAKA";

  return (
    <Card
      title={
        <span>
          {isHomeDelivery ? <HomeOutlined /> : <ShopOutlined />}{" "}
          {isHomeDelivery ? "Delivery Information" : "Pickup Information"}
        </span>
      }
      style={{ marginBottom: 16 }}
    >
      <Descriptions column={1}>
        <Descriptions.Item label="Delivery Type">
          <Tag color={isHomeDelivery ? "blue" : "green"}>
            {deliveryType.replace(/_/g, " ")}
          </Tag>
        </Descriptions.Item>

        {isHomeDelivery ? (
          <>
            {deliveryDistrict && (
              <Descriptions.Item label="District">
                {deliveryDistrict}
              </Descriptions.Item>
            )}

            {policeStation && (
              <Descriptions.Item label="Police Station">
                {policeStation}
              </Descriptions.Item>
            )}

            {deliveryArea && (
              <Descriptions.Item label="Area">{deliveryArea}</Descriptions.Item>
            )}

            {deliveryAddress && (
              <Descriptions.Item label="Full Address">
                {deliveryAddress}
              </Descriptions.Item>
            )}

            {deliveryInstructions && (
              <Descriptions.Item label="Delivery Instructions">
                {deliveryInstructions}
              </Descriptions.Item>
            )}
          </>
        ) : (
          <>
            {storeName && (
              <Descriptions.Item label="Store">{storeName}</Descriptions.Item>
            )}

            {branchName && (
              <Descriptions.Item label="Branch">{branchName}</Descriptions.Item>
            )}

            {branchCity && (
              <Descriptions.Item label="City">{branchCity}</Descriptions.Item>
            )}
          </>
        )}
      </Descriptions>
    </Card>
  );
};

export default DeliveryInfoCard;
