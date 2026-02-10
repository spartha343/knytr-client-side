"use client";

import { useState } from "react";
import { Button, Space, Tag, Input } from "antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import KTable from "@/components/ui/KTable";
import ActionBar from "@/components/ui/ActionBar";
import { useGetAllStoresQuery } from "@/redux/api/storeApi";
import { IStore } from "@/types/store";
import Image from "next/image";
import useDebounce from "@/hooks/useDebounce";

const AdminStoresPage = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading } = useGetAllStoresQuery({
    page,
    limit: size,
    searchTerm: debouncedSearchTerm,
  });

  const stores = data?.stores as IStore[];
  const meta = data?.meta;

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
      title: "Store Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Vendor Email",
      dataIndex: "vendor",
      key: "vendor",
      render: (vendor: { email: string }) => vendor?.email || "N/A",
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
          <Link href={`/dashboard/all-stores/${record.id}`}>
            <Button type="default" icon={<EyeOutlined />} size="small">
              View
            </Button>
          </Link>
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
      <ActionBar title="All Stores">
        <Input
          placeholder="Search stores..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </ActionBar>

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

export default AdminStoresPage;
