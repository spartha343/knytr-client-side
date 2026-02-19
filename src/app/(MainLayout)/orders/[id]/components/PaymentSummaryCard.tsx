"use client";

import { Card, Divider } from "antd";
import { DollarOutlined, CreditCardOutlined } from "@ant-design/icons";
import { PaymentMethod } from "@/types/order";

interface PaymentSummaryCardProps {
  subtotal: number;
  totalDiscount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
}

const PaymentSummaryCard = ({
  subtotal,
  totalDiscount,
  deliveryCharge,
  totalAmount,
  paymentMethod,
}: PaymentSummaryCardProps) => {
  const formatPaymentMethod = (method: PaymentMethod): string => {
    const methods: Record<PaymentMethod, string> = {
      COD: "Cash on Delivery",
      BKASH: "bKash",
      NAGAD: "Nagad",
      ROCKET: "Rocket",
    };
    return methods[method] || method;
  };

  return (
    <Card
      title={
        <span>
          <DollarOutlined style={{ marginRight: 8 }} />
          Payment Summary
        </span>
      }
    >
      <div style={{ maxWidth: 400 }}>
        {/* Subtotal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            fontSize: 14,
          }}
        >
          <span>Items Subtotal:</span>
          <span style={{ fontWeight: 500 }}>
            ৳{Number(subtotal).toLocaleString()}
          </span>
        </div>

        {/* Discount */}
        {Number(totalDiscount) > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            <span style={{ color: "#52c41a" }}>Discount:</span>
            <span style={{ fontWeight: 500, color: "#52c41a" }}>
              -৳{Number(totalDiscount).toLocaleString()}
            </span>
          </div>
        )}

        {/* Delivery Charge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            fontSize: 14,
          }}
        >
          <span>Delivery Charge:</span>
          <span style={{ fontWeight: 500 }}>
            ৳{Number(deliveryCharge).toLocaleString()}
          </span>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {/* Total Amount */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: "bold" }}>
            Total Amount:
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1890ff",
            }}
          >
            ৳{Number(totalAmount).toLocaleString()}
          </span>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {/* Payment Method */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px",
            background: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <CreditCardOutlined style={{ fontSize: 18, color: "#1890ff" }} />
          <div>
            <div style={{ fontSize: 12, color: "#888" }}>Payment Method</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {formatPaymentMethod(paymentMethod)}
            </div>
          </div>
        </div>

        {/* Savings Info */}
        {Number(totalDiscount) > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: "8px 12px",
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <span style={{ color: "#52c41a", fontSize: 12, fontWeight: 500 }}>
              🎉 You saved ৳{Number(totalDiscount).toLocaleString()} on this
              order!
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentSummaryCard;
