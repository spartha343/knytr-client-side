"use client";

import { useState } from "react";
import { Upload, message, Button, Image } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios";
import { auth } from "@/firebase/firebase.config";
import { getBaseUrl } from "@/helpers/config/envConfig";

interface ImageUploadProps {
  folder: string; // Cloudinary folder (e.g., "stores/logos")
  maxSize?: number; // Max file size in MB (default: 5)
  accept?: string; // Accepted file types
  onUploadComplete: (url: string) => void; // Callback when upload succeeds
  currentImage?: string; // Current image URL (for edit mode)
  onDelete?: () => void; // Callback when image is deleted
  label?: string; // Label for the upload area
}

const ImageUpload = ({
  folder,
  maxSize = 5,
  accept = "image/png,image/jpeg,image/jpg,image/webp",
  onUploadComplete,
  currentImage,
  onDelete,
  label = "Upload Image",
}: ImageUploadProps) => {
  const [user] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(currentImage);

  const handleUpload = async (file: File) => {
    // Validate file size
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`Image must be smaller than ${maxSize}MB!`);
      return false;
    }

    // Validate file type
    const isValidType = accept
      .split(",")
      .some((type) => file.type.includes(type.replace("image/", "")));
    if (!isValidType) {
      message.error("Invalid file type!");
      return false;
    }

    setUploading(true);

    try {
      // Get Firebase token
      const token = await user?.getIdToken();

      if (!token) {
        message.error("Authentication required!");
        setUploading(false);
        return false;
      }

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      // Upload to backend
      const response = await axios.post(
        `${getBaseUrl()}/upload/single`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        const uploadedUrl = response.data.data.url;
        setImageUrl(uploadedUrl);
        onUploadComplete(uploadedUrl);
        message.success("Image uploaded successfully!");
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

    return false; // Prevent default upload behavior
  };

  const handleDelete = async () => {
    if (!imageUrl) return;

    try {
      const token = await user?.getIdToken();

      if (!token) {
        message.error("Authentication required!");
        return;
      }

      // Delete from Cloudinary
      await axios.post(
        `${getBaseUrl()}/upload/delete`,
        { url: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setImageUrl(undefined);
      if (onDelete) onDelete();
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

      {imageUrl ? (
        <div style={{ marginBottom: "16px" }}>
          <Image
            src={imageUrl}
            alt="Uploaded"
            width={200}
            style={{ marginBottom: "8px" }}
          />
          <br />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            size="small"
          >
            Delete Image
          </Button>
        </div>
      ) : (
        <Upload
          accept={accept}
          beforeUpload={handleUpload}
          showUploadList={false}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploading ? "Uploading..." : "Click to Upload"}
          </Button>
        </Upload>
      )}

      <small style={{ color: "#888", display: "block", marginTop: "4px" }}>
        Accepted formats: PNG, JPEG, JPG, WebP (Max: {maxSize}MB)
      </small>
    </div>
  );
};

export default ImageUpload;
