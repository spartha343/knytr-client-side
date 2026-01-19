"use client";

import { useState } from "react";
import { Input, Select, Button, message, Tag, Popconfirm } from "antd";
import KTable from "@/components/ui/KTable";
import KModal from "@/components/ui/KModal";
import {
  RoleRequest,
  useGetRoleRequestsQuery,
  useUpdateRoleRequestMutation,
} from "@/redux/api/roleRequestsApi";
import { useDebounced } from "@/redux/hooks";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";

const { Option } = Select;

const ManageRoleRequests = () => {
  // pagination & filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<RoleRequest | null>(null);

  const debouncedSearch = useDebounced({
    searchQuery: search,
    delay: 500,
  });

  const { data, isLoading } = useGetRoleRequestsQuery({
    page,
    limit,
    searchTerm: debouncedSearch,
    status,
    sortBy,
    sortOrder,
  });

  const [updateRoleRequest] = useUpdateRoleRequestMutation();

  const handleUpdateStatus = async (
    request: RoleRequest,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    try {
      setUpdatingId(request.id);
      await updateRoleRequest({
        id: request.id,
        status: newStatus,
      }).unwrap();

      message.success(`Request ${newStatus.toLowerCase()} successfully`);
      setModalOpen(false);
      setSelected(null);
    } catch {
      message.error("Failed to update role request");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: ColumnsType<RoleRequest> = [
    {
      title: "User Email",
      dataIndex: ["user", "email"],
      sorter: true,
    },
    {
      title: "Role",
      dataIndex: ["role", "name"],
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: true,
      render: (status) => {
        const color =
          status === "PENDING"
            ? "orange"
            : status === "APPROVED"
              ? "green"
              : "red";

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Requested At",
      dataIndex: "createdAt",
      sorter: true,
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      title: "Actions",
      render: (_, record) =>
        record.status === "PENDING" ? (
          <div className="flex gap-2">
            <Popconfirm
              title="Approve this role request?"
              onConfirm={() => handleUpdateStatus(record, "APPROVED")}
            >
              <Button
                type="primary"
                size="small"
                loading={updatingId === record.id}
              >
                Approve
              </Button>
            </Popconfirm>
            <Button
              style={{
                marginLeft: "10px",
              }}
              danger
              size="small"
              loading={updatingId === record.id}
              onClick={() => {
                setSelected(record);
                setModalOpen(true);
              }}
            >
              Reject
            </Button>
          </div>
        ) : (
          <Tag color="default">No actions</Tag>
        ),
    },
  ];

  return (
    <div>
      <h1
        style={{
          margin: "20px 0",
        }}
      >
        Manage Role Requests
      </h1>

      <div
        style={{
          margin: "20px 0",
        }}
      >
        <Input.Search
          placeholder="Search by role"
          allowClear
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          style={{ width: 300 }}
        />

        <Select
          placeholder="Status"
          allowClear
          style={{ width: 200 }}
          value={status}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
        >
          <Option value="PENDING">PENDING</Option>
          <Option value="APPROVED">APPROVED</Option>
          <Option value="REJECTED">REJECTED</Option>
        </Select>
      </div>

      <KTable
        loading={isLoading}
        columns={columns}
        dataSource={data?.data ?? []}
        pageSize={limit}
        totalPages={data?.meta.total ?? 0}
        showSizeChanger
        rowKey={(record: RoleRequest) => record.id}
        onPaginationChange={(p, l) => {
          setPage(p);
          setLimit(l);
        }}
        onTableChange={(
          _: TablePaginationConfig,
          __,
          sorter: SorterResult<RoleRequest>,
        ) => {
          if (sorter.field && sorter.order) {
            setSortBy(String(sorter.field));
            setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
          }
        }}
      />

      <KModal
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        title="Confirm Rejection"
        handleOk={() => selected && handleUpdateStatus(selected, "REJECTED")}
      >
        <p>Are you sure you want to reject this role request?</p>
      </KModal>
    </div>
  );
};

export default ManageRoleRequests;
