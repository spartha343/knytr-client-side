"use client";

import { Card, Descriptions, Tag, Spin, Button } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useGetStoreByIdQuery } from "@/redux/api/storeApi";
import { IStore } from "@/types/store";
import Image from "next/image";
import { ArrowLeftOutlined } from "@ant-design/icons";

const AdminStoreDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: storeData, isLoading } = useGetStoreByIdQuery(id, {
    skip: !id,
  });

  const store = storeData as IStore;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        style={{ marginBottom: "16px" }}
      >
        Back
      </Button>

      <h1>Store Details</h1>

      <Card title="Basic Information" style={{ marginBottom: "16px" }}>
        {store.logo && (
          <div style={{ marginBottom: "16px" }}>
            <Image src={store.logo} alt="Logo" width={100} height={100} />
          </div>
        )}

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Store Name">{store.name}</Descriptions.Item>
          <Descriptions.Item label="Slug">{store.slug}</Descriptions.Item>
          <Descriptions.Item label="Vendor Email">
            {store.vendor?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={store.isActive ? "green" : "red"}>
              {store.isActive ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(store.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(store.updatedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {store.description || "No description"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {store.banner && (
        <Card title="Store Banner" style={{ marginBottom: "16px" }}>
          <Image
            src={store.banner}
            alt="Banner"
            width={800}
            height={300}
            style={{ width: "100%", height: "auto" }}
          />
        </Card>
      )}

      {(store.seoTitle || store.seoDescription || store.seoKeywords) && (
        <Card title="SEO Information">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="SEO Title">
              {store.seoTitle || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="SEO Description">
              {store.seoDescription || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="SEO Keywords">
              {store.seoKeywords || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default AdminStoreDetailPage;
