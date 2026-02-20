"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Steps, Button, Space, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import ActionBar from "@/components/ui/ActionBar";
import { useGetMyStoresQuery } from "@/redux/api/storeApi";
import { useCreateManualOrderMutation } from "@/redux/api/orderApi";
import { DeliveryLocation, PaymentMethod } from "@/types/order";
import { IStore } from "@/types/store";
import StoreSelectionStep from "./components/StoreSelectionStep";
import CustomerInfoStep from "./components/CustomerInfoStep";
import ProductSelectionStep from "./components/ProductSelectionStep";
import DeliveryInfoStep from "./components/DeliveryInfoStep";
import ReviewStep from "./components/ReviewStep";
import { OrderItem } from "./components/ProductSelectionStep";

const CreateManualOrderPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Store
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Step 2: Customer
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Step 3: Products
  const [items, setItems] = useState<OrderItem[]>([]);

  // Step 4: Delivery
  const [deliveryType, setDeliveryType] = useState<DeliveryLocation>(
    DeliveryLocation.INSIDE_DHAKA,
  );
  const [cityId, setCityId] = useState<number | null>(null);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [cityName, setCityName] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [areaName, setAreaName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState<number>(70);
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Step 5: Payment
  const [paymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);

  // Fetch stores
  const { data: storesResponse } = useGetMyStoresQuery({});
  const stores = (storesResponse?.stores as IStore[]) || [];
  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  // Create order mutation
  const [createOrder, { isLoading: isCreating }] =
    useCreateManualOrderMutation();

  const steps = [
    { title: "Store", content: "Select store" },
    { title: "Customer", content: "Customer info" },
    { title: "Products", content: "Add products" },
    { title: "Delivery", content: "Delivery details" },
    { title: "Review", content: "Review & submit" },
  ];

  // Handlers for city/zone/area — store both ID and name
  const handleCityChange = (id: number | null, name: string) => {
    setCityId(id);
    setCityName(name);
    // Reset downstream
    setZoneId(null);
    setZoneName("");
    setAreaId(null);
    setAreaName("");
  };

  const handleZoneChange = (id: number | null, name: string) => {
    setZoneId(id);
    setZoneName(name);
    // Reset downstream
    setAreaId(null);
    setAreaName("");
  };

  const handleAreaChange = (id: number | null, name: string) => {
    setAreaId(id);
    setAreaName(name);
  };

  const handleDeliveryTypeChange = (newType: DeliveryLocation) => {
    setDeliveryType(newType);
    if (deliveryCharge === 70 || deliveryCharge === 120) {
      setDeliveryCharge(newType === DeliveryLocation.INSIDE_DHAKA ? 70 : 120);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedStoreId) {
      message.error("Please select a store");
      return;
    }
    if (currentStep === 1) {
      if (!customerPhone || customerPhone.length < 11) {
        message.error("Please enter a valid phone number (min 11 digits)");
        return;
      }
    }
    if (currentStep === 2 && items.length === 0) {
      message.error("Please add at least one product");
      return;
    }
    if (currentStep === 3) {
      if (!cityId || !zoneId || !areaId) {
        message.error("Please select City, Zone and Area for delivery");
        return;
      }
      if (!deliveryAddress.trim()) {
        message.error("Please enter a delivery address");
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    router.push("/dashboard/orders");
  };

  const handleCreateOrder = async () => {
    try {
      const orderData = {
        storeId: selectedStoreId!,
        customerPhone,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        secondaryPhone: secondaryPhone || undefined,
        specialInstructions: specialInstructions || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        deliveryLocation: deliveryType,
        recipientCityId: cityId!,
        recipientZoneId: zoneId!,
        recipientAreaId: areaId!,
        deliveryAddress: deliveryAddress || undefined,
        deliveryCharge,
        paymentMethod,
      };
      await createOrder(orderData).unwrap();
      message.success("Order created successfully!");
      router.push("/dashboard/orders");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create order");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StoreSelectionStep
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />
        );
      case 1:
        return (
          <CustomerInfoStep
            customerPhone={customerPhone}
            customerName={customerName}
            customerEmail={customerEmail}
            onPhoneChange={setCustomerPhone}
            onNameChange={setCustomerName}
            onEmailChange={setCustomerEmail}
          />
        );
      case 2:
        return (
          <ProductSelectionStep
            storeId={selectedStoreId!}
            items={items}
            onItemsChange={setItems}
          />
        );
      case 3:
        return (
          <DeliveryInfoStep
            deliveryType={deliveryType}
            cityId={cityId}
            zoneId={zoneId}
            areaId={areaId}
            deliveryAddress={deliveryAddress}
            deliveryCharge={deliveryCharge}
            secondaryPhone={secondaryPhone}
            specialInstructions={specialInstructions}
            onDeliveryTypeChange={handleDeliveryTypeChange}
            onCityChange={handleCityChange}
            onZoneChange={handleZoneChange}
            onAreaChange={handleAreaChange}
            onDeliveryAddressChange={setDeliveryAddress}
            onDeliveryChargeChange={setDeliveryCharge}
            onSecondaryPhoneChange={setSecondaryPhone}
            onSpecialInstructionsChange={setSpecialInstructions}
          />
        );
      case 4:
        return (
          <ReviewStep
            storeName={selectedStore?.name || ""}
            customerPhone={customerPhone}
            customerName={customerName}
            customerEmail={customerEmail}
            secondaryPhone={secondaryPhone}
            items={items}
            deliveryType={deliveryType}
            cityName={cityName}
            zoneName={zoneName}
            areaName={areaName}
            deliveryAddress={deliveryAddress}
            deliveryCharge={deliveryCharge}
            specialInstructions={specialInstructions}
            paymentMethod={paymentMethod}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <ActionBar title="Create Manual Order" />

      <Card>
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: 24 }}
        />

        <div style={{ minHeight: 400 }}>{renderStepContent()}</div>

        <div
          style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Space>
            {currentStep > 0 && <Button onClick={handlePrev}>Previous</Button>}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                loading={isCreating}
                onClick={handleCreateOrder}
              >
                Create Order
              </Button>
            )}
            <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
              Cancel
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CreateManualOrderPage;
