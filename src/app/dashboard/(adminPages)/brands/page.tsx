"use client";

import { useState } from "react";
import { Button, Space, Tag, Input, Popconfirm, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import KTable from "@/components/ui/KTable";
import ActionBar from "@/components/ui/ActionBar";
import {
  useGetAllBrandsQuery,
  useDeleteBrandMutation,
} from "@/redux/api/brandApi";
import { IBrand } from "@/types/brand";
import Image from "next/image";
import useDebounce from "@/hooks/useDebounce";

const BrandsPage = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading } = useGetAllBrandsQuery({
    page,
    limit: size,
    searchTerm: debouncedSearchTerm,
  });

  const [deleteBrand] = useDeleteBrandMutation();

  const brands = data?.brands as IBrand[];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteBrand(id).unwrap();
      message.success(res.message || "Brand deleted successfully!");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to delete brand");
    }
  };

  const columns = [
    {
      title: "Logo",
      dataIndex: "logoUrl",
      key: "logoUrl",
      render: (logoUrl: string) =>
        logoUrl ? (
          <Image src={logoUrl} alt="Brand Logo" width={50} height={50} />
        ) : (
          <span>No logo</span>
        ),
    },
    {
      title: "Brand Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Website",
      dataIndex: "websiteUrl",
      key: "websiteUrl",
      render: (websiteUrl: string) =>
        websiteUrl ? (
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
            Visit
          </a>
        ) : (
          "N/A"
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
      render: (record: IBrand) => (
        <Space>
          <Link href={`/dashboard/brands/edit/${record.id}`}>
            <Button type="primary" icon={<EditOutlined />} size="small">
              Edit
            </Button>
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this brand?"
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
      <ActionBar title="Brands">
        <Input
          placeholder="Search brands..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Link href="/dashboard/brands/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Brand
          </Button>
        </Link>
      </ActionBar>

      <KTable
        loading={isLoading}
        columns={columns}
        dataSource={brands}
        pageSize={size}
        totalPages={meta?.total}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
};

export default BrandsPage;
