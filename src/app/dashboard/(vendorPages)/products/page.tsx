"use client";

import { useState } from "react";
import { Button, Space, Tag, Input, Popconfirm, message, Image } from "antd";
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
  useGetAllProductsQuery,
  useDeleteProductMutation,
} from "@/redux/api/productApi";
import { IProduct } from "@/types/product";
import useDebounce from "@/hooks/useDebounce";

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading } = useGetAllProductsQuery({
    page,
    limit: size,
    searchTerm: debouncedSearchTerm,
  });

  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.products as IProduct[];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteProduct(id).unwrap();
      message.success(res.message || "Product deleted successfully!");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to delete product");
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "media",
      key: "media",
      render: (media: IProduct["media"]) => {
        const primaryImage =
          media?.find((m) => m.isPrimary)?.mediaUrl || media?.[0]?.mediaUrl;
        return primaryImage ? (
          <Image
            src={primaryImage}
            alt="Product"
            width={60}
            height={60}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            No Image
          </div>
        );
      },
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: IProduct) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record.category?.name} • {record.brand?.name}
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (basePrice: number, record: IProduct) => (
        <div>
          <div style={{ fontWeight: 500 }}>${basePrice}</div>
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
      title: "Variants",
      dataIndex: "variants",
      key: "variants",
      render: (variants: IProduct["variants"]) => variants?.length || 0,
    },
    {
      title: "Status",
      key: "status",
      render: (record: IProduct) => (
        <Space orientation="vertical" size="small">
          <Tag color={record.isActive ? "green" : "red"}>
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
          <Tag color={record.isPublished ? "blue" : "orange"}>
            {record.isPublished ? "Published" : "Draft"}
          </Tag>
          {record.isFeatured && <Tag color="purple">Featured</Tag>}
        </Space>
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
      render: (record: IProduct) => (
        <Space orientation="vertical" size="small">
          <Link href={`/dashboard/products/${record.id}`}>
            <Button type="default" icon={<EyeOutlined />} size="small" block>
              View
            </Button>
          </Link>
          <Link href={`/dashboard/products/edit/${record.id}`}>
            <Button type="primary" icon={<EditOutlined />} size="small" block>
              Edit
            </Button>
          </Link>
          <Popconfirm
            title="Delete this product?"
            description="This will soft delete the product. Are you sure?"
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

  const onPaginationChange = (page: number, pageSize: number) => {
    setPage(page);
    setSize(pageSize);
  };

  return (
    <div>
      <ActionBar title="My Products">
        <Input
          placeholder="Search products..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Link href="/dashboard/products/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Product
          </Button>
        </Link>
      </ActionBar>

      <KTable
        loading={isLoading}
        columns={columns}
        dataSource={products}
        pageSize={size}
        totalPages={meta?.total}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
};

export default ProductsPage;
