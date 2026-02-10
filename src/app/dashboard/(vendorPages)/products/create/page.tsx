"use client";

import { useState } from "react";
import { Button, Card, Col, Row, message, Steps } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormTextArea from "@/components/Forms/FormTextArea";
import FormSelectField from "@/components/Forms/FormSelectField";
import { useCreateProductMutation } from "@/redux/api/productApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetAllBrandsQuery } from "@/redux/api/brandApi";
import { useGetMyStoresQuery } from "@/redux/api/storeApi";
import { useGetAllAttributesQuery } from "@/redux/api/attributeApi";
import { useRouter } from "next/navigation";
import { ICreateProductInput } from "@/types/product";
import { Checkbox } from "antd";

const CreateProductPage = () => {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 100 });
  const { data: brandsData } = useGetAllBrandsQuery({ limit: 100 });
  const { data: storesData } = useGetMyStoresQuery({ limit: 100 });
  const { data: attributesData } = useGetAllAttributesQuery({
    limit: 100,
    isActive: true,
  });

  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  const onSubmit = async (data: ICreateProductInput) => {
    try {
      const payload = {
        ...data,
        basePrice: Number(data.basePrice),
        comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        length: data.length ? Number(data.length) : undefined,
        width: data.width ? Number(data.width) : undefined,
        height: data.height ? Number(data.height) : undefined,
        attributeIds:
          selectedAttributes.length > 0 ? selectedAttributes : undefined,
      };

      const res = await createProduct(payload).unwrap();
      message.success(res.message || "Product created successfully!");
      router.push("/dashboard/products");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to create product");
    }
  };

  // Prepare options
  const categoryOptions =
    (
      categoriesData?.categories as { id: string; name: string }[] | undefined
    )?.map((cat: { id: string; name: string }) => ({
      label: cat.name,
      value: cat.id,
    })) || [];

  const brandOptions =
    (brandsData?.brands as { id: string; name: string }[] | undefined)?.map(
      (brand: { id: string; name: string }) => ({
        label: brand.name,
        value: brand.id,
      }),
    ) || [];

  const storeOptions =
    (storesData?.stores as { id: string; name: string }[] | undefined)?.map(
      (store: { id: string; name: string }) => ({
        label: store.name,
        value: store.id,
      }),
    ) || [];

  const attributes =
    (attributesData?.attributes as
      | { id: string; name: string; displayName?: string }[]
      | undefined) || [];

  return (
    <div>
      <h1>Create Product</h1>

      <Steps
        current={0}
        items={[
          { title: "Basic Info" },
          { title: "Media & Details" },
          { title: "Variants & Inventory" },
        ]}
        style={{ marginBottom: 24 }}
      />

      <Form submitHandler={onSubmit}>
        <Card title="📝 Basic Information" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <FormInput
                name="name"
                label="Product Name"
                placeholder="Enter product name"
                required
              />
            </Col>

            <Col xs={24} md={12}>
              <FormSelectField
                name="storeId"
                label="Store"
                placeholder="Select store"
                options={storeOptions}
                required
              />
            </Col>

            <Col xs={24}>
              <FormTextArea
                name="description"
                label="Description"
                placeholder="Product description"
                rows={4}
              />
            </Col>

            <Col xs={24} md={8}>
              <FormSelectField
                name="categoryId"
                label="Category"
                placeholder="Select category"
                options={categoryOptions}
                required
              />
            </Col>

            <Col xs={24} md={8}>
              <FormSelectField
                name="brandId"
                label="Brand"
                placeholder="Select brand"
                options={brandOptions}
                required
              />
            </Col>
          </Row>
        </Card>

        <Card title="💰 Pricing" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <FormInput
                name="basePrice"
                label="Base Price ($)"
                placeholder="0.00"
                type="number"
                required
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="comparePrice"
                label="Compare At Price ($) - Optional"
                placeholder="0.00"
                type="number"
              />
              <small style={{ color: "#888" }}>
                Original price (shows as strikethrough)
              </small>
            </Col>
          </Row>
        </Card>

        <Card title="🎨 Product Attributes" style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 16 }}>
            Select attributes that this product will have (e.g., Color, Size).
            You&apos;ll create variants based on these attributes in the next
            step.
          </p>
          <Row gutter={[16, 16]}>
            {attributes.map(
              (attr: { id: string; name: string; displayName?: string }) => (
                <Col xs={24} md={8} key={attr.id}>
                  <Checkbox
                    checked={selectedAttributes.includes(attr.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAttributes([...selectedAttributes, attr.id]);
                      } else {
                        setSelectedAttributes(
                          selectedAttributes.filter((id) => id !== attr.id),
                        );
                      }
                    }}
                  >
                    {attr.displayName || attr.name}
                  </Checkbox>
                </Col>
              ),
            )}
          </Row>
          {attributes.length === 0 && (
            <div style={{ color: "#888", fontStyle: "italic" }}>
              No attributes available. Please create attributes first.
            </div>
          )}
        </Card>

        <Card title=" Shipping (Optional)" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <FormInput
                name="weight"
                label="Weight (kg)"
                placeholder="0.00"
                type="number"
              />
            </Col>
            <Col xs={24} md={6}>
              <FormInput
                name="length"
                label="Length (cm)"
                placeholder="0.00"
                type="number"
              />
            </Col>
            <Col xs={24} md={6}>
              <FormInput
                name="width"
                label="Width (cm)"
                placeholder="0.00"
                type="number"
              />
            </Col>
            <Col xs={24} md={6}>
              <FormInput
                name="height"
                label="Height (cm)"
                placeholder="0.00"
                type="number"
              />
            </Col>
          </Row>
        </Card>

        <Card title="SEO (Optional)" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <FormInput
                name="seoTitle"
                label="SEO Title"
                placeholder="SEO optimized title"
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
              <FormInput
                name="seoKeywords"
                label="SEO Keywords"
                placeholder="keyword1, keyword2, keyword3"
              />
            </Col>
          </Row>
        </Card>

        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
              >
                Create Product
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={() => router.back()}>
                Cancel
              </Button>
            </Col>
            <Col xs={24}>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                }}
              >
                <strong> Next Steps:</strong>
                <ul style={{ marginBottom: 0, marginTop: 8 }}>
                  <li>After creating, you can add product images</li>
                  <li>
                    Create product variants (combinations of selected
                    attributes)
                  </li>
                  <li>Set inventory levels per branch</li>
                  <li>Publish the product when ready</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default CreateProductPage;
