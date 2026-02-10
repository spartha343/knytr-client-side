"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Space,
  Tag,
  Popconfirm,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import KTable from "@/components/ui/KTable";
import {
  useGetAttributeByIdQuery,
  useCreateAttributeValueMutation,
  useDeleteAttributeValueMutation,
} from "@/redux/api/attributeApi";
import { IAttribute, IAttributeValue } from "@/types/attribute";
import Link from "next/link";

const ViewAttributePage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: attributeData, isLoading } = useGetAttributeByIdQuery(id, {
    skip: !id,
  });

  const attribute = attributeData as IAttribute;

  const [createAttributeValue, { isLoading: isCreating }] =
    useCreateAttributeValueMutation();
  const [deleteAttributeValue] = useDeleteAttributeValueMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const colorCode = Form.useWatch("colorCode", form);

  const handleCreateValue = async (values: {
    value: string;
    colorCode?: string;
  }) => {
    try {
      const res = await createAttributeValue({
        attributeId: id,
        value: values.value,
        colorCode: values.colorCode,
      }).unwrap();
      message.success(res.message || "Attribute value created successfully!");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create attribute value");
    }
  };

  const handleDelete = async (valueId: string) => {
    try {
      const res = await deleteAttributeValue(valueId).unwrap();
      message.success(res.message || "Attribute value deleted successfully!");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to delete attribute value");
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!attribute) {
    return <div>Attribute not found</div>;
  }

  const columns = [
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (value: string, record: IAttributeValue) => (
        <Space>
          {record.colorCode && (
            <div
              style={{
                width: 24,
                height: 24,
                backgroundColor: record.colorCode,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            />
          )}
          <span>{value}</span>
        </Space>
      ),
    },
    {
      title: "Color Code",
      dataIndex: "colorCode",
      key: "colorCode",
      render: (colorCode: string) => colorCode || "—",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (record: IAttributeValue) => (
        <Space>
          <Popconfirm
            title="Delete this value?"
            description="This value cannot be deleted if it's being used by product variants."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
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
          Back
        </Button>
        <Link href={`/dashboard/attributes/edit/${id}`}>
          <Button type="primary" icon={<EditOutlined />}>
            Edit Attribute
          </Button>
        </Link>
      </Space>

      <Card title="Attribute Details" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div>
              <strong>Name:</strong> {attribute.name}
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div>
              <strong>Display Name:</strong> {attribute.displayName || "—"}
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div>
              <strong>Type:</strong>{" "}
              <Tag
                color={
                  attribute.type === "color"
                    ? "blue"
                    : attribute.type === "image"
                      ? "green"
                      : "default"
                }
              >
                {attribute.type.toUpperCase()}
              </Tag>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div>
              <strong>Status:</strong>{" "}
              <Tag color={attribute.isActive ? "green" : "red"}>
                {attribute.isActive ? "Active" : "Inactive"}
              </Tag>
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        title={`Attribute Values (${attribute.values?.length || 0})`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Value
          </Button>
        }
      >
        <KTable
          loading={false}
          columns={columns}
          dataSource={attribute.values || []}
          pageSize={100}
          showPagination={false}
        />
      </Card>

      <Modal
        title="Add Attribute Value"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateValue}>
          <Form.Item
            name="value"
            label="Value"
            rules={[{ required: true, message: "Please enter a value" }]}
          >
            <Input placeholder="e.g., Red, Small, Cotton" />
          </Form.Item>

          {attribute.type === "color" && (
            <Form.Item
              name="colorCode"
              label="Color Code (Optional)"
              rules={[
                {
                  pattern: /^#[0-9A-Fa-f]{6}$/,
                  message: "Invalid hex color code (e.g., #FF0000)",
                },
              ]}
            >
              <Input
                placeholder="#FF0000"
                prefix={
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: colorCode || "#fff",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                    }}
                  />
                }
              />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreating}>
                Add Value
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

export default ViewAttributePage;
