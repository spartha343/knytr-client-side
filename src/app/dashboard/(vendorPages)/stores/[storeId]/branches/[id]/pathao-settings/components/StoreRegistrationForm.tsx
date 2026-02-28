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
  Spin,
  Tag,
} from "antd";
import {
  ShopOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
  useRegisterStoreMutation,
  useGetStoreByBranchQuery,
  useLinkExistingStoreMutation,
} from "@/redux/api/pathaoApi";
import type {
  IPathaoCity,
  IPathaoZone,
  IPathaoArea,
  IPathaoStore,
} from "@/types/pathao";
import { Tabs } from "antd";
import { LinkOutlined } from "@ant-design/icons";

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
  otpNumber?: string;
  address: string;
  cityId: number;
  zoneId: number;
  areaId: number;
}

interface LinkExistingStoreValues {
  pathaoStoreId: number;
  name: string;
  contactName: string;
  contactNumber: string;
  secondaryContact?: string;
  address: string;
  cityId: number;
  zoneId: number;
  areaId: number;
}

export default function StoreRegistrationForm({ branchId, onSuccess }: Props) {
  const [form] = Form.useForm();

  // Fetch existing store
  const { data: storeData, isLoading: loadingStore } =
    useGetStoreByBranchQuery(branchId);
  const existingStore: IPathaoStore | null = storeData ?? null;

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  // Sync state once existingStore loads
  const cityId = existingStore?.cityId ?? selectedCityId;
  const zoneId = existingStore?.zoneId ?? selectedZoneId;

  // API Hooks
  const { data: citiesData, isLoading: loadingCities } =
    useGetCitiesQuery(undefined);
  const { data: zonesData, isLoading: loadingZones } = useGetZonesQuery(
    cityId!,
    { skip: !cityId },
  );
  const { data: areasData, isLoading: loadingAreas } = useGetAreasQuery(
    zoneId!,
    { skip: !zoneId },
  );

  const [registerStore, { isLoading: registering }] =
    useRegisterStoreMutation();

  const [linkStore, { isLoading: linking }] = useLinkExistingStoreMutation();
  const [linkForm] = Form.useForm();
  const [linkCityId, setLinkCityId] = useState<number | null>(null);
  const [linkZoneId, setLinkZoneId] = useState<number | null>(null);

  const { data: linkZonesData, isLoading: loadingLinkZones } = useGetZonesQuery(
    linkCityId!,
    { skip: !linkCityId },
  );
  const { data: linkAreasData, isLoading: loadingLinkAreas } = useGetAreasQuery(
    linkZoneId!,
    { skip: !linkZoneId },
  );

  const linkZones = linkZonesData || [];
  const linkAreas = linkAreasData || [];

  const onLinkFinish = async (values: LinkExistingStoreValues) => {
    try {
      await linkStore({ branchId, ...values }).unwrap();
      message.success("Existing Pathao store linked successfully!");
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : "Failed to link store";
      message.error(errorMessage);
    }
  };

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
      message.success(
        existingStore
          ? "Store updated successfully!"
          : "Store registered successfully with Pathao!",
      );
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : "Failed to register store";
      message.error(errorMessage);
    }
  };

  const cities = citiesData || [];
  const zones = zonesData || [];
  const areas = areasData || [];

  if (loadingStore) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: "#888" }}>
          Loading store information...
        </div>
      </div>
    );
  }

  return (
    <div>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={4}>
            <ShopOutlined />{" "}
            {existingStore
              ? "Pathao Pickup Store"
              : "Register Pathao Pickup Store"}
          </Title>
          <Paragraph type="secondary">
            {existingStore
              ? "Your branch is registered as a pickup location with Pathao."
              : "Register this branch as a pickup location with Pathao. This is required before you can create deliveries."}
          </Paragraph>
        </div>

        {/* Show existing store info banner */}
        {existingStore && (
          <Alert
            title={
              <span>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />{" "}
                <strong>Store Registered</strong> — Pathao Store ID:{" "}
                <Tag color="green">#{existingStore.pathaoStoreId}</Tag>
              </span>
            }
            description="This branch is already registered with Pathao. You can update the details below if needed."
            type="success"
            showIcon={false}
          />
        )}

        {!existingStore && (
          <Alert
            description="Make sure you have configured Pathao API credentials in the 'API Credentials' tab before registering a store."
            type="info"
            showIcon
          />
        )}

        {!existingStore && (
          <Tabs
            defaultActiveKey="register"
            items={[
              {
                key: "register",
                label: (
                  <span>
                    <ShopOutlined /> Register New Store
                  </span>
                ),
                children: (
                  <Card
                    title={
                      existingStore ? "Store Details" : "Store Information"
                    }
                  >
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={onFinish}
                      autoComplete="off"
                      initialValues={undefined}
                    >
                      <Form.Item
                        label="Store Name"
                        name="name"
                        rules={[
                          { required: true, message: "Store name is required" },
                          {
                            min: 3,
                            message: "Store name must be at least 3 characters",
                          },
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
                          {
                            required: true,
                            message: "Contact name is required",
                          },
                          {
                            min: 3,
                            message:
                              "Contact name must be at least 3 characters",
                          },
                          {
                            max: 50,
                            message:
                              "Contact name must not exceed 50 characters",
                          },
                        ]}
                      >
                        <Input placeholder="Full name of contact person" />
                      </Form.Item>

                      <Form.Item
                        label="Contact Number"
                        name="contactNumber"
                        rules={[
                          {
                            required: true,
                            message: "Contact number is required",
                          },
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
                          {
                            min: 15,
                            message: "Address must be at least 15 characters",
                          },
                          {
                            max: 120,
                            message: "Address must not exceed 120 characters",
                          },
                        ]}
                        tooltip="Complete address where Pathao will pick up orders"
                      >
                        <TextArea
                          rows={3}
                          placeholder="House/Building, Road, Area, City with postal code"
                          showCount
                          maxLength={120}
                        />
                      </Form.Item>

                      <Title level={5}>
                        <EnvironmentOutlined /> Pickup Location
                      </Title>

                      <Form.Item
                        label="City"
                        name="cityId"
                        rules={[
                          { required: true, message: "Please select a city" },
                        ]}
                      >
                        <Select
                          placeholder="Select city"
                          onChange={handleCityChange}
                          loading={loadingCities}
                          showSearch
                          optionFilterProp="children"
                        >
                          {cities.map((city: IPathaoCity) => (
                            <Select.Option key={city.id} value={city.cityId}>
                              {city.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Zone"
                        name="zoneId"
                        rules={[
                          { required: true, message: "Please select a zone" },
                        ]}
                      >
                        <Select
                          placeholder="Select zone"
                          onChange={handleZoneChange}
                          disabled={!cityId}
                          loading={loadingZones}
                          showSearch
                          optionFilterProp="children"
                        >
                          {zones.map((zone: IPathaoZone) => (
                            <Select.Option key={zone.id} value={zone.zoneId}>
                              {zone.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Area"
                        name="areaId"
                        rules={[
                          { required: true, message: "Area is required" },
                        ]}
                      >
                        <Select
                          placeholder="Select area"
                          loading={loadingAreas}
                          disabled={!zoneId}
                          showSearch
                          optionFilterProp="children"
                        >
                          {areas.map((area: IPathaoArea) => (
                            <Select.Option key={area.id} value={area.areaId}>
                              {area.name}
                              {!area.pickupAvailable && (
                                <Text type="danger">
                                  {" "}
                                  (Pickup not available)
                                </Text>
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
                          {existingStore
                            ? "Update Store Details"
                            : "Register Store with Pathao"}
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                ),
              },
              {
                key: "link",
                label: (
                  <span>
                    <LinkOutlined /> Link Existing Store
                  </span>
                ),
                children: (
                  <Card title="Link Existing Pathao Store">
                    <Alert
                      message="Use this if you already have a store created in the Pathao merchant portal."
                      type="info"
                      showIcon
                      style={{ marginBottom: 24 }}
                    />
                    <Form
                      form={linkForm}
                      layout="vertical"
                      onFinish={onLinkFinish}
                      autoComplete="off"
                    >
                      <Form.Item
                        label="Pathao Store ID"
                        name="pathaoStoreId"
                        getValueFromEvent={(e) => Number(e.target.value)}
                        rules={[
                          {
                            required: true,
                            message: "Pathao Store ID is required",
                          },
                        ]}
                        tooltip="The numeric store ID visible in your Pathao merchant portal"
                      >
                        <Input type="number" placeholder="e.g. 130820" />
                      </Form.Item>

                      <Form.Item
                        label="Store Name"
                        name="name"
                        rules={[{ required: true }, { min: 3 }, { max: 50 }]}
                      >
                        <Input placeholder="e.g., Silicon Bazar BD" />
                      </Form.Item>

                      <Form.Item
                        label="Contact Person Name"
                        name="contactName"
                        rules={[{ required: true }, { min: 3 }, { max: 50 }]}
                      >
                        <Input placeholder="Full name" />
                      </Form.Item>

                      <Form.Item
                        label="Contact Number"
                        name="contactNumber"
                        rules={[
                          { required: true },
                          {
                            pattern: /^01[0-9]{9}$/,
                            message: "Must be valid 11-digit BD number",
                          },
                        ]}
                      >
                        <Input placeholder="01XXXXXXXXX" maxLength={11} />
                      </Form.Item>

                      <Form.Item
                        label="Secondary Contact (Optional)"
                        name="secondaryContact"
                        rules={[
                          {
                            pattern: /^01[0-9]{9}$/,
                            message: "Must be valid 11-digit BD number",
                          },
                        ]}
                      >
                        <Input placeholder="01XXXXXXXXX" maxLength={11} />
                      </Form.Item>

                      <Form.Item
                        label="Pickup Address"
                        name="address"
                        rules={[{ required: true }, { min: 15 }, { max: 120 }]}
                      >
                        <TextArea
                          rows={3}
                          placeholder="Full pickup address"
                          showCount
                          maxLength={120}
                        />
                      </Form.Item>

                      <Title level={5}>
                        <EnvironmentOutlined /> Pickup Location
                      </Title>

                      <Form.Item
                        label="City"
                        name="cityId"
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Select city"
                          loading={loadingCities}
                          showSearch
                          optionFilterProp="children"
                          onChange={(val: number) => {
                            setLinkCityId(val);
                            setLinkZoneId(null);
                            linkForm.setFieldsValue({
                              zoneId: undefined,
                              areaId: undefined,
                            });
                          }}
                        >
                          {cities.map((city: IPathaoCity) => (
                            <Select.Option key={city.id} value={city.cityId}>
                              {city.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Zone"
                        name="zoneId"
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Select zone"
                          loading={loadingLinkZones}
                          disabled={!linkCityId}
                          showSearch
                          optionFilterProp="children"
                          onChange={(val: number) => {
                            setLinkZoneId(val);
                            linkForm.setFieldsValue({ areaId: undefined });
                          }}
                        >
                          {linkZones.map((zone: IPathaoZone) => (
                            <Select.Option key={zone.id} value={zone.zoneId}>
                              {zone.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Area"
                        name="areaId"
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Select area"
                          loading={loadingLinkAreas}
                          disabled={!linkZoneId}
                          showSearch
                          optionFilterProp="children"
                        >
                          {linkAreas.map((area: IPathaoArea) => (
                            <Select.Option key={area.id} value={area.areaId}>
                              {area.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={linking}
                          size="large"
                          block
                        >
                          Link Existing Store
                        </Button>
                      </Form.Item>
                    </Form>
                  </Card>
                ),
              },
            ]}
          />
        )}
      </Space>
    </div>
  );
}
