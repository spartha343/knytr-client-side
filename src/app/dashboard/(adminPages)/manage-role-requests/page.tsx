"use client";

import { useState, useEffect } from "react";
import { Input, Select, Button, message, Tag, Popconfirm, Alert } from "antd";
import KTable from "@/components/ui/KTable";
import KModal from "@/components/ui/KModal";
import {
  RoleRequest,
  useGetRoleRequestsQuery,
  useUpdateRoleRequestMutation,
} from "@/redux/api/roleRequestsApi";
import { useDebounced } from "@/redux/hooks";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

const ManageRoleRequests = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<RoleRequest | null>(null);

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounced({
    searchQuery: search,
    delay: 500,
  });

  // ============================================
  // API HOOKS
  // ============================================

  const { data, isLoading, error, refetch } = useGetRoleRequestsQuery({
    page,
    limit,
    searchTerm: debouncedSearch,
    status,
    sortBy,
    sortOrder,
  });

  const [updateRoleRequest] = useUpdateRoleRequestMutation();

  // ============================================
  // ERROR HANDLING
  // ============================================

  useEffect(() => {
    if (error) {
      // Proper type checking for error object
      const errorMessage =
        error && typeof error === "object" && "status" in error
          ? `Failed to load role requests (Error ${error.status})`
          : "Failed to load role requests";

      message.error(errorMessage);
    }
  }, [error]);

  // ============================================
  // HANDLERS
  // ============================================

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
    } catch (err) {
      // Extract error message safely
      const errorMsg =
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data
          ? String(err.data.message)
          : "Failed to update role request";

      message.error(errorMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================================
  // TABLE CONFIGURATION
  // ============================================

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
              disabled={!!updatingId}
            >
              <Button
                type="primary"
                size="small"
                loading={updatingId === record.id}
                disabled={!!updatingId && updatingId !== record.id}
              >
                Approve
              </Button>
            </Popconfirm>
            <Button
              style={{ marginLeft: "10px" }}
              danger
              size="small"
              loading={updatingId === record.id}
              disabled={!!updatingId && updatingId !== record.id}
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

  // ============================================
  // MODAL CONTENT (Extracted for type safety)
  // ============================================

  const renderModalContent = () => {
    return (
      <div>
        <p>Are you sure you want to reject this role request?</p>
        {updatingId && <p style={{ color: "orange" }}>Processing...</p>}
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div>
      <h1 style={{ margin: "20px 0" }}>Manage Role Requests</h1>
      {error ? (
        <Alert
          title="Error Loading Data"
          description="There was a problem loading role requests. Please try refreshing."
          type="error"
          showIcon
          closable
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
          style={{ marginBottom: 20 }}
        />
      ) : (
        <></>
      )}

      {/* Filters */}
      <div style={{ margin: "20px 0", display: "flex", gap: 10 }}>
        <Input.Search
          placeholder="Search by email or role"
          allowClear
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          style={{ width: 300 }}
          disabled={isLoading}
        />

        <Select
          placeholder="Filter by status"
          allowClear
          style={{ width: 200 }}
          value={status}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
          disabled={isLoading}
        >
          <Option value="PENDING">PENDING</Option>
          <Option value="APPROVED">APPROVED</Option>
          <Option value="REJECTED">REJECTED</Option>
        </Select>
      </div>

      {/* Table */}
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
        onTableChange={(pagination, filters, sorter) => {
          // Handle sorter with proper type checking
          if (sorter && !Array.isArray(sorter)) {
            if (sorter.field && sorter.order) {
              setSortBy(String(sorter.field));
              setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
            }
          } else if (Array.isArray(sorter) && sorter.length > 0) {
            const firstSorter = sorter[0];
            if (firstSorter && firstSorter.field && firstSorter.order) {
              setSortBy(String(firstSorter.field));
              setSortOrder(firstSorter.order === "ascend" ? "asc" : "desc");
            }
          }
        }}
      />

      {/* Confirmation Modal */}
      <KModal
        isOpen={modalOpen}
        closeModal={() => {
          if (!updatingId) {
            setModalOpen(false);
            setSelected(null);
          }
        }}
        title="Confirm Rejection"
        handleOk={() => selected && handleUpdateStatus(selected, "REJECTED")}
        showCancelButton={!updatingId}
        showOkButton={!updatingId}
      >
        {renderModalContent()}
      </KModal>
    </div>
  );
};

export default ManageRoleRequests;
