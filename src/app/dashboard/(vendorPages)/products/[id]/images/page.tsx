"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Space,
  message,
  Spin,
  Upload,
  Image,
  Popconfirm,
  Row,
  Col,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useGetProductByIdQuery } from "@/redux/api/productApi";
import {
  useUploadProductMediaMutation,
  useSetPrimaryMediaMutation,
  useDeleteProductMediaMutation,
} from "@/redux/api/productMediaApi";
import { IProduct, IProductMedia } from "@/types/product";
import type { UploadFile } from "antd";
import axiosInstanceWithToken from "@/helpers/axios/axiosInstanceWithToken";

const ProductImagesPage = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const {
    data: productData,
    isLoading,
    refetch,
  } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  const product = productData as IProduct;

  const [uploadProductMedia, { isLoading: isUploadingMedia }] =
    useUploadProductMediaMutation();
  const [setPrimaryMedia, { isLoading: isSettingPrimary }] =
    useSetPrimaryMediaMutation();
  const [deleteProductMedia, { isLoading: isDeleting }] =
    useDeleteProductMediaMutation();

  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select at least one image");
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      // Upload each file to Cloudinary
      for (const file of fileList) {
        const formData = new FormData();
        formData.append("file", file.originFileObj as Blob);
        formData.append("folder", "products");

        const response = await axiosInstanceWithToken.post(
          "/upload/single",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        uploadedUrls.push(response.data.data.url);
      }

      // Save all uploaded URLs to database
      await uploadProductMedia({
        productId,
        urls: uploadedUrls,
      }).unwrap();

      message.success(
        `${fileList.length} image(s) uploaded and saved successfully!`,
      );
      setFileList([]);
      refetch();
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (mediaId: string) => {
    try {
      await setPrimaryMedia(mediaId).unwrap();
      message.success("Primary image updated!");
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to set primary image");
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await deleteProductMedia(mediaId).unwrap();
      message.success("Image deleted successfully!");
      refetch();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to delete image");
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
          Back to Product
        </Button>
      </Space>

      <Card title={`Images for: ${product.name}`} style={{ marginBottom: 16 }}>
        <Upload
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          multiple
          accept="image/*"
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Select Images</Button>
        </Upload>

        <Button
          type="primary"
          onClick={handleUpload}
          loading={uploading || isUploadingMedia}
          disabled={fileList.length === 0}
          style={{ marginTop: 16 }}
        >
          Upload {fileList.length > 0 ? `${fileList.length} Image(s)` : ""}
        </Button>
      </Card>

      <Card title={`Product Images (${product.media?.length || 0})`}>
        {!product.media || product.media.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            <p>No images uploaded yet.</p>
            <p>Upload images to showcase your product.</p>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {product.media.map((media: IProductMedia) => (
              <Col xs={24} sm={12} md={8} lg={6} key={media.id}>
                <Card
                  cover={
                    <Image
                      src={media.mediaUrl}
                      alt={media.altText || product.name}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  }
                  actions={[
                    <Button
                      key="primary"
                      type="text"
                      icon={
                        media.isPrimary ? (
                          <StarFilled style={{ color: "#faad14" }} />
                        ) : (
                          <StarOutlined />
                        )
                      }
                      onClick={() => handleSetPrimary(media.id)}
                      disabled={media.isPrimary || isSettingPrimary}
                      loading={isSettingPrimary}
                    >
                      {media.isPrimary ? "Primary" : "Set Primary"}
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Delete this image?"
                      description="This action cannot be undone."
                      onConfirm={() => handleDelete(media.id)}
                      okText="Yes"
                      cancelText="No"
                      disabled={isDeleting}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        loading={isDeleting}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    description={
                      <Space orientation="vertical" size="small">
                        {media.isPrimary && (
                          <Tag color="blue">Primary Image</Tag>
                        )}
                        {media.altText && (
                          <div style={{ fontSize: "12px", color: "#888" }}>
                            {media.altText}
                          </div>
                        )}
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          Order: {media.order}
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <Card style={{ marginTop: 16 }} title="ℹ️ Image Guidelines">
        <ul>
          <li>Recommended size: 1000x1000 pixels or larger</li>
          <li>Supported formats: JPG, PNG, WebP</li>
          <li>Maximum file size: 5MB per image</li>
          <li>Set one image as primary (shown in product listings)</li>
          <li>First image uploaded becomes primary by default</li>
        </ul>
      </Card>
    </div>
  );
};

export default ProductImagesPage;
