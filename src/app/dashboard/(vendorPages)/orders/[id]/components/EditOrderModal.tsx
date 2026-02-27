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
  Tag,
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

// Variant attribute shape
interface IVariantAttribute {
  attributeValue: {
    value: string;
    attribute: { name: string };
  };
}

// Variant shape returned by API when includeVariants=true
interface IVariant {
  id: string;
  sku: string;
  price: number | null;
  comparePrice: number | null;
  imageUrl: string | null;
  isActive: boolean;
  variantAttributes: IVariantAttribute[];
  inventories: { quantity: number; reservedQty: number }[];
}

// Product shape with full variants
interface IProduct {
  id: string;
  name: string;
  basePrice: number;
  comparePrice?: number | null;
  isActive: boolean;
  variants?: IVariant[];
}

// Local interface for items being edited
interface EditOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  priceOverride?: number;
  productName: string;
  variantName?: string;
  availableVariants?: IVariant[];
}

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrder;
  onSuccess: () => void;
}

// Helper: build display label for a variant
function getVariantLabel(variant: IVariant): string {
  const attrs = variant.variantAttributes
    .map((va) => va.attributeValue.value)
    .join(" / ");
  const price =
    variant.price != null ? `৳${Number(variant.price).toFixed(2)}` : "";
  const stockLabel = getStockLabel(variant);
  const base = attrs ? `${attrs} — ${price}` : `${variant.sku} — ${price}`;
  return `${base} · ${stockLabel}`;
}

// Helper: get effective price for a variant (variant.price ?? product.basePrice)
function getEffectivePrice(
  variant: IVariant | undefined,
  product: IProduct,
): number {
  if (variant && variant.price != null) return Number(variant.price);
  return Number(product.basePrice);
}

// Helper: compute total available stock across all branches
function getAvailableStock(variant: IVariant): number {
  if (!variant.inventories || variant.inventories.length === 0) return 0;
  return variant.inventories.reduce(
    (sum, inv) => sum + (inv.quantity - inv.reservedQty),
    0,
  );
}

// Helper: get stock label for display in variant selector
function getStockLabel(variant: IVariant): string {
  const stock = getAvailableStock(variant);
  if (stock <= 0) return "Out of stock";
  if (stock <= 10) return `Only ${stock} left`;
  return `${stock} in stock`;
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

  // State for adding a new product — tracks pending product + variant selection
  const [pendingProductId, setPendingProductId] = useState<string | undefined>(
    undefined,
  );
  const [pendingVariantId, setPendingVariantId] = useState<string | undefined>(
    undefined,
  );

  // Fetch products with full variants from the same store
  const { data: productsData } = useGetProductsByStoreQuery(
    { storeId: order.storeId, limit: 100, includeVariants: true },
    { skip: !isOpen },
  );

  // Initialize form and items when modal opens
  useEffect(() => {
    if (!isOpen || !order) return;

    form.setFieldsValue({
      customerPhone: order.customerPhone,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      secondaryPhone: order.secondaryPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryLocation: order.deliveryLocation,
      specialInstructions: order.specialInstructions,
    });

    // Enrich existing order items with availableVariants from productsData if loaded
    const products = productsData?.products as IProduct[] | undefined;

    const orderItems: EditOrderItem[] = order.items.map((item) => {
      const matchedProduct = products?.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
        price: Number(item.price),
        productName: item.productName,
        variantName: item.variantName || undefined,
        availableVariants: matchedProduct?.variants ?? [],
      };
    });

    setItems(orderItems);
    setCityId(order.recipientCityId || null);
    setZoneId(order.recipientZoneId || null);
    setAreaId(order.recipientAreaId || null);
    setDeliveryLocation(order.deliveryLocation);
    setDeliveryChargeOverride(null);
    setPendingProductId(undefined);
    setPendingVariantId(undefined);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order?.id, productsData]);

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.priceOverride ?? item.price;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  // Calculate delivery charge
  const deliveryCharge = useMemo(() => {
    if (
      deliveryChargeOverride !== null &&
      deliveryChargeOverride !== undefined
    ) {
      return deliveryChargeOverride;
    }
    if (deliveryLocation === DeliveryLocation.INSIDE_DHAKA) return 70;
    if (deliveryLocation === DeliveryLocation.OUTSIDE_DHAKA) return 120;
    return 0;
  }, [deliveryLocation, deliveryChargeOverride]);

  // Calculate total
  const total = useMemo(
    () => subtotal + deliveryCharge,
    [subtotal, deliveryCharge],
  );

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newItems = [...items];
    const item = newItems[index];

    // Cap at available stock
    const selectedVariant = item.availableVariants?.find(
      (v) => v.id === item.variantId,
    );
    if (selectedVariant) {
      const maxQty = getAvailableStock(selectedVariant);
      if (newQuantity > maxQty) {
        message.warning(
          `Only ${maxQty} unit${maxQty !== 1 ? "s" : ""} available for "${
            item.variantName ?? item.productName
          }". Quantity capped at ${maxQty}.`,
        );
        newItems[index].quantity = maxQty;
        setItems(newItems);
        return;
      }
    }

    newItems[index].quantity = newQuantity;
    setItems(newItems);
  };

  // Handle price override change
  const handlePriceOverrideChange = (
    index: number,
    newPrice: number | null,
  ) => {
    const newItems = [...items];
    newItems[index].priceOverride = newPrice ?? undefined;
    setItems(newItems);
  };

  // Handle variant change on existing item
  const handleVariantChange = (index: number, variantId: string) => {
    const newItems = [...items];
    const item = newItems[index];
    const variant = item.availableVariants?.find((v) => v.id === variantId);

    if (!variant) return;

    // Check stock availability
    const available = getAvailableStock(variant);
    if (available <= 0) {
      message.error(
        `"${getVariantLabel(variant)}" is out of stock. Please select a different variant.`,
      );
      return;
    }

    item.variantId = variantId;
    item.variantName = variant.variantAttributes
      .map((va) => va.attributeValue.value)
      .join(" / ");
    // Auto-update price to variant price (clear any override)
    item.price = variant.price != null ? Number(variant.price) : item.price;
    item.priceOverride = undefined;

    setItems(newItems);
  };

  // Handle remove item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Handle confirm adding a product (with or without variant)
  const handleConfirmAddItem = () => {
    if (!pendingProductId) return;

    const products = productsData?.products as IProduct[] | undefined;
    const product = products?.find((p) => p.id === pendingProductId);
    if (!product) return;

    const hasVariants = product.variants && product.variants.length > 0;

    // If product has variants but no variant selected yet, prompt
    if (hasVariants && !pendingVariantId) {
      message.warning("Please select a variant before adding");
      return;
    }

    const variant = product.variants?.find((v) => v.id === pendingVariantId);

    // Check stock availability
    if (variant) {
      const available = getAvailableStock(variant);
      if (available <= 0) {
        message.error(
          `"${getVariantLabel(variant)}" is out of stock and cannot be added to the order.`,
        );
        return;
      }
    }

    // Check if same productId + variantId already exists → merge quantity
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === pendingProductId &&
        (item.variantId ?? null) === (pendingVariantId ?? null),
    );

    if (existingIndex !== -1) {
      // Merge: increment quantity of existing item
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
      message.info("Item already in order — quantity increased by 1");
    } else {
      const price = getEffectivePrice(variant, product);
      const variantName = variant
        ? variant.variantAttributes
            .map((va) => va.attributeValue.value)
            .join(" / ")
        : undefined;

      const newItem: EditOrderItem = {
        productId: product.id,
        variantId: variant?.id,
        quantity: 1,
        price,
        productName: product.name,
        variantName,
        availableVariants: product.variants ?? [],
      };

      setItems([...items, newItem]);
    }

    setPendingProductId(undefined);
    setPendingVariantId(undefined);
  };

  // Get selected pending product
  const pendingProduct = useMemo(() => {
    if (!pendingProductId) return undefined;
    const products = productsData?.products as IProduct[] | undefined;
    return products?.find((p) => p.id === pendingProductId);
  }, [pendingProductId, productsData]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!cityId) {
        message.error("Please select a city");
        return;
      }
      if (!zoneId) {
        message.error("Please select a zone");
        return;
      }
      if (!areaId) {
        message.error("Please select an area");
        return;
      }

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
      let errorMsg = "Failed to update order. Please try again.";
      if (error && typeof error === "object") {
        if ("data" in error) {
          const apiError = error as { data?: { message?: string } };
          errorMsg = apiError.data?.message || errorMsg;
        } else if ("message" in error) {
          const jsError = error as { message?: string };
          errorMsg = jsError.message || errorMsg;
        }
      }
      message.error(errorMsg);
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
          <strong>{record.productName}</strong>
        </div>
      ),
    },
    {
      title: "Variant",
      key: "variant",
      width: 200,
      render: (_: unknown, record: EditOrderItem, index: number) => {
        const hasVariants =
          record.availableVariants && record.availableVariants.length > 0;
        if (!hasVariants) {
          return <Tag color="default">No variants</Tag>;
        }
        return (
          <Select
            value={record.variantId}
            onChange={(value) => handleVariantChange(index, value)}
            style={{ width: "100%" }}
            size="small"
            placeholder="Select variant"
            disabled={!canEdit}
          >
            {record.availableVariants!.map((v) => {
              const stock = getAvailableStock(v);
              const isOOS = stock <= 0;
              const isLowStock = stock > 0 && stock <= 10;
              return (
                <Option key={v.id} value={v.id} disabled={isOOS}>
                  <span
                    style={{
                      color: isOOS
                        ? "#ff4d4f"
                        : isLowStock
                          ? "#fa8c16"
                          : undefined,
                    }}
                  >
                    {getVariantLabel(v)}
                  </span>
                </Option>
              );
            })}
          </Select>
        );
      },
    },
    {
      title: "Price",
      key: "price",
      width: 150,
      render: (_: unknown, record: EditOrderItem, index: number) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.priceOverride ?? record.price}
          onChange={(value) => handlePriceOverrideChange(index, value)}
          prefix="৳"
          style={{ width: "100%" }}
          disabled={!canEdit}
        />
      ),
    },
    {
      title: "Qty",
      key: "quantity",
      width: 100,
      render: (_: unknown, record: EditOrderItem, index: number) => {
        const selectedVariant = record.availableVariants?.find(
          (v) => v.id === record.variantId,
        );
        const maxQty = selectedVariant
          ? getAvailableStock(selectedVariant)
          : undefined;

        return (
          <InputNumber
            min={1}
            max={maxQty}
            value={record.quantity}
            onChange={(value) => handleQuantityChange(index, value || 1)}
            style={{ width: "100%" }}
            disabled={!canEdit}
          />
        );
      },
    },
    {
      title: "Total",
      key: "total",
      width: 110,
      render: (_: unknown, record: EditOrderItem) => {
        const price = record.priceOverride ?? record.price ?? 0;
        return <strong>৳{(price * record.quantity).toFixed(2)}</strong>;
      },
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: unknown, __: EditOrderItem, index: number) => (
        <Popconfirm
          title="Remove this item?"
          onConfirm={() => handleRemoveItem(index)}
          okText="Yes"
          cancelText="No"
          disabled={!canEdit}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={!canEdit}
          />
        </Popconfirm>
      ),
    },
  ];

  const canEdit = order.status === OrderStatus.PENDING;

  const products = productsData?.products as IProduct[] | undefined;
  const addableProducts = products;

  return (
    <Modal
      title="Edit Order"
      open={isOpen}
      onCancel={onClose}
      width={960}
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

      {canEdit && !order.assignedBranchId && (
        <Alert
          title="No Branch Assigned"
          description="This order has no branch assigned yet. You can update customer info and delivery details, but
to add or change order items, please assign a branch first using the 'Assign Branch' button."
          type="info"
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
                { len: 11, message: "Phone must be exactly 11 digits" },
                {
                  pattern: /^01[0-9]{9}$/,
                  message:
                    "Enter a valid Bangladeshi phone number (01XXXXXXXXX)",
                },
              ]}
            >
              <Input placeholder="01XXXXXXXXX" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="customerName"
              label="Customer Name"
              rules={[
                { required: true, message: "Customer name is required" },
                { min: 3, message: "Name must be at least 3 characters" },
                { max: 100, message: "Name must be at most 100 characters" },
              ]}
            >
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
            <Form.Item
              name="deliveryAddress"
              label="Delivery Address"
              rules={[
                { min: 10, message: "Address must be at least 10 characters" },
                { max: 220, message: "Address must be at most 220 characters" },
                { required: true, message: "Delivery address is required" },
              ]}
            >
              <TextArea
                rows={2}
                placeholder="e.g., House 12, Road 5, Block B, Mirpur-10"
                showCount
                maxLength={220}
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
              <InputNumber
                min={0}
                step={1}
                value={deliveryCharge}
                onChange={(value) => setDeliveryChargeOverride(value)}
                prefix="৳"
                style={{ width: "100%" }}
                placeholder="Auto-calculated"
                disabled={!canEdit}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Pathao Location Selector */}
        <PathaoLocationSelector
          cityId={cityId}
          zoneId={zoneId}
          areaId={areaId}
          onCityChange={(id) => setCityId(id)}
          onZoneChange={(id) => setZoneId(id)}
          onAreaChange={(id) => setAreaId(id)}
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
          rowKey={(record) =>
            `${record.productId}-${record.variantId ?? "base"}`
          }
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        />

        {/* Add Product */}
        {canEdit && (
          <>
            <Form.Item label="Add Product">
              <Space
                orientation="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <Select
                  placeholder="Search and select a product to add"
                  onChange={(value: string) => {
                    setPendingProductId(value);
                    setPendingVariantId(undefined);
                  }}
                  value={pendingProductId}
                  suffixIcon={<PlusOutlined />}
                  style={{ width: "100%" }}
                  showSearch={{
                    filterOption: (input, option) =>
                      String(option?.label)
                        .toLowerCase()
                        .includes(input.toLowerCase()),
                  }}
                  options={addableProducts?.map((product) => ({
                    label: `${product.name} — ৳${Number(product.basePrice).toFixed(2)}${
                      product.variants && product.variants.length > 0
                        ? ` (${product.variants.length} variant${
                            product.variants.length > 1 ? "s" : ""
                          })`
                        : ""
                    }`,
                    value: product.id,
                  }))}
                >
                  {addableProducts?.map((product) => (
                    <Option
                      key={product.id}
                      value={product.id}
                      label={product.name}
                    >
                      {product.name} — ৳{Number(product.basePrice).toFixed(2)}
                      {product.variants && product.variants.length > 0 && (
                        <Text type="secondary">
                          {" "}
                          ({product.variants.length} variant
                          {product.variants.length > 1 ? "s" : ""})
                        </Text>
                      )}
                    </Option>
                  ))}
                </Select>

                {/* Show variant selector if pending product has variants */}
                {pendingProduct &&
                  pendingProduct.variants &&
                  pendingProduct.variants.length > 0 && (
                    <Select
                      placeholder="Select a variant"
                      onChange={(value: string) => setPendingVariantId(value)}
                      value={pendingVariantId}
                      style={{ width: "100%" }}
                    >
                      {pendingProduct.variants.map((v) => {
                        const stock = getAvailableStock(v);
                        const isOOS = stock <= 0;
                        const isLowStock = stock > 0 && stock <= 10;
                        return (
                          <Option key={v.id} value={v.id} disabled={isOOS}>
                            <span
                              style={{
                                color: isOOS
                                  ? "#ff4d4f"
                                  : isLowStock
                                    ? "#fa8c16"
                                    : undefined,
                              }}
                            >
                              {getVariantLabel(v)}
                            </span>
                          </Option>
                        );
                      })}
                    </Select>
                  )}

                {/* Confirm add button */}
                {pendingProductId && (
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleConfirmAddItem}
                    disabled={
                      !!(
                        pendingProduct?.variants &&
                        pendingProduct.variants.length > 0 &&
                        !pendingVariantId
                      )
                    }
                  >
                    {pendingProduct?.variants &&
                    pendingProduct.variants.length > 0 &&
                    !pendingVariantId
                      ? "Select a variant first"
                      : `Add ${pendingProduct?.name ?? "product"}`}
                  </Button>
                )}
              </Space>
            </Form.Item>
          </>
        )}

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
              <Text strong>৳{deliveryCharge.toFixed(2)}</Text>
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
