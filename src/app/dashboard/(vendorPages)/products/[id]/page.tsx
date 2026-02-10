"use client";

import { Button, Card, Space, Tag, Descriptions, Spin, Divider } from "antd";
import { EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useGetProductByIdQuery } from "@/redux/api/productApi";
import { IProduct } from "@/types/product";
import Link from "next/link";
import Image from "next/image";

const ViewProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: productData, isLoading } = useGetProductByIdQuery(id, {
    skip: !id,
  });

  const product = productData as IProduct;

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
          Back
        </Button>
        <Link href={`/dashboard/products/edit/${id}`}>
          <Button type="primary" icon={<EditOutlined />}>
            Edit Product
          </Button>
        </Link>
        <Link href={`/dashboard/products/${id}/variants`}>
          <Button type="default">
            Manage Variants ({product.variants?.length || 0})
          </Button>
        </Link>
        <Link href={`/dashboard/products/${id}/images`}>
          <Button type="default">
            Manage Images ({product.media?.length || 0})
          </Button>
        </Link>
      </Space>

      <Card title={product.name}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Category">
            {product.category?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Brand">
            {product.brand?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Store">
            {product.store?.name}
          </Descriptions.Item>
          <Descriptions.Item label="SKU/Slug">{product.slug}</Descriptions.Item>
          <Descriptions.Item label="Base Price">
            ${product.basePrice}
          </Descriptions.Item>
          <Descriptions.Item label="Compare Price">
            {product.comparePrice ? `$${product.comparePrice}` : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={2}>
            <Space>
              <Tag color={product.isActive ? "green" : "red"}>
                {product.isActive ? "Active" : "Inactive"}
              </Tag>
              <Tag color={product.isPublished ? "blue" : "orange"}>
                {product.isPublished ? "Published" : "Draft"}
              </Tag>
              {product.isFeatured && <Tag color="purple">Featured</Tag>}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {product.description || "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {product.media && product.media.length > 0 && (
        <Card title="📸 Product Images" style={{ marginTop: 16 }}>
          <Space wrap>
            {product.media.map((media) => (
              <div key={media.id} style={{ position: "relative" }}>
                <Image
                  src={media.mediaUrl}
                  alt={media.altText || product.name}
                  width={150}
                  height={150}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
                {media.isPrimary && (
                  <Tag
                    color="blue"
                    style={{ position: "absolute", top: 8, left: 8 }}
                  >
                    Primary
                  </Tag>
                )}
              </div>
            ))}
          </Space>
        </Card>
      )}

      {product.productAttributes && product.productAttributes.length > 0 && (
        <Card title="🎨 Attributes" style={{ marginTop: 16 }}>
          <Space wrap>
            {product.productAttributes.map((pa) => (
              <Tag key={pa.attributeId} color="blue">
                {pa.attribute?.name} ({pa.attribute?.values?.length || 0}{" "}
                values)
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {product.variants && product.variants.length > 0 && (
        <Card title="📦 Variants" style={{ marginTop: 16 }}>
          <p>Total Variants: {product.variants.length}</p>
          <Divider />
          {product.variants.slice(0, 5).map((variant) => (
            <div
              key={variant.id}
              style={{
                padding: "12px",
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <strong>SKU:</strong> {variant.sku} | <strong>Price:</strong> $
              {variant.price}
            </div>
          ))}
          {product.variants.length > 5 && (
            <div style={{ color: "#888", fontStyle: "italic" }}>
              ... and {product.variants.length - 5} more variants
            </div>
          )}
        </Card>
      )}

      {(product.weight ||
        product.length ||
        product.width ||
        product.height) && (
        <Card title="📦 Shipping Info" style={{ marginTop: 16 }}>
          <Descriptions bordered column={2}>
            {product.weight && (
              <Descriptions.Item label="Weight">
                {product.weight} kg
              </Descriptions.Item>
            )}
            {product.length && (
              <Descriptions.Item label="Length">
                {product.length} cm
              </Descriptions.Item>
            )}
            {product.width && (
              <Descriptions.Item label="Width">
                {product.width} cm
              </Descriptions.Item>
            )}
            {product.height && (
              <Descriptions.Item label="Height">
                {product.height} cm
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default ViewProductPage;
