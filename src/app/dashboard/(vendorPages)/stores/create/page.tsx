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
import { FieldValues, UseFormSetError } from "react-hook-form";
import { extractFieldErrors, getErrorMessage } from "@/helpers/errorHelper";

const CreateStorePage = () => {
  const router = useRouter();
  const [createStore, { isLoading }] = useCreateStoreMutation();

  const [logoUrl, setLogoUrl] = useState<string>("");
  const [bannerUrl, setBannerUrl] = useState<string>("");

  const [formSetError, setFormSetError] =
    useState<UseFormSetError<FieldValues> | null>(null);

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
      const fieldErrors = extractFieldErrors(error);

      // Set errors on specific fields
      if (Object.keys(fieldErrors).length > 0 && formSetError) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          formSetError(field, {
            type: "manual",
            message: message,
          });
        });

        // Also show a general error message
        message.error("Please fix the validation errors");
      } else {
        // Fallback to generic error
        message.error(getErrorMessage(error));
      }
    }
  };

  return (
    <div>
      <h1>Create Store</h1>

      <Card>
        <Form
          submitHandler={onSubmit}
          onError={(setError) => setFormSetError(() => setError)}
        >
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
