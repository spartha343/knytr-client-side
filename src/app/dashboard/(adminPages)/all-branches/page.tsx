"use client";

import { useState } from "react";
import { Button, Space, Tag, Input } from "antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import KTable from "@/components/ui/KTable";
import ActionBar from "@/components/ui/ActionBar";
import { useGetAllBranchesQuery } from "@/redux/api/branchApi";
import { IBranch } from "@/types/branch";
import useDebounce from "@/hooks/useDebounce";

const AdminBranchesPage = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading } = useGetAllBranchesQuery({
    page,
    limit: size,
    searchTerm: debouncedSearchTerm,
  });

  const branches = data?.branches as IBranch[];
  const meta = data?.meta;

  const columns = [
    {
      title: "Branch Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Store Name",
      dataIndex: "store",
      key: "store",
      render: (store: { name: string } | undefined) => store?.name || "N/A",
    },
    {
      title: "Vendor Email",
      dataIndex: "store",
      key: "vendor",
      render: (store: { vendor?: { email: string } } | undefined) =>
        store?.vendor?.email || "N/A",
    },
    {
      title: "City",
      dataIndex: "address",
      key: "city",
      render: (address: { city: string } | undefined) => address?.city || "N/A",
    },
    {
      title: "Contact Phone",
      dataIndex: "contactPhone",
      key: "contactPhone",
      render: (phone: string) => phone || "N/A",
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
      render: (record: IBranch) => (
        <Space>
          <Link href={`/dashboard/all-branches/${record.id}`}>
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
      <ActionBar title="All Branches">
        <Input
          placeholder="Search branches..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </ActionBar>

      <KTable
        loading={isLoading}
        columns={columns}
        dataSource={branches}
        pageSize={size}
        totalPages={meta?.total}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
};

export default AdminBranchesPage;
