"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Space,
  Row,
  Col,
  Typography,
  Table,
  Popconfirm,
  message,
  Alert,
  Divider,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  IOrder,
  DeliveryLocation,
  OrderStatus,
  IUpdateOrderInput,
} from "@/types/order";
import { useUpdateOrderMutation } from "@/redux/api/orderApi";
import { useGetProductsByStoreQuery } from "@/redux/api/productApi";
import PathaoLocationSelector from "@/components/pathao/PathaoLocationSelector";

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;

// Local interface for items being edited
interface EditOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  priceOverride?: number;
  productName: string;
  variantName?: string;
}

// Product interface for API response
interface IProduct {
  id: string;
  name: string;
  basePrice: number;
  comparePrice?: number;
  isActive: boolean;
}

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrder;
  onSuccess: () => void;
}

export default function EditOrderModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: EditOrderModalProps) {
  const [form] = Form.useForm();
  const [updateOrder, { isLoading }] = useUpdateOrderMutation();

  // State management
  const [items, setItems] = useState<EditOrderItem[]>([]);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation>(
    order.deliveryLocation,
  );
  const [cityId, setCityId] = useState<number | null>(
    order.recipientCityId || null,
  );
  const [zoneId, setZoneId] = useState<number | null>(
    order.recipientZoneId || null,
  );
  const [areaId, setAreaId] = useState<number | null>(
    order.recipientAreaId || null,
  );
  const [deliveryChargeOverride, setDeliveryChargeOverride] = useState<
    number | null
  >(null);

  // Fetch products from the same store
  const { data: productsData } = useGetProductsByStoreQuery(
    { storeId: order.storeId, limit: 100 },
    { skip: !isOpen },
  );

  // Initialize form and items when modal opens
  useEffect(() => {
    if (!isOpen || !order) return;

    // Set form values
    form.setFieldsValue({
      customerPhone: order.customerPhone,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      secondaryPhone: order.secondaryPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryLocation: order.deliveryLocation,
      specialInstructions: order.specialInstructions,
    });

    // Set items
    const orderItems: EditOrderItem[] = order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId || undefined,
      quantity: item.quantity,
      price: Number(item.price),
      productName: item.productName,
      variantName: item.variantName || undefined,
    }));

    // Set location and items
    setItems(orderItems);
    setCityId(order.recipientCityId || null);
    setZoneId(order.recipientZoneId || null);
    setAreaId(order.recipientAreaId || null);
    setDeliveryLocation(order.deliveryLocation);
    setDeliveryChargeOverride(Number(order.deliveryCharge));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order?.id]);

  // Calculate subtotal using useMemo
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.priceOverride || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  // Calculate delivery charge using useMemo
  const deliveryCharge = useMemo(() => {
    // If vendor has overridden the charge, use that
    if (
      deliveryChargeOverride !== null &&
      deliveryChargeOverride !== undefined
    ) {
      return deliveryChargeOverride;
    }

    // Otherwise calculate based on location
    if (deliveryLocation === DeliveryLocation.INSIDE_DHAKA) {
      return 60;
    } else if (deliveryLocation === DeliveryLocation.OUTSIDE_DHAKA) {
      return 120;
    }
    return 0;
  }, [deliveryLocation, deliveryChargeOverride]);

  // Calculate total
  const total = useMemo(() => {
    return subtotal + deliveryCharge;
  }, [subtotal, deliveryCharge]);

  // Handle quantity change
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newItems = [...items];
    newItems[index].quantity = newQuantity;
    setItems(newItems);
  };

  // Handle price override change
  const handlePriceOverrideChange = (
    index: number,
    newPrice: number | null,
  ) => {
    const newItems = [...items];
    newItems[index].priceOverride = newPrice || undefined;
    setItems(newItems);
  };

  // Handle remove item
  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Handle add item
  const handleAddItem = (productId: string) => {
    const products = productsData?.products;

    if (!products || !Array.isArray(products)) {
      message.error("Products data not available");
      return;
    }

    const product = products.find((p: unknown) => {
      if (typeof p === "object" && p !== null && "id" in p) {
        return (p as IProduct).id === productId;
      }
      return false;
    }) as IProduct | undefined;

    if (!product) return;

    const newItem: EditOrderItem = {
      productId: product.id,
      quantity: 1,
      price: Number(product.basePrice),
      productName: product.name,
    };

    setItems([...items, newItem]);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: IUpdateOrderInput = {
        customerPhone: values.customerPhone,
        customerName: values.customerName || undefined,
        customerEmail: values.customerEmail || undefined,
        secondaryPhone: values.secondaryPhone || undefined,
        specialInstructions: values.specialInstructions || undefined,
        deliveryAddress: values.deliveryAddress || undefined,
        deliveryLocation: values.deliveryLocation,
        recipientCityId: cityId || undefined,
        recipientZoneId: zoneId || undefined,
        recipientAreaId: areaId || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
          priceOverride: item.priceOverride || undefined,
        })),
        deliveryChargeOverride: deliveryChargeOverride || undefined,
      };

      await updateOrder({ id: order.id, data: payload }).unwrap();
      message.success("Order updated successfully");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Failed to update order:", error);

      if (error && typeof error === "object" && "data" in error) {
        const apiError = error as { data?: { message?: string } };
        message.error(
          apiError.data?.message || "Failed to update order. Please try again.",
        );
      } else {
        message.error("Failed to update order. Please try again.");
      }
    }
  };

  // Table columns for order items
  const columns: ColumnsType<EditOrderItem> = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (_: unknown, record: EditOrderItem) => (
        <div>
          <div>
            <strong>{record.productName}</strong>
          </div>
          {record.variantName && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.variantName}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      width: 150,
      render: (_: unknown, record: EditOrderItem, index: number) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.priceOverride || record.price}
          onChange={(value) => handlePriceOverrideChange(index, value)}
          prefix="৳"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Quantity",
      key: "quantity",
      width: 120,
      render: (_: unknown, record: EditOrderItem, index: number) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(index, value || 1)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Total",
      key: "total",
      width: 120,
      render: (_: unknown, record: EditOrderItem) => {
        const price = record.priceOverride || record.price || 0;
        const total = price * record.quantity;
        return <strong>৳{total.toFixed(2)}</strong>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_: unknown, __: EditOrderItem, index: number) => (
        <Popconfirm
          title="Remove this item?"
          onConfirm={() => handleRemoveItem(index)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  // Check if order can be edited
  const canEdit = order.status === OrderStatus.PENDING;

  return (
    <Modal
      title="Edit Order"
      open={isOpen}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={handleSubmit}
          disabled={!canEdit}
        >
          Update Order
        </Button>,
      ]}
    >
      {!canEdit && (
        <Alert
          title="Order Cannot Be Edited"
          description="Only orders with PENDING status can be edited."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" disabled={!canEdit}>
        {/* Customer Information */}
        <Title level={5}>Customer Information</Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerPhone"
              label="Customer Phone"
              rules={[
                { required: true, message: "Phone is required" },
                { min: 11, message: "Phone must be at least 11 digits" },
              ]}
            >
              <Input placeholder="01XXXXXXXXX" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customerName" label="Customer Name">
              <Input placeholder="Enter customer name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="customerEmail"
              label="Customer Email"
              rules={[{ type: "email", message: "Invalid email format" }]}
            >
              <Input placeholder="customer@example.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="secondaryPhone" label="Secondary Phone">
              <Input placeholder="01XXXXXXXXX" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {/* Delivery Information */}
        <Title level={5}>Delivery Information</Title>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="deliveryAddress" label="Delivery Address">
              <TextArea
                rows={2}
                placeholder="Enter complete delivery address"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="deliveryLocation" label="Delivery Location">
              <Select
                value={deliveryLocation}
                onChange={(value) => setDeliveryLocation(value)}
              >
                <Option value={DeliveryLocation.INSIDE_DHAKA}>
                  Inside Dhaka
                </Option>
                <Option value={DeliveryLocation.OUTSIDE_DHAKA}>
                  Outside Dhaka
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Delivery Charge">
              <Input
                value={`৳${deliveryCharge.toFixed(2)}`}
                disabled
                style={{ fontWeight: "bold" }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Pathao Location Selector */}
        <PathaoLocationSelector
          cityId={cityId}
          zoneId={zoneId}
          areaId={areaId}
          onCityChange={setCityId}
          onZoneChange={setZoneId}
          onAreaChange={setAreaId}
        />

        <Form.Item name="specialInstructions" label="Special Instructions">
          <TextArea
            rows={2}
            placeholder="E.g., Call before delivery, Leave at gate"
          />
        </Form.Item>

        <Divider />

        {/* Order Items */}
        <Title level={5}>Order Items</Title>
        <Table
          dataSource={items}
          columns={columns}
          rowKey={(record, index) => `${record.productId}-${index}`}
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        />

        {/* Add Product */}
        <Form.Item label="Add Product">
          <Select
            showSearch
            placeholder="Search and select a product to add"
            onSelect={(value: string | undefined) => {
              if (value) handleAddItem(value);
            }}
            value={undefined}
            suffixIcon={<PlusOutlined />}
            filterOption={(input, option) =>
              (option?.label?.toString() ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {productsData?.products && Array.isArray(productsData.products)
              ? (productsData.products as IProduct[])
                  .filter((p) => !items.some((item) => item.productId === p.id))
                  .map((product) => (
                    <Option
                      key={product.id}
                      value={product.id}
                      label={product.name}
                    >
                      {product.name} - ৳{Number(product.basePrice).toFixed(2)}
                    </Option>
                  ))
              : null}
          </Select>
        </Form.Item>

        <Divider />

        {/* Totals */}
        <Space orientation="vertical" style={{ width: "100%" }}>
          <Row justify="space-between">
            <Col>
              <Text>Subtotal:</Text>
            </Col>
            <Col>
              <Text>৳{subtotal.toFixed(2)}</Text>
            </Col>
          </Row>
          <Row justify="space-between" align="middle">
            <Col>
              <Text>Delivery Charge:</Text>
            </Col>
            <Col>
              <InputNumber
                min={0}
                step={1}
                value={deliveryCharge}
                onChange={(value) => setDeliveryChargeOverride(value)}
                prefix="৳"
                style={{ width: "150px" }}
                placeholder="Auto-calculated"
              />
            </Col>
          </Row>
          <Row justify="space-between">
            <Col>
              <Title level={5}>Total:</Title>
            </Col>
            <Col>
              <Title level={5}>৳{total.toFixed(2)}</Title>
            </Col>
          </Row>
        </Space>
      </Form>
    </Modal>
  );
}
