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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useGetProductByIdQuery } from "@/redux/api/productApi";
import {
  useGetProductVariantsQuery,
  useCreateProductVariantMutation,
  useDeleteProductVariantMutation,
} from "@/redux/api/productVariantApi";
import { IProduct, IProductVariant } from "@/types/product";
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
  const [deleteVariant] = useDeleteProductVariantMutation();

  const product = productData as IProduct;
  const variants = variantsData as IProductVariant[];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateVariant = async (values: {
    sku: string;
    price: number;
    comparePrice?: number;
    attributeValueIds: string[];
  }) => {
    try {
      const res = await createVariant({
        productId,
        ...values,
      }).unwrap();
      message.success(res.message || "Variant created successfully!");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create variant");
    }
  };

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
      dataIndex: "price",
      key: "price",
      render: (price: number, record: IProductVariant) => (
        <div>
          <div>${price}</div>
          {record.comparePrice && (
            <div
              style={{
                fontSize: "12px",
                color: "#888",
                textDecoration: "line-through",
              }}
            >
              ${record.comparePrice}
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
          <Link
            href={`/dashboard/products/${productId}/variants/${record.id}/inventory`}
          >
            <Button type="default" size="small" block>
              Manage Inventory
            </Button>
          </Link>
          <Popconfirm
            title="Delete this variant?"
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
            onClick={() => setIsModalOpen(true)}
            disabled={
              !product.productAttributes ||
              product.productAttributes.length === 0
            }
          >
            Create Variant
          </Button>
        }
      >
        {!product.productAttributes ||
        product.productAttributes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            <p>This product has no attributes configured.</p>
            <p>Please edit the product and add attributes first.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <strong>Available Attributes:</strong>{" "}
              {product.productAttributes.map((pa) => (
                <Tag key={pa.attributeId} color="blue" style={{ margin: 4 }}>
                  {pa.attribute?.name} ({pa.attribute?.values?.length || 0}{" "}
                  values)
                </Tag>
              ))}
            </div>

            <Table
              columns={columns}
              dataSource={variants || []}
              rowKey="id"
              pagination={false}
              loading={loadingVariants}
            />
          </>
        )}
      </Card>

      <Modal
        title="Create Product Variant"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateVariant}>
          <Form.Item
            name="sku"
            label="SKU (Stock Keeping Unit)"
            rules={[{ required: true, message: "Please enter SKU" }]}
          >
            <Input placeholder="e.g., PROD-RED-L" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price ($)"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber
              placeholder="0.00"
              style={{ width: "100%" }}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item name="comparePrice" label="Compare At Price ($)">
            <InputNumber
              placeholder="0.00"
              style={{ width: "100%" }}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="attributeValueIds"
            label="Attribute Values"
            rules={[
              {
                required: true,
                message: "Please select at least one attribute value",
              },
            ]}
          >
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

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Create Variant
              </Button>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
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
