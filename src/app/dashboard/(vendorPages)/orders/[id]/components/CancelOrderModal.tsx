"use client";

import { useState } from "react";
import { Modal, Select, Form, Button, Space, Input, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useCancelOrderMutation } from "@/redux/api/orderApi";

const { TextArea } = Input;

interface CancelOrderModalProps {
  isOpen: boolean;
  orderId: string;
  orderNumber: string;
  onClose: () => void;
}

// Predefined cancellation reasons
const CANCELLATION_REASONS = [
  "Customer requested cancellation",
  "Out of stock",
  "Customer unreachable",
  "Incorrect order details",
  "Payment issues",
  "Duplicate order",
  "Other",
];

const CancelOrderModal = ({
  isOpen,
  orderId,
  orderNumber,
  onClose,
}: CancelOrderModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState<string>("");

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  // Handle order cancellation
  const handleCancelOrder = async () => {
    const reason = selectedReason === "Other" ? customReason : selectedReason;

    try {
      await cancelOrder({
        id: orderId,
        data: {
          reason: reason || undefined,
        },
      }).unwrap();

      message.success("Order cancelled successfully!");
      handleClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to cancel order. Please try again.";
      message.error(errorMessage);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedReason(null);
    setCustomReason("");
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          <span>Cancel Order</span>
        </Space>
      }
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={500}
    >
      <Form layout="vertical">
        <Form.Item>
          <div
            style={{
              padding: "12px",
              background: "#fff2e8",
              border: "1px solid lightblue",
              borderRadius: "4px",
              marginBottom: "16px",
            }}
          >
            <p style={{ margin: 0, color: "#d46b08" }}>
              ⚠️ Are you sure you want to cancel order{" "}
              <strong>{orderNumber}</strong>? This action will release the
              reserved inventory.
            </p>
          </div>
        </Form.Item>

        <Form.Item label="Cancellation Reason (Optional)">
          <Select
            placeholder="Select a reason"
            value={selectedReason}
            onChange={(value) => setSelectedReason(value)}
            size="large"
            allowClear
          >
            {CANCELLATION_REASONS.map((reason) => (
              <Select.Option key={reason} value={reason}>
                {reason}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {selectedReason === "Other" && (
          <Form.Item label="Please specify">
            <TextArea
              placeholder="Enter cancellation reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleClose}>Keep Order</Button>
            <Button
              danger
              type="primary"
              onClick={handleCancelOrder}
              loading={isCancelling}
            >
              Cancel Order
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CancelOrderModal;
