"use client";

import { Card, Descriptions, Tag, Spin, Button } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useGetBranchByIdQuery } from "@/redux/api/branchApi";
import { IBranch } from "@/types/branch";
import { ArrowLeftOutlined } from "@ant-design/icons";

const AdminBranchDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: branchData, isLoading } = useGetBranchByIdQuery(id, {
    skip: !id,
  });

  const branch = branchData as IBranch;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!branch) {
    return <div>Branch not found</div>;
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: "16px" }}
      >
        Back
      </Button>

      <h1>Branch Details</h1>

      <Card title="Branch Information" style={{ marginBottom: "16px" }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Branch Name">
            {branch.name}
          </Descriptions.Item>
          <Descriptions.Item label="Store Name">
            {branch.store?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Vendor Email">
            {branch.store?.vendor?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Contact Phone">
            {branch.contactPhone || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Contact Email">
            {branch.contactEmail || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={branch.isActive ? "green" : "red"}>
              {branch.isActive ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(branch.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(branch.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {branch.address && (
        <Card title="Address Information">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Address Line 1">
              {branch.address.addressLine1}
            </Descriptions.Item>
            <Descriptions.Item label="Address Line 2">
              {branch.address.addressLine2 || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="City">
              {branch.address.city}
            </Descriptions.Item>
            <Descriptions.Item label="State/Division">
              {branch.address.state || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Postal Code">
              {branch.address.postalCode}
            </Descriptions.Item>
            <Descriptions.Item label="Country">
              {branch.address.country}
            </Descriptions.Item>
            {branch.address.latitude && branch.address.longitude && (
              <>
                <Descriptions.Item label="Latitude">
                  {branch.address.latitude}
                </Descriptions.Item>
                <Descriptions.Item label="Longitude">
                  {branch.address.longitude}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default AdminBranchDetailPage;
