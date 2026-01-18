"use client";

import { useState } from "react";
import {
  Select,
  Button,
  Spin,
  Alert,
  Typography,
  Space,
  message,
  Table,
  Tag,
} from "antd";
import { useRequestableRolesAndPreviousRequests } from "@/hooks/useRequestableRolesAndPreviousRequests";
import { useAppSelector } from "@/redux/hooks";
import axiosInstanceWithToken from "@/helpers/axios/axiosInstanceWithToken";

const { Title, Text } = Typography;

const RequestRolePage = () => {
  const { requestableRoles, previousRequests, loading, error, refetch } =
    useRequestableRolesAndPreviousRequests();
  const { dbUser } = useAppSelector((state) => state.auth);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRequestRole = async () => {
    if (!selectedRoleId) {
      message.warning("Please select a role to request!");
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstanceWithToken.post("/roles/request", {
        roleId: selectedRoleId,
      });
      message.success("Role requested successfully!");
      setSelectedRoleId(null);
      await refetch();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to request role");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spin tip="Loading roles..." fullscreen />;

  if (error)
    return <Alert type="error" message="Error" description={error} showIcon />;

  return (
    <Space orientation="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>Request a Role</Title>

      <div>
        <Title level={4}>Your Current Roles:</Title>
        {dbUser?.roles.length ? (
          <Space>
            {dbUser.roles.map((role) => (
              <Text key={role}>{role}</Text>
            ))}
          </Space>
        ) : (
          <Text>No roles assigned yet.</Text>
        )}
      </div>

      <div>
        <Title level={4}>Requestable Roles:</Title>
        <Select
          style={{ width: 300 }}
          placeholder={
            requestableRoles?.length ? "Select a role" : "No roles available"
          }
          value={selectedRoleId || undefined}
          disabled={!requestableRoles?.length}
          onChange={(value) => setSelectedRoleId(value)}
          options={requestableRoles?.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
        />
        <Button
          type="primary"
          onClick={handleRequestRole}
          loading={submitting}
          disabled={!requestableRoles?.length}
          style={{ marginLeft: 10 }}
        >
          Request Role
        </Button>
      </div>

      <div>
        <Title level={4}>Previous Requests:</Title>
        <Table
          locale={{ emptyText: "No role requests yet" }}
          dataSource={previousRequests}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "Role", dataIndex: ["role", "name"], key: "role" },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status: string) => {
                const statusMap: Record<
                  string,
                  { color: string; label: string }
                > = {
                  APPROVED: { color: "green", label: "Approved" },
                  REJECTED: { color: "red", label: "Rejected" },
                  PENDING: { color: "orange", label: "Pending Approval" },
                };

                const cfg = statusMap[status] || {
                  color: "default",
                  label: status,
                };

                return <Tag color={cfg.color}>{cfg.label}</Tag>;
              },
            },
            {
              title: "Requested At",
              dataIndex: "requestedAt",
              key: "requestedAt",
              render: (date: string) => new Date(date).toLocaleString(),
            },
          ]}
        />
      </div>
    </Space>
  );
};

export default RequestRolePage;
