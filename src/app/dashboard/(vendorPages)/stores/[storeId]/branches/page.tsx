"use client";

import { useState } from "react";
import { Button, Space, Tag, Popconfirm, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import KTable from "@/components/ui/KTable";
import ActionBar from "@/components/ui/ActionBar";
import {
  useGetBranchesByStoreQuery,
  useDeleteBranchMutation,
} from "@/redux/api/branchApi";
import { IBranch, IAddress } from "@/types/branch";

const StoreBranchesPage = () => {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.storeId as string;

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const { data, isLoading } = useGetBranchesByStoreQuery({
    storeId,
    page,
    limit: size,
  });

  const [deleteBranch] = useDeleteBranchMutation();

  const branches = data?.branches as IBranch[];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteBranch(id).unwrap();
      message.success(res.message || "Branch deleted successfully!");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to delete branch");
    }
  };

  const columns = [
    {
      title: "Branch Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Contact Phone",
      dataIndex: "contactPhone",
      key: "contactPhone",
      render: (phone: string) => phone || "N/A",
    },
    {
      title: "City",
      dataIndex: "address",
      key: "city",
      render: (address: IAddress | undefined) => address?.city || "N/A",
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
          <Link
            href={`/dashboard/stores/${storeId}/branches/edit/${record.id}`}
          >
            <Button type="primary" icon={<EditOutlined />} size="small">
              Edit
            </Button>
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this branch?"
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
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push("/dashboard/stores")}
        style={{ marginBottom: "16px" }}
      >
        Back to Stores
      </Button>

      <ActionBar title="Store Branches">
        <Link href={`/dashboard/stores/${storeId}/branches/create`}>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Branch
          </Button>
        </Link>
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

export default StoreBranchesPage;
