"use client";

import { useState } from "react";
import { Button, Space, Tag, Input, Popconfirm, message, Badge } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import KTable from "@/components/ui/KTable";
import ActionBar from "@/components/ui/ActionBar";
import {
  useGetAllAttributesQuery,
  useDeleteAttributeMutation,
} from "@/redux/api/attributeApi";
import { IAttribute } from "@/types/attribute";
import useDebounce from "@/hooks/useDebounce";

const AttributesPage = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading } = useGetAllAttributesQuery({
    page,
    limit: size,
    searchTerm: debouncedSearchTerm,
  });

  const [deleteAttribute] = useDeleteAttributeMutation();

  const attributes = data?.attributes as IAttribute[];
  const meta = data?.meta as { page: number; limit: number; total: number };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteAttribute(id).unwrap();
      message.success(res.message || "Attribute deleted successfully!");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to delete attribute");
    }
  };

  const columns = [
    {
      title: "Attribute Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: IAttribute) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.displayName && (
            <div style={{ fontSize: "12px", color: "#888" }}>
              {record.displayName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag
          color={
            type === "color" ? "blue" : type === "image" ? "green" : "default"
          }
        >
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Values",
      dataIndex: "values",
      key: "values",
      render: (values: IAttribute["values"]) => (
        <Badge count={values?.length || 0} showZero color="blue" />
      ),
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
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (record: IAttribute) => (
        <Space>
          <Link href={`/dashboard/attributes/${record.id}`}>
            <Button type="default" icon={<EyeOutlined />} size="small">
              View
            </Button>
          </Link>
          <Link href={`/dashboard/attributes/edit/${record.id}`}>
            <Button type="primary" icon={<EditOutlined />} size="small">
              Edit
            </Button>
          </Link>
          <Popconfirm
            title="Delete this attribute?"
            description="This will also delete all attribute values. Are you sure?"
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

  const onPaginationChange = (page: number, pageSize: number) => {
    setPage(page);
    setSize(pageSize);
  };

  return (
    <div>
      <ActionBar title="Manage Attributes">
        <Input
          placeholder="Search attributes..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Link href="/dashboard/attributes/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Attribute
          </Button>
        </Link>
      </ActionBar>

      <KTable
        loading={isLoading}
        columns={columns}
        dataSource={attributes}
        pageSize={size}
        totalPages={meta?.total}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
};

export default AttributesPage;
