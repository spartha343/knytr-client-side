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
  useGetAllCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/redux/api/categoryApi";
import { ICategory } from "@/types/category";
import Image from "next/image";
import useDebounce from "@/hooks/useDebounce";

const CategoriesPage = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading } = useGetAllCategoriesQuery({
    page,
    limit: size,
    searchTerm: debouncedSearchTerm,
  });

  const [deleteCategory] = useDeleteCategoryMutation();

  const categories = data?.categories as ICategory[];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteCategory(id).unwrap();
      message.success(res.message || "Category deleted successfully!");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to delete category");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string) =>
        imageUrl ? (
          <Image src={imageUrl} alt="Category" width={50} height={50} />
        ) : (
          <span>No image</span>
        ),
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Parent Category",
      dataIndex: "parent",
      key: "parent",
      render: (parent: { name: string } | null) => parent?.name || "None",
    },
    {
      title: "Children",
      dataIndex: "children",
      key: "children",
      render: (children: ICategory[]) => children?.length || 0,
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
      render: (record: ICategory) => (
        <Space>
          <Link href={`/dashboard/categories/edit/${record.id}`}>
            <Button type="primary" icon={<EditOutlined />} size="small">
              Edit
            </Button>
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this category?"
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
      <ActionBar title="Categories">
        <Input
          placeholder="Search categories..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Link href="/dashboard/categories/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Category
          </Button>
        </Link>
      </ActionBar>

      <KTable
        loading={isLoading}
        columns={columns}
        dataSource={categories}
        pageSize={size}
        totalPages={meta?.total}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
};

export default CategoriesPage;
