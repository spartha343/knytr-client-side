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
  items: OrderItem[];
  deliveryType: DeliveryLocation;
  deliveryDistrict: string;
  policeStation: string;
  deliveryArea: string;
  deliveryAddress: string;
  deliveryCharge: number;
  paymentMethod: PaymentMethod;
}

const ReviewStep = ({
  storeName,
  customerPhone,
  customerName,
  customerEmail,
  items,
  deliveryType,
  deliveryDistrict,
  policeStation,
  deliveryArea,
  deliveryAddress,
  deliveryCharge,
  paymentMethod,
}: ReviewStepProps) => {
  // Calculate totals
  const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalAmount = itemsSubtotal + deliveryCharge;

  // Table columns for items
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
          <Descriptions.Item label="Name">
            {customerName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={2}>
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
            <Tag color={deliveryType === "INSIDE_DHAKA" ? "blue" : "green"}>
              {deliveryType === "INSIDE_DHAKA"
                ? "Inside Dhaka"
                : "Outside Dhaka"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="District">
            {deliveryDistrict}
          </Descriptions.Item>
          <Descriptions.Item label="Police Station">
            {policeStation}
          </Descriptions.Item>
          <Descriptions.Item label="Area">{deliveryArea}</Descriptions.Item>
          <Descriptions.Item label="Full Address">
            {deliveryAddress}
          </Descriptions.Item>
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
