"use client";

import { Form, Input, Radio } from "antd";
import { HomeOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { DeliveryLocation } from "@/types/order";

const { TextArea } = Input;

interface DeliveryInfoStepProps {
  deliveryType: DeliveryLocation;
  deliveryDistrict: string;
  policeStation: string;
  deliveryArea: string;
  deliveryAddress: string;
  deliveryCharge: number;
  onDeliveryTypeChange: (value: DeliveryLocation) => void;
  onDeliveryDistrictChange: (value: string) => void;
  onPoliceStationChange: (value: string) => void;
  onDeliveryAreaChange: (value: string) => void;
  onDeliveryAddressChange: (value: string) => void;
  onDeliveryChargeChange: (value: number) => void;
}

const DeliveryInfoStep = ({
  deliveryType,
  deliveryDistrict,
  policeStation,
  deliveryArea,
  deliveryAddress,
  deliveryCharge,
  onDeliveryTypeChange,
  onDeliveryDistrictChange,
  onPoliceStationChange,
  onDeliveryAreaChange,
  onDeliveryAddressChange,
  onDeliveryChargeChange,
}: DeliveryInfoStepProps) => {
  // Default delivery charges
  const defaultCharge =
    deliveryType === DeliveryLocation.INSIDE_DHAKA ? 70 : 120;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Form layout="vertical">
        {/* Delivery Type */}
        <Form.Item
          label={
            <span>
              <HomeOutlined /> Delivery Location
            </span>
          }
          required
        >
          <Radio.Group
            value={deliveryType}
            onChange={(e) => {
              onDeliveryTypeChange(e.target.value);
              // Auto-set default charge when location changes (if not custom)
              if (
                !deliveryCharge ||
                deliveryCharge === 70 ||
                deliveryCharge === 120
              ) {
                onDeliveryChargeChange(
                  e.target.value === DeliveryLocation.INSIDE_DHAKA ? 70 : 120,
                );
              }
            }}
            size="large"
          >
            <Radio value={DeliveryLocation.INSIDE_DHAKA}>
              Inside Dhaka (৳70)
            </Radio>
            <Radio value={DeliveryLocation.OUTSIDE_DHAKA}>
              Outside Dhaka (৳120)
            </Radio>
          </Radio.Group>
        </Form.Item>

        {/* District */}
        <Form.Item
          label={
            <span>
              <EnvironmentOutlined /> District
            </span>
          }
          required
          help="Enter the district name"
        >
          <Input
            placeholder="e.g., Dhaka, Chittagong, Sylhet"
            value={deliveryDistrict}
            onChange={(e) => onDeliveryDistrictChange(e.target.value)}
            size="large"
          />
        </Form.Item>

        {/* Police Station */}
        <Form.Item
          label="Police Station / Upazila"
          required
          help="Enter the police station or upazila name"
        >
          <Input
            placeholder="e.g., Gulshan, Dhanmondi, Mirpur"
            value={policeStation}
            onChange={(e) => onPoliceStationChange(e.target.value)}
            size="large"
          />
        </Form.Item>

        {/* Area - OPTIONAL */}
        <Form.Item
          label="Area"
          help="Optional - Enter specific area or locality"
        >
          <Input
            placeholder="e.g., Gulshan 1, Banani DOHS"
            value={deliveryArea}
            onChange={(e) => onDeliveryAreaChange(e.target.value)}
            size="large"
          />
        </Form.Item>

        {/* Full Address - OPTIONAL */}
        <Form.Item
          label="Full Delivery Address"
          help="Optional - House/flat number, road, block, etc."
        >
          <TextArea
            placeholder="Enter complete address (optional)"
            value={deliveryAddress}
            onChange={(e) => onDeliveryAddressChange(e.target.value)}
            rows={4}
            size="large"
          />
        </Form.Item>

        {/* Delivery Charge - OPTIONAL with default */}
        <Form.Item
          label="Delivery Charge (৳)"
          help={`Optional - Default is ৳${defaultCharge} for ${
            deliveryType === DeliveryLocation.INSIDE_DHAKA
              ? "Inside Dhaka"
              : "Outside Dhaka"
          }`}
        >
          <Input
            type="number"
            placeholder={`Default: ৳${defaultCharge}`}
            value={deliveryCharge || ""}
            onChange={(e) =>
              onDeliveryChargeChange(Number(e.target.value) || defaultCharge)
            }
            size="large"
            prefix="৳"
            min={0}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default DeliveryInfoStep;
