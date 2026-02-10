"use client";

import { useState } from "react";
import { Button, Card, Col, Row, message } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormTextArea from "@/components/Forms/FormTextArea";
import ImageUpload from "@/components/Forms/ImageUpload";
import { useCreateBrandMutation } from "@/redux/api/brandApi";
import { useRouter } from "next/navigation";
import { ICreateBrandInput } from "@/types/brand";

const CreateBrandPage = () => {
  const router = useRouter();
  const [createBrand, { isLoading }] = useCreateBrandMutation();

  const [logoUrl, setLogoUrl] = useState<string>("");

  const onSubmit = async (data: ICreateBrandInput) => {
    try {
      const payload = {
        ...data,
        logoUrl: logoUrl || undefined,
      };

      const res = await createBrand(payload).unwrap();
      message.success(res.message || "Brand created successfully!");
      router.push("/dashboard/brands");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create brand");
    }
  };

  return (
    <div>
      <h1>Create Brand</h1>

      <Card>
        <Form submitHandler={onSubmit}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <FormInput
                name="name"
                label="Brand Name"
                placeholder="Enter brand name"
                required
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="websiteUrl"
                label="Website URL"
                placeholder="https://example.com"
              />
            </Col>

            <Col xs={24}>
              <FormTextArea
                name="description"
                label="Description"
                placeholder="Brand description"
                rows={4}
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="seoTitle"
                label="SEO Title"
                placeholder="SEO optimized title"
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="seoKeywords"
                label="SEO Keywords"
                placeholder="keyword1, keyword2, keyword3"
              />
            </Col>

            <Col xs={24}>
              <FormTextArea
                name="seoDescription"
                label="SEO Description"
                placeholder="SEO meta description"
                rows={3}
              />
            </Col>

            <Col xs={24}>
              <ImageUpload
                folder="brands"
                label="Brand Logo"
                onUploadComplete={(url) => setLogoUrl(url)}
                currentImage={logoUrl}
                onDelete={() => setLogoUrl("")}
              />
            </Col>

            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Create Brand
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateBrandPage;
