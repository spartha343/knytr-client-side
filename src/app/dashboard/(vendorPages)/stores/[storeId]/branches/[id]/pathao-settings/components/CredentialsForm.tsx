"use client";

import { Form, Input, Select, Button, Alert, Space, Typography } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useSaveCredentialsMutation } from "@/redux/api/pathaoApi";
import { message } from "antd";
import { useEffect } from "react";
import type {
  IPathaoCredentials,
  IPathaoCredentialsInput,
} from "@/types/pathao";

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface Props {
  branchId: string;
  existingCredentials?: IPathaoCredentials;
}

export default function CredentialsForm({
  branchId,
  existingCredentials,
}: Props) {
  const [form] = Form.useForm();
  const [saveCredentials, { isLoading }] = useSaveCredentialsMutation();

  useEffect(() => {
    if (existingCredentials) {
      form.setFieldsValue({
        clientId: existingCredentials.clientId,
        clientSecret: existingCredentials.clientSecret,
        username: existingCredentials.username,
        environment: existingCredentials.environment,
        webhookSecret: existingCredentials.webhookSecret,
      });
    }
  }, [existingCredentials, form]);

  const onFinish = async (
    values: Omit<IPathaoCredentialsInput, "branchId">,
  ) => {
    try {
      await saveCredentials({ ...values, branchId }).unwrap();
      message.success("Pathao credentials saved successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { message?: string } }).data?.message
          : "Failed to save credentials";
      message.error(errorMessage);
    }
  };

  return (
    <div>
      <Title level={4}>Pathao API Credentials</Title>
      <Paragraph type="secondary">
        Configure your Pathao merchant API credentials for this branch. You can
        get these from your Pathao merchant dashboard.
      </Paragraph>

      <Alert
        title="Security Note"
        description="Your credentials are stored securely. When updating, leave the password blank to keep your
existing password."
        type="info"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ environment: "sandbox" }}
      >
        <Form.Item
          label="Client ID"
          name="clientId"
          rules={[{ required: true, message: "Please enter client ID" }]}
        >
          <Input placeholder="Enter Pathao client ID" />
        </Form.Item>

        <Form.Item
          label="Client Secret"
          name="clientSecret"
          rules={[{ required: true, message: "Please enter client secret" }]}
        >
          <Input.Password placeholder="Enter Pathao client secret" />
        </Form.Item>

        <Form.Item
          label="Username (Email)"
          name="username"
          rules={[
            { required: true, message: "Please enter username" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter Pathao username (email)" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: !existingCredentials,
              message: "Please enter password",
            },
          ]}
          help={
            existingCredentials
              ? "Leave blank to keep existing password"
              : undefined
          }
        >
          <Input.Password placeholder="Enter Pathao password" />
        </Form.Item>

        <Form.Item
          label="Environment"
          name="environment"
          rules={[{ required: true, message: "Please select environment" }]}
        >
          <Select placeholder="Select environment">
            <Option value="sandbox">Sandbox (Testing)</Option>
            <Option value="production">Production (Live)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Webhook Secret (Optional)"
          name="webhookSecret"
          help="A secret key to secure webhook communication with Pathao"
        >
          <Input placeholder="Enter webhook secret (optional)" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={isLoading}
            >
              Save Credentials
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
