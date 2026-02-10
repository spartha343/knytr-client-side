"use client";

import { useState } from "react";
import { Button, Card, Col, Row, message, Spin, Switch, Space } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormTextArea from "@/components/Forms/FormTextArea";
import FormSelectField from "@/components/Forms/FormSelectField";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/redux/api/productApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetAllBrandsQuery } from "@/redux/api/brandApi";
import { useRouter, useParams } from "next/navigation";
import { IUpdateProductInput, IProduct } from "@/types/product";
import { ArrowLeftOutlined } from "@ant-design/icons";

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: productData, isLoading: isFetching } = useGetProductByIdQuery(
    id,
    {
      skip: !id,
    },
  );
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 100 });
  const { data: brandsData } = useGetAllBrandsQuery({ limit: 100 });

  const product = productData as IProduct;

  const [isActive, setIsActive] = useState<boolean>(product?.isActive ?? true);
  const [isPublished, setIsPublished] = useState<boolean>(
    product?.isPublished ?? false,
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    product?.isFeatured ?? false,
  );

  const onSubmit = async (data: IUpdateProductInput) => {
    try {
      const payload = {
        ...data,
        basePrice: data.basePrice ? Number(data.basePrice) : undefined,
        comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        length: data.length ? Number(data.length) : undefined,
        width: data.width ? Number(data.width) : undefined,
        height: data.height ? Number(data.height) : undefined,
        isActive,
        isPublished,
        isFeatured,
      };

      const res = await updateProduct({ id, data: payload }).unwrap();
      message.success(res.message || "Product updated successfully!");
      router.push("/dashboard/products");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to update product");
    }
  };

  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  // Prepare options
  const categoryOptions =
    (
      categoriesData?.categories as { id: string; name: string }[] | undefined
    )?.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })) || [];

  const brandOptions =
    (brandsData?.brands as { id: string; name: string }[] | undefined)?.map(
      (brand) => ({
        label: brand.name,
        value: brand.id,
      }),
    ) || [];

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>

      <h1>Edit Product</h1>

      <Form submitHandler={onSubmit} defaultValues={product}>
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
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>
                  Product Status
                </label>
                <Space>
                  <Switch
                    checked={isActive}
                    onChange={setIsActive}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                  />
                  <Switch
                    checked={isPublished}
                    onChange={setIsPublished}
                    checkedChildren="Published"
                    unCheckedChildren="Draft"
                  />
                  <Switch
                    checked={isFeatured}
                    onChange={setIsFeatured}
                    checkedChildren="Featured"
                    unCheckedChildren="Normal"
                  />
                </Space>
              </div>
            </Col>

            <Col xs={24}>
              <FormTextArea
                name="description"
                label="Description"
                placeholder="Product description"
                rows={4}
              />
            </Col>

            <Col xs={24} md={12}>
              <FormSelectField
                name="categoryId"
                label="Category"
                placeholder="Select category"
                options={categoryOptions}
              />
            </Col>

            <Col xs={24} md={12}>
              <FormSelectField
                name="brandId"
                label="Brand"
                placeholder="Select brand"
                options={brandOptions}
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
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="comparePrice"
                label="Compare At Price ($)"
                placeholder="0.00"
                type="number"
              />
            </Col>
          </Row>
        </Card>

        <Card title="📦 Shipping (Optional)" style={{ marginBottom: 16 }}>
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

        <Card title="🔍 SEO (Optional)" style={{ marginBottom: 16 }}>
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
          <Button
            type="primary"
            htmlType="submit"
            loading={isUpdating}
            size="large"
          >
            Update Product
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => router.back()}>
            Cancel
          </Button>
        </Card>
      </Form>
    </div>
  );
};

export default EditProductPage;
