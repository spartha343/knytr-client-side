"use client";

import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Card,
  Typography,
  Space,
  Alert,
} from "antd";
import { ShopOutlined, EnvironmentOutlined } from "@ant-design/icons";
import {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
  useRegisterStoreMutation,
} from "@/redux/api/pathaoApi";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface Props {
  branchId: string;
  onSuccess?: () => void;
}

interface StoreRegistrationValues {
  name: string;
  contactName: string;
  contactNumber: string;
  secondaryContact?: string;
  address: string;
  cityId: number;
  zoneId: number;
  areaId: number;
}

interface PathaoCity {
  id: string;
  cityId: number;
  name: string;
  isActive: boolean;
}

interface PathaoZone {
  id: string;
  zoneId: number;
  name: string;
  isActive: boolean;
}

interface PathaoArea {
  id: string;
  areaId: number;
  name: string;
  pickupAvailable: boolean;
  homeDeliveryAvailable: boolean;
  isActive: boolean;
}

export default function StoreRegistrationForm({ branchId, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  // API Hooks
  const { data: citiesData, isLoading: loadingCities } =
    useGetCitiesQuery(undefined);
  const { data: zonesData, isLoading: loadingZones } = useGetZonesQuery(
    selectedCityId!,
    { skip: !selectedCityId },
  );
  const { data: areasData, isLoading: loadingAreas } = useGetAreasQuery(
    selectedZoneId!,
    { skip: !selectedZoneId },
  );

  const [registerStore, { isLoading: registering }] =
    useRegisterStoreMutation();

  const handleCityChange = (cityId: number) => {
    setSelectedCityId(cityId);
    setSelectedZoneId(null);
    form.setFieldsValue({ zoneId: undefined, areaId: undefined });
  };

  const handleZoneChange = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    form.setFieldsValue({ areaId: undefined });
  };

  const onFinish = async (values: StoreRegistrationValues) => {
    try {
      await registerStore({
        branchId,
        ...values,
      }).unwrap();
      message.success("Store registered successfully with Pathao!");
      form.resetFields();
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : "Failed to register store";
      message.error(errorMessage);
    }
  };

  const cities = (citiesData as PathaoCity[]) || [];
  const zones = (zonesData as PathaoZone[]) || [];
  const areas = (areasData as PathaoArea[]) || [];

  return (
    <div>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={4}>
            <ShopOutlined /> Register Pathao Pickup Store
          </Title>
          <Paragraph type="secondary">
            Register this branch as a pickup location with Pathao. This is
            required before you can create deliveries.
          </Paragraph>
        </div>

        <Alert
          title="Important"
          description="Make sure you have configured Pathao API credentials in the 'API Credentials' tab before
registering a store."
          type="info"
          showIcon
        />

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* Store Information */}
            <Title level={5}>Store Information</Title>

            <Form.Item
              label="Store Name"
              name="name"
              rules={[
                { required: true, message: "Store name is required" },
                { min: 3, message: "Store name must be at least 3 characters" },
                {
                  max: 50,
                  message: "Store name must not exceed 50 characters",
                },
              ]}
              tooltip="A descriptive name for this pickup location"
            >
              <Input placeholder="e.g., Main Branch - Dhaka" />
            </Form.Item>

            <Form.Item
              label="Contact Person Name"
              name="contactName"
              rules={[
                { required: true, message: "Contact name is required" },
                {
                  min: 3,
                  message: "Contact name must be at least 3 characters",
                },
                {
                  max: 50,
                  message: "Contact name must not exceed 50 characters",
                },
              ]}
            >
              <Input placeholder="Full name of contact person" />
            </Form.Item>

            <Form.Item
              label="Contact Number"
              name="contactNumber"
              rules={[
                { required: true, message: "Contact number is required" },
                {
                  pattern: /^01[0-9]{9}$/,
                  message:
                    "Must be a valid 11-digit BD number (e.g., 01712345678)",
                },
              ]}
              tooltip="Primary contact number for delivery coordination"
            >
              <Input placeholder="01XXXXXXXXX" maxLength={11} />
            </Form.Item>

            <Form.Item
              label="Secondary Contact (Optional)"
              name="secondaryContact"
              rules={[
                {
                  pattern: /^01[0-9]{9}$/,
                  message: "Must be a valid 11-digit BD number",
                },
              ]}
            >
              <Input placeholder="01XXXXXXXXX" maxLength={11} />
            </Form.Item>

            <Form.Item
              label="Pickup Address"
              name="address"
              rules={[
                { required: true, message: "Address is required" },
                { min: 15, message: "Address must be at least 15 characters" },
                { max: 220, message: "Address must not exceed 220 characters" },
              ]}
              tooltip="Complete address where Pathao will pick up orders"
            >
              <TextArea
                rows={3}
                placeholder="House/Building, Road, Area, City with postal code"
                showCount
                maxLength={220}
              />
            </Form.Item>

            {/* Location Selection */}
            <Title level={5}>
              <EnvironmentOutlined /> Pickup Location
            </Title>

            <Form.Item
              label="City"
              name="cityId"
              rules={[{ required: true, message: "Please select a city" }]}
            >
              <Select
                placeholder="Select city"
                onChange={handleCityChange}
                loading={loadingCities}
                showSearch
                optionFilterProp="children"
              >
                {cities.map((city: PathaoCity) => (
                  <Select.Option key={city.id} value={city.cityId}>
                    {city.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Zone"
              name="zoneId"
              rules={[{ required: true, message: "Please select a zone" }]}
            >
              <Select
                placeholder="Select zone"
                onChange={handleZoneChange}
                disabled={!selectedCityId}
                loading={loadingZones}
                showSearch
                optionFilterProp="children"
              >
                {zones.map((zone: PathaoZone) => (
                  <Select.Option key={zone.id} value={zone.zoneId}>
                    {zone.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Area"
              name="areaId"
              rules={[{ required: true, message: "Area is required" }]}
            >
              <Select
                placeholder="Select area"
                loading={loadingAreas}
                disabled={!selectedZoneId}
                showSearch
                optionFilterProp="children"
              >
                {areas.map((area: PathaoArea) => (
                  <Select.Option key={area.id} value={area.areaId}>
                    {area.name}
                    {!area.pickupAvailable && (
                      <Text type="danger"> (Pickup not available)</Text>
                    )}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={registering}
                size="large"
                block
              >
                Register Store with Pathao
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
}
