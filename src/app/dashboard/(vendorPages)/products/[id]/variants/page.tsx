"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Space,
  Table,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  Popconfirm,
  Switch,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useGetProductByIdQuery } from "@/redux/api/productApi";
import {
  useGetProductVariantsQuery,
  useCreateProductVariantMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} from "@/redux/api/productVariantApi";
import {
  IProduct,
  IProductVariant,
  IUpdateProductVariantInput,
} from "@/types/product";
import { IAttributeValue } from "@/types/attribute";
import Link from "next/link";

const ProductVariantsPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: productData, isLoading: loadingProduct } =
    useGetProductByIdQuery(productId, { skip: !productId });

  const { data: variantsData, isLoading: loadingVariants } =
    useGetProductVariantsQuery(productId, { skip: !productId });

  const [createVariant, { isLoading: isCreating }] =
    useCreateProductVariantMutation();
  const [updateVariant, { isLoading: isUpdating }] =
    useUpdateProductVariantMutation();
  const [deleteVariant] = useDeleteProductVariantMutation();

  const product = productData as IProduct;
  const variants = variantsData as IProductVariant[];

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<IProductVariant | null>(
    null,
  );

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreateVariant = async (values: {
    sku: string;
    price: number;
    comparePrice?: number;
    attributeValueIds: string[];
  }) => {
    try {
      const res = await createVariant({ productId, ...values }).unwrap();
      message.success(res.message || "Variant created successfully!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create variant");
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleOpenEditModal = (variant: IProductVariant) => {
    setEditingVariant(variant);
    editForm.setFieldsValue({
      sku: variant.sku,
      price:
        variant.price !== null && variant.price !== undefined
          ? Number(variant.price)
          : undefined,
      comparePrice:
        variant.comparePrice !== null && variant.comparePrice !== undefined
          ? Number(variant.comparePrice)
          : null,
      isActive: variant.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleEditVariant = async (values: {
    sku: string;
    price: number;
    comparePrice?: number;
    isActive: boolean;
  }) => {
    if (!editingVariant) return;
    try {
      const updateData: IUpdateProductVariantInput = {
        sku: values.sku,
        price: values.price !== undefined ? Number(values.price) : undefined,
        comparePrice:
          values.comparePrice !== undefined && values.comparePrice !== null
            ? Number(values.comparePrice)
            : null,
        isActive: values.isActive,
      };
      const res = await updateVariant({
        id: editingVariant.id,
        data: updateData,
      }).unwrap();
      message.success(res.message || "Variant updated successfully!");
      setIsEditModalOpen(false);
      setEditingVariant(null);
      editForm.resetFields();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to update variant");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteVariant(id).unwrap();
      message.success(res.message || "Variant deleted successfully!");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to delete variant");
    }
  };

  if (loadingProduct || loadingVariants) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const columns = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Attributes",
      key: "attributes",
      render: (record: IProductVariant) => (
        <Space wrap>
          {record.variantAttributes?.map((va) => (
            <Tag key={va.attributeValueId} color="blue">
              {va.attributeValue?.attribute?.name}: {va.attributeValue?.value}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Price",
      key: "price",
      render: (record: IProductVariant) => (
        <div>
          <div>৳{Number(record.price).toFixed(2)}</div>
          {record.comparePrice && (
            <div
              style={{
                fontSize: "12px",
                color: "#888",
                textDecoration: "line-through",
              }}
            >
              ৳{Number(record.comparePrice).toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Stock",
      key: "stock",
      render: (record: IProductVariant) => {
        const totalStock =
          record.inventories?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
        return <span>{totalStock} units</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (record: IProductVariant) => (
        <Space orientation="vertical" size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            block
            onClick={() => handleOpenEditModal(record)}
          >
            Edit
          </Button>
          <Link
            href={`/dashboard/products/${productId}/variants/${record.id}/inventory`}
          >
            <Button type="default" size="small" block>
              Manage Inventory
            </Button>
          </Link>
          <Popconfirm
            title="Delete this variant?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small" block>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Back to Product
        </Button>
      </Space>

      <Card
        title={`Variants for: ${product.name}`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Variant
          </Button>
        }
      >
        <>
          {product.productAttributes &&
            product.productAttributes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Available Attributes:</strong>{" "}
                {product.productAttributes.map((pa) => (
                  <Tag key={pa.attributeId} color="blue" style={{ margin: 4 }}>
                    {pa.attribute?.name} ({pa.attribute?.values?.length || 0}{" "}
                    values)
                  </Tag>
                ))}
              </div>
            )}

          <Table
            columns={columns}
            dataSource={variants || []}
            rowKey="id"
            pagination={false}
            loading={loadingVariants}
            scroll={{ x: "max-content" }}
          />
        </>
      </Card>

      {/* ── Create Modal ──────────────────────────────────────────────────── */}
      <Modal
        title="Create Product Variant"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateVariant}
        >
          <Form.Item
            name="sku"
            label="SKU (Stock Keeping Unit)"
            rules={[{ required: true, message: "Please enter SKU" }]}
          >
            <Input placeholder="e.g., PROD-RED-L" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Selling Price (৳)"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber
              placeholder="0.00"
              style={{ width: "100%" }}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="comparePrice"
            label="Compare At Price (৳) — Original / MRP"
            dependencies={["price"]}
            validateTrigger="onBlur"
            rules={[
              ({}) => ({
                validator(_, value) {
                  if (value === undefined || value === null) {
                    return Promise.resolve();
                  }
                  const price = editForm.getFieldValue("price");
                  if (price === undefined || price === null) {
                    return Promise.resolve();
                  }
                  if (Number(value) > Number(price)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Compare price must be greater than the selling price",
                    ),
                  );
                },
              }),
            ]}
          >
            <InputNumber
              placeholder="0.00"
              style={{ width: "100%" }}
              min={0}
              step={0.01}
            />
          </Form.Item>

          {product.productAttributes &&
            product.productAttributes.length > 0 && (
              <Form.Item name="attributeValueIds" label="Attribute Values">
                <Select
                  mode="multiple"
                  placeholder="Select attribute values"
                  style={{ width: "100%" }}
                >
                  {product.productAttributes?.map((pa) => (
                    <Select.OptGroup
                      key={pa.attributeId}
                      label={pa.attribute?.name}
                    >
                      {pa.attribute?.values?.map((val: IAttributeValue) => (
                        <Select.Option key={val.id} value={val.id}>
                          {val.value}
                          {val.colorCode && (
                            <span
                              style={{
                                display: "inline-block",
                                width: 16,
                                height: 16,
                                backgroundColor: val.colorCode,
                                border: "1px solid #ddd",
                                marginLeft: 8,
                                borderRadius: 2,
                              }}
                            />
                          )}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  ))}
                </Select>
              </Form.Item>
            )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create Variant
              </Button>
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  createForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      <Modal
        title={`Edit Variant — ${editingVariant?.sku ?? ""}`}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingVariant(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditVariant}>
          {/* Read-only attributes info */}
          {editingVariant?.variantAttributes &&
            editingVariant.variantAttributes.length > 0 && (
              <Form.Item label="Attributes (cannot be changed)">
                <Space wrap>
                  {editingVariant.variantAttributes.map((va) => (
                    <Tag key={va.attributeValueId} color="blue">
                      {va.attributeValue?.attribute?.name}:{" "}
                      {va.attributeValue?.value}
                    </Tag>
                  ))}
                </Space>
              </Form.Item>
            )}

          <Form.Item
            name="sku"
            label="SKU (Stock Keeping Unit)"
            rules={[{ required: true, message: "Please enter SKU" }]}
          >
            <Input placeholder="e.g., PROD-RED-L" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Selling Price (৳)"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber
              placeholder="0.00"
              style={{ width: "100%" }}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="comparePrice"
            label="Compare At Price (৳) — Original / MRP"
            dependencies={["price"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value > getFieldValue("price")) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "Compare price must be greater than the selling price",
                    ),
                  );
                },
              }),
            ]}
          >
            <InputNumber
              placeholder="0.00"
              style={{ width: "100%" }}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingVariant(null);
                  editForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductVariantsPage;
