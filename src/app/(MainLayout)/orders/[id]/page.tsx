"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, Alert, Space, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useGetOrderByIdQuery } from "@/redux/api/orderApi";
import { IOrder, OrderStatus } from "@/types/order";
import { useAuth } from "@/hooks/useAuth";
import OrderHeader from "./components/OrderHeader";
import OrderStatusTimeline from "./components/OrderStatusTimeline";
import DeliveryInfoCard from "./components/DeliveryInfoCard";
import OrderItemsList from "./components/OrderItemsList";
import PaymentSummaryCard from "./components/PaymentSummaryCard";
import StoreContactCard from "./components/StoreContactCard";
import CancelOrderModal from "./components/CancelOrderModal";

const CustomerOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const orderId = params.id as string;

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Fetch order data
  const {
    data: order,
    isLoading,
    error,
  } = useGetOrderByIdQuery(orderId, {
    skip: !orderId || !isAuthenticated,
  }) as { data: IOrder | undefined; isLoading: boolean; error: unknown };

  // Check if customer can cancel (only PENDING orders)
  const canCancelOrder = order?.status === OrderStatus.PENDING;

  // Auth loading
  if (authLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Checking authentication...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Alert
          message="Please Log In"
          description="You need to be logged in to view order details."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Loading order
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading order details...</p>
      </div>
    );
  }

  // Error loading order
  if (error || !order) {
    const err = error as { status?: number; data?: { message?: string } };
    return (
      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
        <Alert
          message="Error Loading Order"
          description={
            err?.data?.message ||
            "Failed to load order details. Please try again."
          }
          type="error"
          showIcon
        />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/orders")}
          style={{ marginTop: 16 }}
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Back Button */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push("/orders")}
        style={{ marginBottom: 24 }}
      >
        Back to Orders
      </Button>

      {/* Page Title and Order Number */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Order Details</h1>
        <p style={{ margin: "8px 0 0 0", color: "#888", fontSize: 14 }}>
          Order #{order.orderNumber}
        </p>
      </div>

      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {/* Components will be added here step by step */}

        <OrderHeader
          orderNumber={order.orderNumber}
          status={order.status}
          createdAt={order.createdAt}
          canCancel={canCancelOrder}
          onCancelClick={() => setIsCancelModalOpen(true)}
          onDownloadInvoice={() => {
            // We'll implement invoice download later
            window.open(`/api/orders/${order.id}/invoice`, "_blank");
          }}
        />

        <OrderStatusTimeline
          currentStatus={order.status}
          activities={order.activities}
          createdAt={order.createdAt}
          pathaoDelivery={order.pathaoDelivery}
        />

        <DeliveryInfoCard
          deliveryAddress={order.deliveryAddress}
          deliveryLocation={order.deliveryLocation}
          deliveryCharge={order.deliveryCharge}
          specialInstructions={order.specialInstructions}
          recipientCityId={order.recipientCityId}
          recipientZoneId={order.recipientZoneId}
          recipientAreaId={order.recipientAreaId}
        />

        <OrderItemsList items={order.items} />

        <PaymentSummaryCard
          subtotal={order.subtotal}
          totalDiscount={order.totalDiscount}
          deliveryCharge={order.deliveryCharge}
          totalAmount={order.totalAmount}
          paymentMethod={order.paymentMethod}
        />

        {order.store && (
          <StoreContactCard
            storeName={order.store.name}
            storeLogo={order.store.logo}
            contactPhone={order.store.contactPhone}
            whatsappNumber={order.store.whatsappNumber}
          />
        )}

        <CancelOrderModal
          isOpen={isCancelModalOpen}
          orderId={order.id}
          orderNumber={order.orderNumber}
          onClose={() => setIsCancelModalOpen(false)}
        />
      </Space>
    </div>
  );
};

export default CustomerOrderDetailPage;
