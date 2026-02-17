"use client";

import { useParams } from "next/navigation";
import { Spin, Tabs, Card, Typography } from "antd";
import { SettingOutlined, ApiOutlined, ShopOutlined } from "@ant-design/icons";
import { useGetCredentialsByBranchQuery } from "@/redux/api/pathaoApi";
import CredentialsForm from "./components/CredentialsForm";
import StoreRegistrationForm from "./components/StoreRegistrationForm";
import { IPathaoCredentials } from "@/types/pathao";

const { Title, Text } = Typography;

export default function BranchPathaoSettingsPage() {
  const params = useParams();
  const branchId = params?.id as string;

  const { data: credentials, isLoading } =
    useGetCredentialsByBranchQuery(branchId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: "credentials",
      label: (
        <span>
          <ShopOutlined /> API Credentials
        </span>
      ),
      children: (
        <Card>
          <CredentialsForm
            branchId={branchId}
            existingCredentials={credentials as IPathaoCredentials | undefined}
          />
        </Card>
      ),
    },
    {
      key: "store",
      label: (
        <span>
          <ApiOutlined /> Store Registration
        </span>
      ),
      children: (
        <Card>
          <StoreRegistrationForm branchId={branchId} />
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <SettingOutlined /> Pathao Delivery Settings
        </Title>
        <Text type="secondary">
          Configure Pathao delivery integration for this branch
        </Text>
      </div>

      <Tabs defaultActiveKey="credentials" items={tabItems} />
    </div>
  );
}
