"use client";

import { Button, Card, Col, Row, message, Switch, Spin } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormSelectField from "@/components/Forms/FormSelectField";
import {
  useGetAttributeByIdQuery,
  useUpdateAttributeMutation,
} from "@/redux/api/attributeApi";
import { useRouter, useParams } from "next/navigation";
import { IUpdateAttributeInput, IAttribute } from "@/types/attribute";
import { useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";

const EditAttributePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: attributeData, isLoading: isFetching } =
    useGetAttributeByIdQuery(id, {
      skip: !id,
    });
  const [updateAttribute, { isLoading: isUpdating }] =
    useUpdateAttributeMutation();

  const attribute = attributeData as IAttribute;

  const [isActive, setIsActive] = useState<boolean>(
    attribute?.isActive ?? true,
  );

  const typeOptions = [
    { label: "Text", value: "text" },
    { label: "Color", value: "color" },
    { label: "Image", value: "image" },
  ];

  const onSubmit = async (data: IUpdateAttributeInput) => {
    try {
      // Only send the fields that can be updated, not the entire object
      const payload: IUpdateAttributeInput = {
        name: data.name,
        displayName: data.displayName,
        type: data.type,
        isActive,
      };

      const res = await updateAttribute({ id, data: payload }).unwrap();
      message.success(res.message || "Attribute updated successfully!");
      router.push("/dashboard/attributes");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to update attribute");
    }
  };

  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!attribute) {
    return <div>Attribute not found</div>;
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>

      <h1>Edit Attribute</h1>

      <Card>
        <Form submitHandler={onSubmit} defaultValues={attribute}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <FormInput
                name="name"
                label="Attribute Name"
                placeholder="e.g., Color, Size, Material"
                required
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="displayName"
                label="Display Name (Optional)"
                placeholder="e.g., Choose Your Color"
              />
            </Col>

            <Col xs={24} md={12}>
              <FormSelectField
                name="type"
                label="Attribute Type"
                placeholder="Select type"
                options={typeOptions}
              />
            </Col>

            <Col xs={24} md={12}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Attribute Status
                </label>
                <Switch
                  checked={isActive}
                  onChange={setIsActive}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </div>
            </Col>

            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Attribute
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }} title="⚠️ Important">
        <ul>
          <li>
            Changing the attribute type may affect existing products using this
            attribute
          </li>
          <li>
            Setting to Inactive will hide this attribute from product creation
          </li>
          <li>
            To manage attribute values, use the{" "}
            <a href={`/dashboard/attributes/${id}`}>View page</a>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default EditAttributePage;
