"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin, Alert, Space } from "antd";
import { useGetOrderByIdQuery } from "@/redux/api/orderApi";
import { IOrder, OrderStatus } from "@/types/order";
import OrderHeader from "./components/OrderHeader";
import CustomerInfoCard from "./components/CustomerInfoCard";
import StoreInfoCard from "./components/StoreInfoCard";
import DeliveryInfoCard from "./components/DeliveryInfoCard";
import OrderItemsTable from "./components/OrderItemsTable";
import PaymentSummaryCard from "./components/PaymentSummaryCard";
import UpdateStatusModal from "./components/UpdateStatusModal";
import BookPathaoDeliveryModal from "./components/BookPathaoDeliveryModal";
import PathaoDeliveryCard from "./components/PathaoDeliveryCard";
import EditOrderModal from "./components/EditOrderModal";
import CancelOrderModal from "./components/CancelOrderModal";

const VendorOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [isPathaoModalOpen, setIsPathaoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
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

  // Check if order can be cancelled
  const canCancelOrder = (status: OrderStatus): boolean => {
    const cancellableStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.READY_FOR_PICKUP,
    ];
    return cancellableStatuses.includes(status);
  };

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

  const hasPathaoDelivery = !!order.pathaoDelivery;
  const orderCanBeCancelled = canCancelOrder(order.status);

  return (
    <div>
      <OrderHeader
        orderId={orderId}
        orderNumber={order.orderNumber}
        status={order.status}
        createdAt={order.createdAt}
        hasPathaoDelivery={hasPathaoDelivery}
        onUpdateStatus={() => setIsModalOpen(true)}
        onEditOrder={
          order.status === OrderStatus.PENDING
            ? () => setIsEditModalOpen(true)
            : undefined
        }
        onCancelOrder={
          orderCanBeCancelled ? () => setIsCancelModalOpen(true) : undefined
        }
        onBookPathaoDelivery={
          order.status === OrderStatus.READY_FOR_PICKUP && !hasPathaoDelivery
            ? () => setIsPathaoModalOpen(true)
            : undefined
        }
        onBack={() => router.back()}
      />

      {/* Main content - Cards in a responsive layout */}
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {/* Customer Information */}
        <CustomerInfoCard
          customerName={order.customerName || order.customerPhone}
          customerPhone={order.customerPhone}
          customerEmail={order.customerEmail}
          secondaryPhone={order.secondaryPhone}
        />

        {/* Store Information */}
        {order.store && (
          <StoreInfoCard storeName={order.store.name} storeCity={null} />
        )}

        {/* Delivery/Pickup Information */}
        <DeliveryInfoCard
          deliveryType={order.deliveryLocation}
          deliveryAddress={order.deliveryAddress}
          deliveryInstructions={order.specialInstructions}
          storeName={order.store?.name}
          branchName={null}
          branchCity={null}
        />

        {/* Pathao Delivery Information (if exists) */}
        {order.pathaoDelivery && (
          <PathaoDeliveryCard
            delivery={order.pathaoDelivery}
            orderId={order.id}
          />
        )}

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
        />
      </Space>

      {/* Update Status Modal */}
      <UpdateStatusModal
        isOpen={isModalOpen}
        currentStatus={order.status}
        orderId={order.id}
        hasPathaoDelivery={hasPathaoDelivery}
        order={order}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderId={order.id}
        orderNumber={order.orderNumber}
        onClose={() => setIsCancelModalOpen(false)}
      />

      {isPathaoModalOpen && (
        <BookPathaoDeliveryModal
          isOpen={isPathaoModalOpen}
          orderId={order.id}
          orderNumber={order.orderNumber}
          currentCityId={order.recipientCityId}
          currentZoneId={order.recipientZoneId}
          currentAreaId={order.recipientAreaId}
          onClose={() => setIsPathaoModalOpen(false)}
          onSuccess={() => setIsPathaoModalOpen(false)}
        />
      )}

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={isEditModalOpen}
        order={order}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default VendorOrderDetailPage;
