"use client";

import { useEffect, useMemo, useState } from "react";
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
import dayjs from "dayjs";

const { Title, Text } = Typography;

const RequestRolePage = () => {
  const { requestableRoles, previousRequests, loading, error, refetch } =
    useRequestableRolesAndPreviousRequests();
  const { dbUser } = useAppSelector((state) => state.auth);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * ✅ Hooks MUST be declared before any return
   */

  const pendingRoleIds = useMemo(
    () =>
      new Set(
        previousRequests
          ?.filter((r) => r.status === "PENDING")
          .map((r) => r.role.id),
      ),
    [previousRequests],
  );

  const filteredRequestableRoles = useMemo(
    () =>
      requestableRoles?.filter((role) => !pendingRoleIds.has(role.id)) ?? [],
    [requestableRoles, pendingRoleIds],
  );

  const sortedPreviousRequests = useMemo(
    () =>
      [...(previousRequests ?? [])].sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
      ),
    [previousRequests],
  );

  useEffect(() => {
    if (
      selectedRoleId &&
      !filteredRequestableRoles.some((r) => r.id === selectedRoleId)
    ) {
      setSelectedRoleId(null);
    }
  }, [filteredRequestableRoles, selectedRoleId]);

  const handleRequestRole = async () => {
    if (!selectedRoleId) return;

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

  /**
   * ✅ Early returns AFTER hooks
   */
  if (loading) return <Spin tip="Loading roles..." fullscreen />;

  if (error)
    return <Alert type="error" title="Error" description={error} showIcon />;

  return (
    <Space orientation="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>Request a Role</Title>

      <div>
        <Title level={4}>Your Current Roles:</Title>
        {dbUser?.roles?.length ? (
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
            filteredRequestableRoles.length
              ? "Select a role"
              : "No roles available"
          }
          value={selectedRoleId ?? undefined}
          disabled={!filteredRequestableRoles.length}
          onChange={setSelectedRoleId}
          options={filteredRequestableRoles.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
        />
        <Button
          type="primary"
          onClick={handleRequestRole}
          loading={submitting}
          disabled={!selectedRoleId || submitting}
          style={{ marginLeft: 10 }}
        >
          Request Role
        </Button>
      </div>
      <div>
        <Title level={4}>Previous Requests:</Title>
        <Table
          locale={{ emptyText: "No role requests yet" }}
          dataSource={sortedPreviousRequests}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: "Role",
              dataIndex: ["role", "name"],
              key: "role",
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status: string, record) => {
                if (status === "APPROVED") {
                  return <Tag color="green">Approved</Tag>;
                }

                if (status === "PENDING") {
                  return <Tag color="orange">Pending Approval</Tag>;
                }

                if (status === "REJECTED") {
                  const daysLeft = Math.max(
                    0,
                    3 - dayjs().diff(dayjs(record.updatedAt), "day"),
                  );

                  return (
                    <Space orientation="vertical" size={0}>
                      <Tag color="red">Rejected</Tag>
                      {daysLeft > 0 ? (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Reapply in {daysLeft} day(s)
                        </Text>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          You may reapply now
                        </Text>
                      )}
                    </Space>
                  );
                }

                return <Tag>{status}</Tag>;
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
