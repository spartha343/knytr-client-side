"use client";

import { Card, Descriptions, Typography } from "antd";

const { Text } = Typography;

interface PaymentSummaryCardProps {
  itemsSubtotal: number;
  totalDiscount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod?: string | null;
  editNotes?: string | null;
}

const PaymentSummaryCard = ({
  itemsSubtotal,
  totalDiscount,
  deliveryCharge,
  totalAmount,
  paymentMethod,
  editNotes,
}: PaymentSummaryCardProps) => {
  return (
    <Card title="Payment Summary" style={{ marginBottom: 16 }}>
      <Descriptions column={1}>
        <Descriptions.Item label="Items Subtotal">
          ৳{Number(itemsSubtotal).toFixed(2)}
        </Descriptions.Item>

        <Descriptions.Item label="Total Discount">
          <Text type="success">-৳{Number(totalDiscount).toFixed(2)}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Delivery Charge">
          ৳{Number(deliveryCharge).toFixed(2)}
        </Descriptions.Item>

        <Descriptions.Item label="Total Amount">
          <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
            ৳{Number(totalAmount).toFixed(2)}
          </Text>
        </Descriptions.Item>

        {paymentMethod && (
          <Descriptions.Item label="Payment Method">
            {paymentMethod}
          </Descriptions.Item>
        )}

        {editNotes && (
          <Descriptions.Item label="Edit Notes">
            <Text type="secondary">{editNotes}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
};

export default PaymentSummaryCard;
