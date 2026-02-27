"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  message,
  Spin,
  Switch,
  Space,
  Typography,
  Form as AntForm,
} from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormTextArea from "@/components/Forms/FormTextArea";
import FormSelectField from "@/components/Forms/FormSelectField";
import { useGetAllAttributesQuery } from "@/redux/api/attributeApi";
import { Checkbox, Alert, Tag } from "antd";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/redux/api/productApi";
import { useGetAllCategoriesQuery } from "@/redux/api/categoryApi";
import { useGetAllBrandsQuery } from "@/redux/api/brandApi";
import { useRouter, useParams } from "next/navigation";
import { IUpdateProductInput, IProduct } from "@/types/product";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Inner form component — receives product as prop so useState initializes correctly ───
const EditProductForm = ({ product }: { product: IProduct }) => {
  const router = useRouter();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 100 });
  const { data: brandsData } = useGetAllBrandsQuery({ limit: 100 });
  const { data: attributesData } = useGetAllAttributesQuery({
    limit: 100,
    isActive: true,
  });

  const attributes =
    (attributesData?.attributes as
      | { id: string; name: string; displayName?: string }[]
      | undefined) || [];

  const hasVariants = (product?.variants?.length ?? 0) > 0;

  // ✅ These now initialize correctly because product is guaranteed to exist
  const [isActive, setIsActive] = useState<boolean>(product.isActive ?? true);
  const [isPublished, setIsPublished] = useState<boolean>(
    product.isPublished ?? false,
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    product.isFeatured ?? false,
  );
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(
    product.productAttributes?.map(
      (pa: { attributeId: string }) => pa.attributeId,
    ) || [],
  );

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

  const onSubmit = async (data: IUpdateProductInput) => {
    try {
      const basePriceNum = data.basePrice
        ? Number(data.basePrice)
        : product.basePrice;
      const comparePriceNum = data.comparePrice
        ? Number(data.comparePrice)
        : undefined;

      if (comparePriceNum !== undefined && comparePriceNum <= basePriceNum) {
        message.error("Compare price must be greater than base price");
        return;
      }
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
        ...(!hasVariants && { attributeIds: selectedAttributes }),
        brandId: data.brandId || undefined,
      };

      const res = await updateProduct({
        id: product.id,
        data: payload,
      }).unwrap();
      message.success(res.message || "Product updated successfully!");
      router.push("/dashboard/products");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to update product");
    }
  };

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
                label="Base Price (৳)"
                placeholder="0.00"
                type="number"
              />
            </Col>

            <Col xs={24} md={12}>
              <FormInput
                name="comparePrice"
                label="Compare At Price (৳)"
                placeholder="0.00"
                type="number"
              />
            </Col>
          </Row>
        </Card>

        <Card title="🎨 Product Attributes" style={{ marginBottom: 16 }}>
          {hasVariants ? (
            <>
              <Alert
                title="Attributes are locked"
                description="This product already has variants. Delete all variants first to change attributes."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <div>
                {product.productAttributes?.map(
                  (pa: {
                    attributeId: string;
                    attribute?: { name: string };
                  }) => (
                    <Tag
                      key={pa.attributeId}
                      color="blue"
                      style={{ margin: 4 }}
                    >
                      {pa.attribute?.name}
                    </Tag>
                  ),
                )}
                {(!product.productAttributes ||
                  product.productAttributes.length === 0) && (
                  <span style={{ color: "#888", fontStyle: "italic" }}>
                    No attributes configured
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <p style={{ marginBottom: 16 }}>
                Select attributes this product will use (e.g., Color, Size).
                You&apos;ll create variants based on these in the variants page.
              </p>
              <Row gutter={[16, 16]}>
                {attributes.map((attr) => (
                  <Col xs={24} md={8} key={attr.id}>
                    <Checkbox
                      checked={selectedAttributes.includes(attr.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAttributes([
                            ...selectedAttributes,
                            attr.id,
                          ]);
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
                ))}
              </Row>
              {attributes.length === 0 && (
                <div style={{ color: "#888", fontStyle: "italic" }}>
                  No attributes available. Please create attributes first.
                </div>
              )}
            </>
          )}
        </Card>

        <Card title="📦 Shipping" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <FormInput
                name="weight"
                label="Weight (kg)"
                placeholder="0.00"
                type="number"
              />
              <small style={{ color: "#888" }}>
                Used for Pathao delivery calculation. Defaults to 0.5kg if not
                set.
              </small>
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

        <Card title="⚙️ Publishing Settings" style={{ marginBottom: 16 }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <AntForm.Item label="Publish Status">
                <Space orientation="vertical">
                  <Switch
                    checked={isPublished}
                    onChange={setIsPublished}
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                  />
                  <Text type="secondary">
                    {isPublished
                      ? "Product is visible to customers"
                      : "Product is saved as draft"}
                  </Text>
                </Space>
              </AntForm.Item>
            </Col>

            <Col xs={24} md={8}>
              <AntForm.Item label="Active Status">
                <Space orientation="vertical">
                  <Switch
                    checked={isActive}
                    onChange={setIsActive}
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                  />
                  <Text type="secondary">
                    {isActive
                      ? "Product is available for purchase"
                      : "Product is temporarily disabled"}
                  </Text>
                </Space>
              </AntForm.Item>
            </Col>

            <Col xs={24} md={8}>
              <AntForm.Item label="Featured Status">
                <Space orientation="vertical">
                  <Switch
                    checked={isFeatured}
                    onChange={setIsFeatured}
                    checkedChildren={<StarFilled />}
                    unCheckedChildren={<StarOutlined />}
                  />
                  <Text type="secondary">
                    {isFeatured
                      ? "Product is highlighted as featured"
                      : "Product is not featured"}
                  </Text>
                </Space>
              </AntForm.Item>
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

// ─── Outer shell — handles loading state, then mounts inner form with guaranteed product data ───
const EditProductPage = () => {
  const params = useParams();
  const id = params?.id as string;

  const { data: productData, isLoading: isFetching } = useGetProductByIdQuery(
    id,
    { skip: !id },
  );

  const product = productData as IProduct;

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

  // ✅ Key ensures EditProductForm remounts fresh if product id ever changes
  return <EditProductForm key={product.id} product={product} />;
};

export default EditProductPage;
