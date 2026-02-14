"use client";

import { Card, Descriptions } from "antd";
import { PhoneOutlined, MailOutlined } from "@ant-design/icons";

interface CustomerInfoCardProps {
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
}

const CustomerInfoCard = ({
  customerName,
  customerPhone,
  customerEmail,
}: CustomerInfoCardProps) => {
  return (
    <Card title="Customer Information" style={{ marginBottom: 16 }}>
      <Descriptions column={2}>
        <Descriptions.Item label="Name">
          {customerName || "-"}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span>
              <PhoneOutlined /> Phone
            </span>
          }
        >
          {customerPhone || "-"}
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span>
              <MailOutlined /> Email
            </span>
          }
          span={2}
        >
          {customerEmail || "-"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CustomerInfoCard;
