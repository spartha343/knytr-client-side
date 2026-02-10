"use client";

import { useState } from "react";
import { Button, Card, Col, Row, message, Switch, Spin } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormTextArea from "@/components/Forms/FormTextArea";
import ImageUpload from "@/components/Forms/ImageUpload";
import {
  useGetBrandByIdQuery,
  useUpdateBrandMutation,
} from "@/redux/api/brandApi";
import { useRouter, useParams } from "next/navigation";
import { IUpdateBrandInput, IBrand } from "@/types/brand";

const EditBrandPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: brandData, isLoading: isFetching } = useGetBrandByIdQuery(id, {
    skip: !id,
  });
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

  const brand = brandData as IBrand;

  const [logoUrl, setLogoUrl] = useState<string>(brand?.logoUrl || "");
  const [isActive, setIsActive] = useState<boolean>(brand?.isActive ?? true);

  const onSubmit = async (data: IUpdateBrandInput) => {
    try {
      const payload = {
        ...data,
        logoUrl: logoUrl || undefined,
        isActive,
      };

      const res = await updateBrand({ id, data: payload }).unwrap();
      message.success(res.message || "Brand updated successfully!");
      router.push("/dashboard/brands");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to update brand");
    }
  };

  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!brand) {
    return <div>Brand not found</div>;
  }

  // Initialize logo URL if not set
  if (brand && !logoUrl && brand.logoUrl) {
    setLogoUrl(brand.logoUrl);
  }

  return (
    <div>
      <h1>Edit Brand</h1>

      <Card>
        <Form submitHandler={onSubmit} defaultValues={brand}>
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

            <Col xs={24} md={12}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Brand Status
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
              <ImageUpload
                folder="brands"
                label="Brand Logo"
                onUploadComplete={(url) => setLogoUrl(url)}
                currentImage={logoUrl || brand.logoUrl}
                onDelete={() => setLogoUrl("")}
              />
            </Col>

            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Brand
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default EditBrandPage;
