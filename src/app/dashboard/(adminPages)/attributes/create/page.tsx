"use client";

import { Button, Card, Col, Row, message } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormSelectField from "@/components/Forms/FormSelectField";
import { useCreateAttributeMutation } from "@/redux/api/attributeApi";
import { useRouter } from "next/navigation";
import { ICreateAttributeInput } from "@/types/attribute";

const CreateAttributePage = () => {
  const router = useRouter();
  const [createAttribute, { isLoading }] = useCreateAttributeMutation();

  const typeOptions = [
    { label: "Text", value: "text" },
    { label: "Color", value: "color" },
    { label: "Image", value: "image" },
  ];

  const onSubmit = async (data: ICreateAttributeInput) => {
    try {
      const res = await createAttribute(data).unwrap();
      message.success(res.message || "Attribute created successfully!");
      router.push("/dashboard/attributes");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create attribute");
    }
  };

  return (
    <div>
      <h1>Create Attribute</h1>

      <Card>
        <Form submitHandler={onSubmit}>
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

            <Col xs={24}>
              <FormSelectField
                name="type"
                label="Attribute Type"
                placeholder="Select type"
                options={typeOptions}
              />
              <small style={{ color: "#888" }}>
                • Text: Simple text values (e.g., Small, Medium, Large)
                <br />
                • Color: Color values with hex codes (e.g., Red #FF0000)
                <br />• Image: Image-based values (for visual attributes)
              </small>
            </Col>

            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Create Attribute
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }} title="What's Next?">
        <p>After creating the attribute, you can:</p>
        <ol>
          <li>Add attribute values (e.g., Red, Blue, Green for Color)</li>
          <li>Use this attribute when creating products</li>
          <li>Create product variants based on attribute combinations</li>
        </ol>
      </Card>
    </div>
  );
};

export default CreateAttributePage;
