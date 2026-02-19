"use client";

import { useState } from "react";
import { Modal, Input, message, Alert } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useCancelOrderMutation } from "@/redux/api/orderApi";

interface CancelOrderModalProps {
  isOpen: boolean;
  orderId: string;
  orderNumber: string;
  onClose: () => void;
}

const { TextArea } = Input;

const CancelOrderModal = ({
  isOpen,
  orderId,
  orderNumber,
  onClose,
}: CancelOrderModalProps) => {
  const [reason, setReason] = useState("");
  const [cancelOrder, { isLoading }] = useCancelOrderMutation();

  const handleCancel = async () => {
    try {
      await cancelOrder({
        id: orderId,
        data: {
          reason: reason.trim() || undefined,
        },
      }).unwrap();

      message.success("Order cancelled successfully");

      // Close modal
      onClose();

      // Refresh page to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      const err = error as { data?: { message?: string } };
      message.error(
        err?.data?.message || "Failed to cancel order. Please try again.",
      );
    }
  };

  const handleModalClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined
            style={{ color: "#faad14", marginRight: 8 }}
          />
          Cancel Order
        </span>
      }
      open={isOpen}
      onOk={handleCancel}
      onCancel={handleModalClose}
      okText="Yes, Cancel Order"
      cancelText="No, Keep Order"
      okButtonProps={{
        danger: true,
        loading: isLoading,
      }}
      width={500}
    >
      <div style={{ marginTop: 16 }}>
        {/* Warning Alert */}
        <Alert
          message="Are you sure?"
          description={`You are about to cancel order #${orderNumber}. This action cannot be undone.`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Cancellation Reason */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            Reason for cancellation (optional)
          </label>
          <TextArea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Changed my mind, Found a better deal, Ordered by mistake..."
            rows={4}
            maxLength={500}
            showCount
            disabled={isLoading}
          />
        </div>

        {/* Note */}
        <div
          style={{
            marginTop: 16,
            padding: "8px 12px",
            background: "#f5f5f5",
            borderRadius: 4,
            fontSize: 12,
            color: "#666",
          }}
        >
          <strong>Note:</strong> Once cancelled, you cannot reactivate this
          order. You will need to place a new order if you change your mind.
        </div>
      </div>
    </Modal>
  );
};

export default CancelOrderModal;
