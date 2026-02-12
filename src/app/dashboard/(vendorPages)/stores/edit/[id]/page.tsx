"use client";

import { useState } from "react";
import { Button, Card, Col, Row, message, Switch, Spin } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormTextArea from "@/components/Forms/FormTextArea";
import ImageUpload from "@/components/Forms/ImageUpload";
import {
  useGetStoreByIdQuery,
  useUpdateStoreMutation,
} from "@/redux/api/storeApi";
import { useRouter, useParams } from "next/navigation";
import { IUpdateStoreInput, IStore } from "@/types/store";

const EditStorePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: storeData, isLoading: isFetching } = useGetStoreByIdQuery(id, {
    skip: !id,
  });
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();

  const store = storeData as IStore;

  // Initialize state from store data directly (only once when store loads)
  const [logoUrl, setLogoUrl] = useState<string>(store?.logo || "");
  const [bannerUrl, setBannerUrl] = useState<string>(store?.banner || "");
  const [isActive, setIsActive] = useState<boolean>(store?.isActive ?? true);

  const onSubmit = async (data: IUpdateStoreInput) => {
    try {
      const payload = {
        ...data,
        logo: logoUrl || undefined,
        banner: bannerUrl || undefined,
        isActive,
      };

      const res = await updateStore({ id, data: payload }).unwrap();
      message.success(res.message || "Store updated successfully!");
      router.push("/dashboard/stores");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to update store");
    }
  };

  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!store) {
    return <div>Store not found</div>;
  }

  // If state hasn't been initialized yet (initial render), sync it
  if (store && !logoUrl && store.logo) {
    setLogoUrl(store.logo);
  }
  if (store && !bannerUrl && store.banner) {
    setBannerUrl(store.banner);
  }

  return (
    <div>
      <h1>Edit Store</h1>

      <Card>
        <Form submitHandler={onSubmit} defaultValues={store}>
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

            {/* Contact Information Section */}
            <Col xs={24}>
              <div style={{ marginTop: "24px", marginBottom: "16px" }}>
                <h3>Contact Information</h3>
                <p style={{ color: "#666", fontSize: "14px" }}>
                  Provide contact details for customers to reach your store
                </p>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                name="whatsappNumber"
                label="WhatsApp Number"
                placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
              />
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                name="messengerLink"
                label="Messenger Link"
                placeholder="https://m.me/username"
              />
            </Col>

            <Col xs={24} md={8}>
              <FormInput
                name="contactPhone"
                label="Contact Phone"
                placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
              />
            </Col>

            <Col xs={24} md={12}>
              <div>
                <label style={{ display: "block", marginBottom: "8px" }}>
                  Store Status
                </label>
                <Switch
                  checked={isActive}
                  onChange={setIsActive}
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <ImageUpload
                folder="stores/logos"
                label="Store Logo"
                onUploadComplete={(url) => setLogoUrl(url)}
                currentImage={logoUrl || store.logo}
                onDelete={() => setLogoUrl("")}
              />
            </Col>

            <Col xs={24}>
              <ImageUpload
                folder="stores/banners"
                label="Store Banner"
                onUploadComplete={(url) => setBannerUrl(url)}
                currentImage={bannerUrl || store.banner}
                onDelete={() => setBannerUrl("")}
              />
            </Col>

            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Store
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default EditStorePage;
