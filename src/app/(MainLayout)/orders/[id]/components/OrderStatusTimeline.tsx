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
  InboxOutlined,
  EnvironmentOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { OrderStatus, IOrderActivity } from "@/types/order";

interface StatusHistoryItem {
  id: string;
  status: string;
  createdAt: string;
}

interface PathaoDelivery {
  status: string;
  statusHistory?: StatusHistoryItem[];
}

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  activities?: IOrderActivity[];
  createdAt: string;
  pathaoDelivery?: PathaoDelivery | null;
}

// Human-friendly labels for our internal order statuses
const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Order Confirmed",
  PROCESSING: "Preparing Your Order",
  READY_FOR_PICKUP: "Ready for Courier Pickup",
  SHIPPED: "Handed to Courier",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

// Human-friendly labels for Pathao delivery statuses
const PATHAO_STATUS_LABELS: Record<string, string> = {
  Pending: "Delivery Booked",
  PICKUP_REQUESTED: "Pickup Requested",
  ASSIGNED_FOR_PICKUP: "Rider Assigned for Pickup",
  PICKED_UP: "Picked Up by Rider",
  AT_SORTING_HUB: "At Sorting Hub",
  IN_TRANSIT: "In Transit",
  RECEIVED_AT_LAST_MILE: "Arrived at Local Hub",
  ASSIGNED_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  PARTIAL_DELIVERY: "Partially Delivered",
  DELIVERY_FAILED: "Delivery Failed",
  ON_HOLD: "On Hold",
  RETURNED: "Returned to Sender",
  PICKUP_CANCELLED: "Pickup Cancelled",
  CANCELLED: "Cancelled",
  PAYMENT_INVOICE: "Payment Invoice",
  PAID_RETURN: "Paid Return",
};

// Icons for our internal statuses
const getOrderStatusIcon = (status: string) => {
  const icons: Record<string, React.ReactNode> = {
    PENDING: <ClockCircleOutlined />,
    CONFIRMED: <CheckCircleOutlined />,
    PROCESSING: <ShoppingOutlined />,
    READY_FOR_PICKUP: <InboxOutlined />,
    SHIPPED: <CarOutlined />,
    OUT_FOR_DELIVERY: <CarOutlined />,
    DELIVERED: <HomeOutlined />,
    CANCELLED: <CloseCircleOutlined />,
    RETURNED: <CloseCircleOutlined />,
  };
  return icons[status] || <ClockCircleOutlined />;
};

// Icons for Pathao statuses
const getPathaoStatusIcon = (status: string) => {
  const icons: Record<string, React.ReactNode> = {
    Pending: <SyncOutlined />,
    PICKUP_REQUESTED: <SyncOutlined />,
    ASSIGNED_FOR_PICKUP: <CarOutlined />,
    PICKED_UP: <CarOutlined />,
    AT_SORTING_HUB: <InboxOutlined />,
    IN_TRANSIT: <CarOutlined />,
    RECEIVED_AT_LAST_MILE: <EnvironmentOutlined />,
    ASSIGNED_FOR_DELIVERY: <CarOutlined />,
    DELIVERED: <HomeOutlined />,
    PARTIAL_DELIVERY: <WarningOutlined />,
    DELIVERY_FAILED: <CloseCircleOutlined />,
    ON_HOLD: <ClockCircleOutlined />,
    RETURNED: <CloseCircleOutlined />,
    PICKUP_CANCELLED: <CloseCircleOutlined />,
    CANCELLED: <CloseCircleOutlined />,
  };
  return icons[status] || <SyncOutlined />;
};

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getActivityTime = (
  status: OrderStatus,
  activities: IOrderActivity[] | undefined,
  createdAt: string,
): string | null => {
  if (status === OrderStatus.PENDING) return formatTime(createdAt);
  if (!activities || activities.length === 0) return null;
  const activity = activities.find(
    (a) => a.action.includes(status) || a.description?.includes(status),
  );
  return activity ? formatTime(activity.createdAt) : null;
};

const OrderStatusTimeline = ({
  currentStatus,
  activities,
  createdAt,
  pathaoDelivery,
}: OrderStatusTimelineProps) => {
  // Our internal order flow (vendor-managed stages)
  const vendorFlow: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.READY_FOR_PICKUP,
  ];

  const isTerminal =
    currentStatus === OrderStatus.CANCELLED ||
    currentStatus === OrderStatus.RETURNED;

  // Build vendor steps
  const vendorSteps = vendorFlow.map((status) => {
    const statusIndex = vendorFlow.indexOf(status);
    const currentIndex = vendorFlow.indexOf(
      currentStatus as (typeof vendorFlow)[number],
    );

    // If order is past READY_FOR_PICKUP (Pathao took over), all vendor steps are done
    const isPathaoPhase =
      !vendorFlow.includes(currentStatus as (typeof vendorFlow)[number]) &&
      !isTerminal;

    const isPast = isPathaoPhase || statusIndex < currentIndex;
    const isCurrent = !isPathaoPhase && statusIndex === currentIndex;

    return {
      title: ORDER_STATUS_LABELS[status],
      content: getActivityTime(status, activities, createdAt),
      status: isPast
        ? ("finish" as const)
        : isCurrent
          ? ("process" as const)
          : ("wait" as const),
      icon: getOrderStatusIcon(status),
    };
  });

  // Build Pathao delivery steps from statusHistory
  const pathaoSteps =
    pathaoDelivery?.statusHistory && pathaoDelivery.statusHistory.length > 0
      ? pathaoDelivery.statusHistory.map((entry, index) => {
          const isLast = index === pathaoDelivery.statusHistory!.length - 1;
          return {
            title: PATHAO_STATUS_LABELS[entry.status] || entry.status,
            content: formatTime(entry.createdAt),
            status:
              isLast &&
              entry.status !== "DELIVERED" &&
              entry.status !== "RETURNED"
                ? ("process" as const)
                : ("finish" as const),
            icon: getPathaoStatusIcon(entry.status),
          };
        })
      : pathaoDelivery
        ? [
            {
              title: "Delivery Booked",
              content: null,
              status: "process" as const,
              icon: <SyncOutlined spin />,
            },
          ]
        : [];

  // Handle cancelled orders
  if (currentStatus === OrderStatus.CANCELLED) {
    const cancelTime = getActivityTime(
      OrderStatus.CANCELLED,
      activities,
      createdAt,
    );
    return (
      <Card title="Order Status">
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <CloseCircleOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />
          <h3 style={{ marginTop: 16, color: "#ff4d4f" }}>Order Cancelled</h3>
          <p style={{ color: "#888" }}>
            {cancelTime || "This order has been cancelled"}
          </p>
        </div>
      </Card>
    );
  }

  // Handle returned orders
  if (currentStatus === OrderStatus.RETURNED) {
    return (
      <Card title="Order Status">
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <CloseCircleOutlined style={{ fontSize: 48, color: "#faad14" }} />
          <h3 style={{ marginTop: 16, color: "#faad14" }}>Order Returned</h3>
          <p style={{ color: "#888" }}>This order has been returned</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Order Progress">
      {/* Vendor-managed steps */}
      <Steps
        items={vendorSteps}
        orientation="vertical"
        style={{ marginBottom: pathaoDelivery ? 8 : 16 }}
      />

      {/* Pathao delivery steps — shown only after Pathao takes over */}
      {pathaoDelivery && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              margin: "4px 0 4px 0",
              paddingLeft: 4,
              borderLeft: "2px solid #91caff",
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            <CarOutlined style={{ color: "#1890ff", fontSize: 12 }} />
            <span style={{ fontSize: 12, color: "#1890ff", fontWeight: 500 }}>
              Courier is handling delivery from here
            </span>
          </div>
          <Steps
            items={pathaoSteps}
            orientation="vertical"
            style={{ marginBottom: 16 }}
          />
        </>
      )}

      {/* Helper text */}
      <div
        style={{
          marginTop: 8,
          padding: 12,
          background: "#f5f5f5",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <WarningOutlined style={{ color: "#1890ff" }} />
          <span style={{ fontSize: 12, color: "#666" }}>
            {pathaoDelivery
              ? "Your order is with the courier. Track the delivery status above."
              : currentStatus === OrderStatus.PENDING
                ? "Your order is waiting for vendor confirmation."
                : currentStatus === OrderStatus.CONFIRMED
                  ? "Your order has been confirmed and will be prepared soon."
                  : currentStatus === OrderStatus.PROCESSING
                    ? "Your order is being carefully prepared."
                    : currentStatus === OrderStatus.READY_FOR_PICKUP
                      ? "Your order is packed and waiting for courier pickup."
                      : null}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default OrderStatusTimeline;
