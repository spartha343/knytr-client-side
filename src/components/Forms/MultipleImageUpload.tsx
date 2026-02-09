"use client";

import { useState } from "react";
import { Upload, message, Button, Image } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios";
import { auth } from "@/firebase/firebase.config";
import { getBaseUrl } from "@/helpers/config/envConfig";

interface MultipleImageUploadProps {
  folder: string;
  maxFiles?: number; // Max number of files (default: 5)
  maxSize?: number; // Max file size in MB (default: 5)
  accept?: string;
  onUploadComplete: (urls: string[]) => void;
  currentImages?: string[];
  onDelete?: (url: string) => void;
  label?: string;
}

const MultipleImageUpload = ({
  folder,
  maxFiles = 5,
  maxSize = 5,
  accept = "image/png,image/jpeg,image/jpg,image/webp",
  onUploadComplete,
  currentImages = [],
  onDelete,
  label = "Upload Images",
}: MultipleImageUploadProps) => {
  const [user] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(currentImages);

  const handleUpload = async (fileList: File[]) => {
    // Validate number of files
    if (imageUrls.length + fileList.length > maxFiles) {
      message.error(`You can only upload up to ${maxFiles} images!`);
      return false;
    }

    // Validate each file
    for (const file of fileList) {
      const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
      if (!isLtMaxSize) {
        message.error(`Each image must be smaller than ${maxSize}MB!`);
        return false;
      }
    }

    setUploading(true);

    try {
      const token = await user?.getIdToken();

      if (!token) {
        message.error("Authentication required!");
        setUploading(false);
        return false;
      }

      // Create FormData
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", folder);

      // Upload to backend
      const response = await axios.post(
        `${getBaseUrl()}/upload/multiple`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        const uploadedUrls = response.data.data.urls;
        const newUrls = [...imageUrls, ...uploadedUrls];
        setImageUrls(newUrls);
        onUploadComplete(newUrls);
        message.success(`${uploadedUrls.length} images uploaded successfully!`);
      } else {
        message.error("Upload failed!");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Upload error:", error);
      message.error(error?.response?.data?.message || "Upload failed!");
    } finally {
      setUploading(false);
    }

    return false;
  };

  const handleDelete = async (url: string) => {
    try {
      const token = await user?.getIdToken();

      if (!token) {
        message.error("Authentication required!");
        return;
      }

      // Delete from Cloudinary
      await axios.post(
        `${getBaseUrl()}/upload/delete`,
        { url },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newUrls = imageUrls.filter((u) => u !== url);
      setImageUrls(newUrls);
      onUploadComplete(newUrls);
      if (onDelete) onDelete(url);
      message.success("Image deleted successfully!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Delete error:", error);
      message.error("Failed to delete image!");
    }
  };

  return (
    <div>
      <label style={{ display: "block", marginBottom: "8px" }}>{label}</label>

      {imageUrls.length > 0 && (
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {imageUrls.map((url, index) => (
            <div key={index} style={{ position: "relative" }}>
              <Image src={url} alt={`Image ${index + 1}`} width={150} />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(url)}
                size="small"
                style={{ marginTop: "4px", width: "100%" }}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}

      {imageUrls.length < maxFiles && (
        <Upload
          accept={accept}
          beforeUpload={(file, fileList) => {
            handleUpload(fileList);
            return false;
          }}
          showUploadList={false}
          multiple
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploading
              ? "Uploading..."
              : `Upload Images (${imageUrls.length}/${maxFiles})`}
          </Button>
        </Upload>
      )}

      <small style={{ color: "#888", display: "block", marginTop: "4px" }}>
        Accepted formats: PNG, JPEG, JPG, WebP (Max: {maxSize}MB each,{" "}
        {maxFiles} files total)
      </small>
    </div>
  );
};

export default MultipleImageUpload;
