"use client";

import { Card, Steps } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  CarOutlined,
  HomeOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { OrderStatus, IOrderActivity } from "@/types/order";

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  activities?: IOrderActivity[];
  createdAt: string;
}

const OrderStatusTimeline = ({
  currentStatus,
  activities,
  createdAt,
}: OrderStatusTimelineProps) => {
  // Define the order flow
  const orderFlow: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.READY_FOR_PICKUP,
    OrderStatus.SHIPPED,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED,
  ];

  // Get current step index
  const getCurrentStep = (): number => {
    if (currentStatus === OrderStatus.CANCELLED) {
      return -1; // Special handling for cancelled
    }
    return orderFlow.indexOf(currentStatus);
  };

  const currentStep = getCurrentStep();

  // Get icon for each status
  const getIcon = (status: OrderStatus) => {
    const icons: Record<OrderStatus, React.ReactNode> = {
      [OrderStatus.PENDING]: <ClockCircleOutlined />,
      [OrderStatus.CONFIRMED]: <CheckCircleOutlined />,
      [OrderStatus.PROCESSING]: <ShoppingOutlined />,
      [OrderStatus.READY_FOR_PICKUP]: <ShoppingOutlined />,
      [OrderStatus.SHIPPED]: <CarOutlined />,
      [OrderStatus.OUT_FOR_DELIVERY]: <CarOutlined />,
      [OrderStatus.DELIVERED]: <HomeOutlined />,
      [OrderStatus.CANCELLED]: <CloseCircleOutlined />,
      [OrderStatus.RETURNED]: <CloseCircleOutlined />,
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  // Get activity timestamp for a status
  const getActivityTime = (status: OrderStatus): string | null => {
    if (!activities || activities.length === 0) return null;

    const activity = activities.find(
      (a) => a.action.includes(status) || a.description?.includes(status),
    );

    if (activity) {
      return new Date(activity.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // For PENDING, use order created time
    if (status === OrderStatus.PENDING) {
      return new Date(createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return null;
  };

  // Format status for display
  const formatStatus = (status: OrderStatus): string => {
    return status.replace(/_/g, " ");
  };

  // Handle cancelled orders
  if (currentStatus === OrderStatus.CANCELLED) {
    return (
      <Card title="Order Status">
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <CloseCircleOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />
          <h3 style={{ marginTop: 16, color: "#ff4d4f" }}>Order Cancelled</h3>
          <p style={{ color: "#888" }}>
            {getActivityTime(OrderStatus.CANCELLED) ||
              "This order has been cancelled"}
          </p>
        </div>
      </Card>
    );
  }

  // Build steps for timeline
  const steps = orderFlow.map((status, index) => {
    const isPast = index < currentStep;
    const isCurrent = index === currentStep;
    const time = getActivityTime(status);

    return {
      title: formatStatus(status),
      description: time,
      status: isPast
        ? ("finish" as const)
        : isCurrent
          ? ("process" as const)
          : ("wait" as const),
      icon: getIcon(status),
    };
  });

  return (
    <Card title="Order Progress">
      <Steps
        current={currentStep}
        items={steps}
        direction="vertical"
        style={{ marginTop: 16 }}
      />

      {/* Helper text */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "#f5f5f5",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <WarningOutlined style={{ color: "#1890ff" }} />
          <span style={{ fontSize: 12, color: "#666" }}>
            {currentStatus === OrderStatus.PENDING &&
              "Your order is waiting for vendor confirmation"}
            {currentStatus === OrderStatus.CONFIRMED &&
              "Your order has been confirmed and will be processed soon"}
            {currentStatus === OrderStatus.PROCESSING &&
              "Your order is being prepared for shipment"}
            {currentStatus === OrderStatus.READY_FOR_PICKUP &&
              "Your order is ready and will be shipped soon"}
            {currentStatus === OrderStatus.SHIPPED &&
              "Your order has been shipped and is on the way"}
            {currentStatus === OrderStatus.OUT_FOR_DELIVERY &&
              "Your order is out for delivery"}
            {currentStatus === OrderStatus.DELIVERED &&
              "Your order has been delivered successfully"}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default OrderStatusTimeline;
