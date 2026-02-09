"use client";

import { useState } from "react";
import { Button, Card, Col, Row, message } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormTextArea from "@/components/Forms/FormTextArea";
import ImageUpload from "@/components/Forms/ImageUpload";
import { useCreateStoreMutation } from "@/redux/api/storeApi";
import { useRouter } from "next/navigation";
import { ICreateStoreInput } from "@/types/store";

const CreateStorePage = () => {
  const router = useRouter();
  const [createStore, { isLoading }] = useCreateStoreMutation();

  const [logoUrl, setLogoUrl] = useState<string>("");
  const [bannerUrl, setBannerUrl] = useState<string>("");

  const onSubmit = async (data: ICreateStoreInput) => {
    try {
      const payload = {
        ...data,
        logo: logoUrl || undefined,
        banner: bannerUrl || undefined,
      };

      const res = await createStore(payload).unwrap();
      message.success(res.message || "Store created successfully!");
      router.push("/dashboard/stores");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to create store");
    }
  };

  return (
    <div>
      <h1>Create Store</h1>

      <Card>
        <Form submitHandler={onSubmit}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <FormInput
                name="name"
                label="Store Name"
                placeholder="Enter store name"
                required
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="seoTitle"
                label="SEO Title"
                placeholder="SEO optimized title"
              />
            </Col>

            <Col xs={24}>
              <FormTextArea
                name="description"
                label="Description"
                placeholder="Store description"
                rows={4}
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
              <FormInput
                name="seoKeywords"
                label="SEO Keywords"
                placeholder="keyword1, keyword2, keyword3"
              />
            </Col>

            <Col xs={24} md={12}>
              <ImageUpload
                folder="stores/logos"
                label="Store Logo"
                onUploadComplete={(url) => setLogoUrl(url)}
                currentImage={logoUrl}
                onDelete={() => setLogoUrl("")}
              />
            </Col>

            <Col xs={24}>
              <ImageUpload
                folder="stores/banners"
                label="Store Banner"
                onUploadComplete={(url) => setBannerUrl(url)}
                currentImage={bannerUrl}
                onDelete={() => setBannerUrl("")}
              />
            </Col>

            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Create Store
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateStorePage;
