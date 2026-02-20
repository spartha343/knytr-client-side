"use client";

import { Card, Descriptions, Table, Typography, Tag } from "antd";
import { DeliveryLocation, PaymentMethod } from "@/types/order";
import { OrderItem } from "./ProductSelectionStep";

const { Text, Title } = Typography;

interface ReviewStepProps {
  storeName: string;
  customerPhone: string;
  customerName: string;
  customerEmail: string;
  secondaryPhone: string;
  items: OrderItem[];
  deliveryType: DeliveryLocation;
  cityName: string;
  zoneName: string;
  areaName: string;
  deliveryAddress: string;
  deliveryCharge: number;
  specialInstructions: string;
  paymentMethod: PaymentMethod;
}

const ReviewStep = ({
  storeName,
  customerPhone,
  customerName,
  customerEmail,
  secondaryPhone,
  items,
  deliveryType,
  cityName,
  zoneName,
  areaName,
  deliveryAddress,
  deliveryCharge,
  specialInstructions,
  paymentMethod,
}: ReviewStepProps) => {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = itemsSubtotal + deliveryCharge;

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_: unknown, record: OrderItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.productName}</div>
          {record.variantSku && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              SKU: {record.variantSku}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      width: 100,
      render: (_: unknown, record: OrderItem) =>
        `৳${Number(record.price).toFixed(2)}`,
    },
    {
      title: "Qty",
      key: "quantity",
      width: 60,
      render: (_: unknown, record: OrderItem) => record.quantity,
    },
    {
      title: "Subtotal",
      key: "subtotal",
      width: 120,
      render: (_: unknown, record: OrderItem) => (
        <Text strong>৳{Number(record.subtotal).toFixed(2)}</Text>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Title level={4}>Review Order Details</Title>
      <Text type="secondary">
        Please review all information before creating the order.
      </Text>

      {/* Store Information */}
      <Card title="Store" size="small" style={{ marginTop: 24 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Store Name">{storeName}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Customer Information */}
      <Card title="Customer Information" size="small" style={{ marginTop: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Phone">{customerPhone}</Descriptions.Item>
          <Descriptions.Item label="Secondary Phone">
            {secondaryPhone || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Name">
            {customerName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {customerEmail || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Order Items */}
      <Card
        title={`Order Items (${items.length})`}
        size="small"
        style={{ marginTop: 16 }}
      >
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 500 }}
        />
      </Card>

      {/* Delivery Information */}
      <Card title="Delivery Information" size="small" style={{ marginTop: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Delivery Type">
            <Tag
              color={
                deliveryType === DeliveryLocation.INSIDE_DHAKA
                  ? "blue"
                  : "green"
              }
            >
              {deliveryType === DeliveryLocation.INSIDE_DHAKA
                ? "Inside Dhaka"
                : "Outside Dhaka"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="City">{cityName || "-"}</Descriptions.Item>
          <Descriptions.Item label="Zone">{zoneName || "-"}</Descriptions.Item>
          <Descriptions.Item label="Area">{areaName || "-"}</Descriptions.Item>
          <Descriptions.Item label="Delivery Address">
            {deliveryAddress || "-"}
          </Descriptions.Item>
          {specialInstructions && (
            <Descriptions.Item label="Special Instructions">
              {specialInstructions}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Payment Summary */}
      <Card title="Payment Summary" size="small" style={{ marginTop: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Items Subtotal">
            ৳{itemsSubtotal.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="Delivery Charge">
            ৳{deliveryCharge.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Method">
            <Tag color="purple">{paymentMethod}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Amount">
            <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
              ৳{totalAmount.toFixed(2)}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ReviewStep;
