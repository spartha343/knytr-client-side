"use client";

import { useState } from "react";
import { Modal, Button, message, Alert, Space } from "antd";
import { RocketOutlined } from "@ant-design/icons";
import PathaoLocationSelector from "@/components/pathao/PathaoLocationSelector";
import { useCreateDeliveryMutation } from "@/redux/api/pathaoApi";

interface BookPathaoDeliveryModalProps {
  isOpen: boolean;
  orderId: string;
  orderNumber: string;
  currentCityId?: number | null;
  currentZoneId?: number | null;
  currentAreaId?: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const BookPathaoDeliveryModal = ({
  isOpen,
  orderId,
  orderNumber,
  currentCityId,
  currentZoneId,
  currentAreaId,
  onClose,
  onSuccess,
}: BookPathaoDeliveryModalProps) => {
  const [cityId, setCityId] = useState<number | null>(currentCityId || null);
  const [zoneId, setZoneId] = useState<number | null>(currentZoneId || null);
  const [areaId, setAreaId] = useState<number | null>(currentAreaId || null);

  const [createDelivery, { isLoading: isCreatingDelivery }] =
    useCreateDeliveryMutation();

  const isLoading = isCreatingDelivery;

  const handleBookDelivery = async () => {
    // Validation
    if (!cityId || !zoneId || !areaId) {
      message.error("Please select City, Zone, and Area");
      return;
    }

    try {
      // Create Pathao delivery (order already has location data)
      await createDelivery({
        orderId,
        data: {
          recipientCityId: cityId!,
          recipientZoneId: zoneId!,
          recipientAreaId: areaId!,
        },
      }).unwrap();

      message.success("Pathao delivery booked successfully!");

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(
        err?.data?.message ||
          "Failed to book Pathao delivery. Please try again.",
      );
    }
  };

  const handleClose = () => {
    setCityId(currentCityId || null);
    setZoneId(currentZoneId || null);
    setAreaId(currentAreaId || null);
    onClose();
  };

  return (
    <Modal
      title={
        <span>
          <RocketOutlined /> Book Pathao Delivery
        </span>
      }
      open={isOpen}
      onCancel={handleClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<RocketOutlined />}
          onClick={handleBookDelivery}
          loading={isLoading}
          disabled={!cityId || !zoneId || !areaId}
        >
          Book Delivery
        </Button>,
      ]}
    >
      <Space orientation="vertical" style={{ width: "100%" }} size="large">
        <Alert
          title="Order Information"
          description={`Order #${orderNumber} - Select delivery location`}
          type="info"
          showIcon
        />

        <PathaoLocationSelector
          cityId={cityId}
          zoneId={zoneId}
          areaId={areaId}
          onCityChange={setCityId}
          onZoneChange={setZoneId}
          onAreaChange={setAreaId}
          disabled={isLoading}
          required
        />

        <Alert
          title="Note"
          description="This will book a Pathao courier for delivery. Make sure the order is ready for pickup."
          type="warning"
          showIcon
        />
      </Space>
    </Modal>
  );
};

export default BookPathaoDeliveryModal;
