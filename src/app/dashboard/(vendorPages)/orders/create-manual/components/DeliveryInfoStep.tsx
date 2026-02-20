"use client";

import {
  Form,
  Input,
  Radio,
  InputNumber,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import {
  HomeOutlined,
  PhoneOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { DeliveryLocation } from "@/types/order";
import PathaoLocationSelector from "@/components/pathao/PathaoLocationSelector";

const { TextArea } = Input;
const { Text } = Typography;

interface DeliveryInfoStepProps {
  deliveryType: DeliveryLocation;
  cityId: number | null;
  zoneId: number | null;
  areaId: number | null;
  deliveryAddress: string;
  deliveryCharge: number;
  secondaryPhone: string;
  specialInstructions: string;
  onDeliveryTypeChange: (value: DeliveryLocation) => void;
  onCityChange: (cityId: number | null, cityName: string) => void;
  onZoneChange: (zoneId: number | null, zoneName: string) => void;
  onAreaChange: (areaId: number | null, areaName: string) => void;
  onDeliveryAddressChange: (value: string) => void;
  onDeliveryChargeChange: (value: number) => void;
  onSecondaryPhoneChange: (value: string) => void;
  onSpecialInstructionsChange: (value: string) => void;
}

const DeliveryInfoStep = ({
  deliveryType,
  cityId,
  zoneId,
  areaId,
  deliveryAddress,
  deliveryCharge,
  secondaryPhone,
  specialInstructions,
  onDeliveryTypeChange,
  onCityChange,
  onZoneChange,
  onAreaChange,
  onDeliveryAddressChange,
  onDeliveryChargeChange,
  onSecondaryPhoneChange,
  onSpecialInstructionsChange,
}: DeliveryInfoStepProps) => {
  const defaultCharge =
    deliveryType === DeliveryLocation.INSIDE_DHAKA ? 70 : 120;

  const handleDeliveryTypeChange = (value: DeliveryLocation) => {
    onDeliveryTypeChange(value);
    // Auto-reset to default charge when location type changes
    if (deliveryCharge === 70 || deliveryCharge === 120) {
      onDeliveryChargeChange(
        value === DeliveryLocation.INSIDE_DHAKA ? 70 : 120,
      );
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Form layout="vertical">
        {/* Delivery Location Type */}
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
            onChange={(e) => handleDeliveryTypeChange(e.target.value)}
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

        {/* Pathao Location Selector — City / Zone / Area */}
        <PathaoLocationSelector
          cityId={cityId}
          zoneId={zoneId}
          areaId={areaId}
          onCityChange={onCityChange}
          onZoneChange={onZoneChange}
          onAreaChange={onAreaChange}
          required={true}
        />

        {/* Delivery Address */}
        <Form.Item
          label="Delivery Address"
          required
          help="House/flat number, road, block, landmark etc."
        >
          <TextArea
            placeholder="e.g., House 12, Road 5, Block B, Mirpur-10"
            value={deliveryAddress}
            onChange={(e) => onDeliveryAddressChange(e.target.value)}
            rows={3}
            size="large"
          />
        </Form.Item>

        <Divider />

        {/* Secondary Phone */}
        <Form.Item
          label={
            <span>
              <PhoneOutlined /> Secondary Phone
            </span>
          }
          help="Optional - alternate contact number"
        >
          <Input
            placeholder="01XXXXXXXXX"
            value={secondaryPhone}
            onChange={(e) => onSecondaryPhoneChange(e.target.value)}
            size="large"
            maxLength={15}
          />
        </Form.Item>

        {/* Special Instructions */}
        <Form.Item
          label={
            <span>
              <InfoCircleOutlined /> Special Instructions
            </span>
          }
          help="Optional - e.g., Call before delivery, Leave at gate"
        >
          <TextArea
            placeholder="Enter any special instructions for delivery"
            value={specialInstructions}
            onChange={(e) => onSpecialInstructionsChange(e.target.value)}
            rows={2}
            size="large"
          />
        </Form.Item>

        <Divider />

        {/* Delivery Charge */}
        <Form.Item
          label="Delivery Charge (৳)"
          help={`Default is ৳${defaultCharge} for ${
            deliveryType === DeliveryLocation.INSIDE_DHAKA
              ? "Inside Dhaka"
              : "Outside Dhaka"
          }. You can override this.`}
        >
          <Row gutter={12} align="middle">
            <Col>
              <InputNumber
                min={0}
                step={1}
                value={deliveryCharge}
                onChange={(value) =>
                  onDeliveryChargeChange(value ?? defaultCharge)
                }
                prefix="৳"
                size="large"
                style={{ width: 160 }}
              />
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Auto-calculated · Editable
              </Text>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DeliveryInfoStep;
