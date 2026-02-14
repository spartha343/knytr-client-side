"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, Alert, Space } from "antd";
import { useGetOrderByIdQuery } from "@/redux/api/orderApi";
import { IOrder } from "@/types/order";
import OrderHeader from "./components/OrderHeader";
import CustomerInfoCard from "./components/CustomerInfoCard";
import StoreInfoCard from "./components/StoreInfoCard";
import DeliveryInfoCard from "./components/DeliveryInfoCard";
import OrderItemsTable from "./components/OrderItemsTable";
import PaymentSummaryCard from "./components/PaymentSummaryCard";
import UpdateStatusModal from "./components/UpdateStatusModal";

const VendorOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // State for status update modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch order data (transformResponse already extracts response.data)
  const {
    data: order,
    isLoading,
    error,
  } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  }) as { data: IOrder | undefined; isLoading: boolean; error: unknown };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <Alert
        title="Error"
        description="Failed to load order details. Please try again."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      {/* Header with order number, status, and action buttons */}
      <OrderHeader
        orderNumber={order.orderNumber}
        status={order.status}
        createdAt={order.createdAt}
        isVoiceConfirmed={order.isVoiceConfirmed}
        onUpdateStatus={() => setIsModalOpen(true)}
        onBack={() => router.back()}
      />

      {/* Main content - Cards in a responsive layout */}
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {/* Customer Information */}
        <CustomerInfoCard
          customerName={order.customerName || order.customerPhone}
          customerPhone={order.customerPhone}
          customerEmail={order.customerEmail}
        />

        {/* Store Information */}
        {order.store && (
          <StoreInfoCard storeName={order.store.name} storeCity={null} />
        )}

        {/* Delivery/Pickup Information */}
        <DeliveryInfoCard
          deliveryType={order.deliveryLocation}
          deliveryDistrict={order.deliveryDistrict}
          policeStation={order.policeStation}
          deliveryArea={order.deliveryArea}
          deliveryAddress={order.deliveryAddress}
          deliveryInstructions={null}
          storeName={order.store?.name}
          branchName={null}
          branchCity={null}
        />

        {/* Order Items Table */}
        <OrderItemsTable
          items={order.items}
          orderId={order.id}
          storeId={order.storeId}
        />

        {/* Payment Summary */}
        <PaymentSummaryCard
          itemsSubtotal={order.subtotal}
          totalDiscount={order.totalDiscount}
          deliveryCharge={order.deliveryCharge}
          totalAmount={order.totalAmount}
          paymentMethod={order.paymentMethod}
          editNotes={order.editNotes}
        />
      </Space>

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={isModalOpen}
        currentStatus={order.status}
        orderId={order.id}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default VendorOrderDetailPage;
