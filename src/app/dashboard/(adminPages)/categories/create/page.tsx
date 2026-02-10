"use client";

import { useState } from "react";
import { Button, Card, Col, Row, message } from "antd";
import Form from "@/components/Forms/Form";
import FormInput from "@/components/Forms/FormInput";
import FormTextArea from "@/components/Forms/FormTextArea";
import FormSelectField from "@/components/Forms/FormSelectField";
import ImageUpload from "@/components/Forms/ImageUpload";
import {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
} from "@/redux/api/categoryApi";
import { useRouter } from "next/navigation";
import { ICreateCategoryInput, ICategory } from "@/types/category";

const CreateCategoryPage = () => {
  const router = useRouter();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  // Fetch all categories for parent selection
  const { data: categoriesData } = useGetAllCategoriesQuery({
    limit: 100, // Get all categories
  });

  const [imageUrl, setImageUrl] = useState<string>("");

  const onSubmit = async (data: ICreateCategoryInput) => {
    try {
      const payload = {
        ...data,
        imageUrl: imageUrl || undefined,
      };

      const res = await createCategory(payload).unwrap();
      message.success(res.message || "Category created successfully!");
      router.push("/dashboard/categories");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to create category");
    }
  };

  // Prepare parent category options
  const categories = categoriesData?.categories as ICategory[];
  const parentOptions =
    categories?.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })) || [];

  return (
    <div>
      <h1>Create Category</h1>

      <Card>
        <Form submitHandler={onSubmit}>
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

            <Col xs={24}>
              <ImageUpload
                folder="categories"
                label="Category Image"
                onUploadComplete={(url) => setImageUrl(url)}
                currentImage={imageUrl}
                onDelete={() => setImageUrl("")}
              />
            </Col>

            <Col xs={24}>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Create Category
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCategoryPage;
