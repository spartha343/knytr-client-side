"use client";

import { useState } from "react";
import { Modal, Select, Form, Input, Button, Space, Tag, message } from "antd";
import { useUpdateOrderStatusMutation } from "@/redux/api/orderApi";
import { OrderStatus } from "@/types/order";

interface UpdateStatusModalProps {
  isOpen: boolean;
  currentStatus: OrderStatus;
  orderId: string;
  onClose: () => void;
}

// Status color mapping
const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    PLACED: "blue",
    VOICE_CONFIRMED: "cyan",
    VENDOR_CONFIRMED: "purple",
    PROCESSING: "orange",
    READY_TO_SHIP: "gold",
    SHIPPED: "geekblue",
    DELIVERED: "green",
    CANCELLED: "red",
    RETURNED: "volcano",
  };
  return colors[status] || "default";
};

const UpdateStatusModal = ({
  isOpen,
  currentStatus,
  orderId,
  onClose,
}: UpdateStatusModalProps) => {
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [statusNotes, setStatusNotes] = useState("");

  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

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
          editNotes: statusNotes || undefined,
        },
      }).unwrap();

      message.success("Order status updated successfully!");
      handleClose();
    } catch (error: unknown) {
      console.error("Failed to update status:", error);
      message.error("Failed to update order status. Please try again.");
    }
  };

  // Handle modal close
  const handleClose = () => {
    setNewStatus(null);
    setStatusNotes("");
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
            {currentStatus.replace(/_/g, " ")}
          </Tag>
        </Form.Item>

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
            <Select.Option value="PLACED">Placed</Select.Option>
            <Select.Option value="VOICE_CONFIRMED">
              Voice Confirmed
            </Select.Option>
            <Select.Option value="VENDOR_CONFIRMED">
              Vendor Confirmed
            </Select.Option>
            <Select.Option value="PROCESSING">Processing</Select.Option>
            <Select.Option value="READY_TO_SHIP">Ready to Ship</Select.Option>
            <Select.Option value="SHIPPED">Shipped</Select.Option>
            <Select.Option value="DELIVERED">Delivered</Select.Option>
            <Select.Option value="CANCELLED">Cancelled</Select.Option>
            <Select.Option value="RETURNED">Returned</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Notes (Optional)">
          <Input.TextArea
            rows={3}
            placeholder="Add any notes about this status change..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleStatusUpdate}
              loading={isUpdating}
              disabled={!newStatus}
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
