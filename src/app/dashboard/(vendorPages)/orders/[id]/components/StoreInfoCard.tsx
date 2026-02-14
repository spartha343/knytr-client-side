"use client";

import { Card, Descriptions } from "antd";
import { ShopOutlined } from "@ant-design/icons";

interface StoreInfoCardProps {
  storeName: string;
  storeCity?: string | null;
}

const StoreInfoCard = ({ storeName, storeCity }: StoreInfoCardProps) => {
  return (
    <Card
      title={
        <span>
          <ShopOutlined /> Store Information
        </span>
      }
      style={{ marginBottom: 16 }}
    >
      <Descriptions column={2}>
        <Descriptions.Item label="Store Name">{storeName}</Descriptions.Item>
        {storeCity && (
          <Descriptions.Item label="City">{storeCity}</Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default StoreInfoCard;
