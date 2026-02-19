"use client";

import { useState } from "react";
import { Modal, Select, Form, Button, Space, Tag, message } from "antd";
import { useUpdateOrderStatusMutation } from "@/redux/api/orderApi";
import { OrderStatus } from "@/types/order";

interface UpdateStatusModalProps {
  isOpen: boolean;
  currentStatus: OrderStatus;
  orderId: string;
  hasPathaoDelivery?: boolean;
  onClose: () => void;
}

// Status color mapping
const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    PENDING: "blue",
    CONFIRMED: "purple",
    PROCESSING: "orange",
    READY_FOR_PICKUP: "gold",
    SHIPPED: "geekblue",
    OUT_FOR_DELIVERY: "cyan",
    DELIVERED: "green",
    CANCELLED: "red",
    RETURNED: "volcano",
  };
  return colors[status] || "default";
};

// Valid status transitions (matches backend)
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED],
  CONFIRMED: [OrderStatus.PROCESSING],
  PROCESSING: [OrderStatus.READY_FOR_PICKUP],
  READY_FOR_PICKUP: [OrderStatus.SHIPPED],
  SHIPPED: [
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
    OrderStatus.RETURNED,
  ],
  OUT_FOR_DELIVERY: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
  DELIVERED: [OrderStatus.RETURNED],
  CANCELLED: [],
  RETURNED: [],
};

// Status labels
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  READY_FOR_PICKUP: "Ready for Pickup",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

const UpdateStatusModal = ({
  isOpen,
  currentStatus,
  orderId,
  hasPathaoDelivery = false,
  onClose,
}: UpdateStatusModalProps) => {
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  // Get valid transitions for current status
  const validTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!newStatus) {
      message.error("Please select a status");
      return;
    }

    try {
      await updateOrderStatus({
        id: orderId,
        data: {
          status: newStatus,
        },
      }).unwrap();

      message.success("Order status updated successfully!");
      handleClose();
    } catch (error: unknown) {
      console.log(error);
      console.error("Failed to update status:", error);
      message.error("Failed to update order status. Please try again.");
    }
  };

  // Handle modal close
  const handleClose = () => {
    setNewStatus(null);
    onClose();
  };

  return (
    <Modal
      title="Update Order Status"
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={500}
    >
      <Form layout="vertical">
        <Form.Item label="Current Status">
          <Tag
            color={getStatusColor(currentStatus)}
            style={{ fontSize: 14, padding: "4px 12px" }}
          >
            {STATUS_LABELS[currentStatus]}
          </Tag>
        </Form.Item>

        {validTransitions.length === 0 ? (
          <Form.Item>
            <div
              style={{
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: 0, color: "#666" }}>
                No status transitions available from{" "}
                {STATUS_LABELS[currentStatus]}.
                {currentStatus === OrderStatus.CANCELLED &&
                  " Order is cancelled."}
                {currentStatus === OrderStatus.RETURNED &&
                  " Order is returned."}
                {currentStatus === OrderStatus.DELIVERED &&
                  " Order is delivered. Can only be returned."}
              </p>
            </div>
          </Form.Item>
        ) : (
          <Form.Item
            label="New Status"
            required
            help={!newStatus ? "Please select a new status" : ""}
            validateStatus={!newStatus ? "error" : ""}
          >
            <Select
              placeholder="Select new status"
              value={newStatus}
              onChange={(value) => setNewStatus(value)}
              size="large"
            >
              {validTransitions.map((status) => (
                <Select.Option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {hasPathaoDelivery &&
          currentStatus === OrderStatus.READY_FOR_PICKUP && (
            <Form.Item>
              <div
                style={{
                  padding: "8px 12px",
                  background: "#e6f7ff",
                  border: "1px solid #91d5ff",
                  borderRadius: "4px",
                }}
              >
                <p style={{ margin: 0, fontSize: "12px", color: "#0050b3" }}>
                  ℹ️ This order has Pathao delivery. Mark as
                  &rsquo;Shipped&rsquo; after handing over to Pathao.
                </p>
              </div>
            </Form.Item>
          )}

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleStatusUpdate}
              loading={isUpdating}
              disabled={!newStatus || validTransitions.length === 0}
            >
              Update Status
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateStatusModal;
