"use client";

import { useState } from "react";
import { Button, Space, Tag, Popconfirm, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import KTable from "@/components/ui/KTable";
import ActionBar from "@/components/ui/ActionBar";
import {
  useGetMyStoresQuery,
  useDeleteStoreMutation,
} from "@/redux/api/storeApi";
import { IStore } from "@/types/store";
import Image from "next/image";

const VendorStoresPage = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const { data, isLoading } = useGetMyStoresQuery({
    page,
    limit: size,
  });

  const [deleteStore] = useDeleteStoreMutation();

  const stores = data?.stores as IStore[];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteStore(id).unwrap();
      message.success(res.message || "Store deleted successfully!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to delete store");
    }
  };

  const columns = [
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      render: (logo: string) =>
        logo ? (
          <Image src={logo} alt="Logo" width={50} height={50} />
        ) : (
          <span>No logo</span>
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
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
      render: (record: IStore) => (
        <Space>
          <Link href={`/dashboard/stores/${record.id}/branches`}>
            <Button type="default" icon={<ShopOutlined />} size="small">
              Branches
            </Button>
          </Link>
          <Link href={`/dashboard/stores/edit/${record.id}`}>
            <Button type="primary" icon={<EditOutlined />} size="small">
              Edit
            </Button>
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this store?"
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
      <ActionBar title="My Stores">
        <Link href="/dashboard/stores/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Store
          </Button>
        </Link>
      </ActionBar>

      {stores && stores.length >= 3 && (
        <div style={{ marginBottom: "16px", color: "orange" }}>
          <strong>Note:</strong> You have reached the maximum limit of 3 stores.
        </div>
      )}

      <KTable
        loading={isLoading}
        columns={columns}
        dataSource={stores}
        pageSize={size}
        totalPages={meta?.total}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
};

export default VendorStoresPage;
