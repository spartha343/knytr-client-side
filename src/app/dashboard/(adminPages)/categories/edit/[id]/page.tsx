"use client";

import { useState } from "react";
import { Button, Card, Col, Row, message, Switch, Spin } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormTextArea from "@/components/Forms/FormTextArea";
import FormSelectField from "@/components/Forms/FormSelectField";
import ImageUpload from "@/components/Forms/ImageUpload";
import {
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useGetAllCategoriesQuery,
} from "@/redux/api/categoryApi";
import { useRouter, useParams } from "next/navigation";
import { IUpdateCategoryInput, ICategory } from "@/types/category";

const EditCategoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: categoryData, isLoading: isFetching } = useGetCategoryByIdQuery(
    id,
    {
      skip: !id,
    },
  );
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  // Fetch all categories for parent selection (excluding current category)
  const { data: categoriesData } = useGetAllCategoriesQuery({
    limit: 100,
  });

  const category = categoryData as ICategory;

  const [imageUrl, setImageUrl] = useState<string>(category?.imageUrl || "");
  const [isActive, setIsActive] = useState<boolean>(category?.isActive ?? true);

  const onSubmit = async (data: IUpdateCategoryInput) => {
    try {
      const payload = {
        ...data,
        imageUrl: imageUrl || undefined,
        isActive,
      };

      const res = await updateCategory({ id, data: payload }).unwrap();
      message.success(res.message || "Category updated successfully!");
      router.push("/dashboard/categories");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to update category");
    }
  };

  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!category) {
    return <div>Category not found</div>;
  }

  // Initialize image URL if not set
  if (category && !imageUrl && category.imageUrl) {
    setImageUrl(category.imageUrl);
  }

  // Prepare parent category options (exclude current category and its children)
  const categories = categoriesData?.categories as ICategory[];
  const parentOptions =
    categories
      ?.filter((cat) => cat.id !== id) // Exclude current category
      ?.map((cat) => ({
        label: cat.name,
        value: cat.id,
      })) || [];

  return (
    <div>
      <h1>Edit Category</h1>

      <Card>
        <Form submitHandler={onSubmit} defaultValues={category}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <FormInput
                name="name"
                label="Category Name"
                placeholder="Enter category name"
                required
              />
            </Col>

            <Col xs={24} md={12}>
              <FormSelectField
                name="parentId"
                label="Parent Category"
                placeholder="Select parent category (optional)"
                options={parentOptions}
              />
            </Col>

            <Col xs={24}>
              <FormTextArea
                name="description"
                label="Description"
                placeholder="Category description"
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
                  Category Status
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
                folder="categories"
                label="Category Image"
                onUploadComplete={(url) => setImageUrl(url)}
                currentImage={imageUrl || category.imageUrl}
                onDelete={() => setImageUrl("")}
              />
            </Col>

            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Category
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default EditCategoryPage;
