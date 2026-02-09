"use client";

import { useState } from "react";
import { Card } from "antd";
import ImageUpload from "@/components/Forms/ImageUpload";
import MultipleImageUpload from "@/components/Forms/MultipleImageUpload";

const TestUploadPage = () => {
  const [singleImageUrl, setSingleImageUrl] = useState<string>("");
  const [multipleImageUrls, setMultipleImageUrls] = useState<string[]>([]);

  return (
    <div style={{ padding: "24px" }}>
      <h1>Test Image Upload</h1>

      <Card title="Single Image Upload" style={{ marginBottom: "24px" }}>
        <ImageUpload
          folder="test/single"
          label="Upload Single Image"
          onUploadComplete={(url) => {
            console.log("Single image uploaded:", url);
            setSingleImageUrl(url);
          }}
          currentImage={singleImageUrl}
          onDelete={() => {
            console.log("Single image deleted");
            setSingleImageUrl("");
          }}
        />
        {singleImageUrl && (
          <div style={{ marginTop: "16px" }}>
            <strong>Uploaded URL:</strong>
            <br />
            <code>{singleImageUrl}</code>
          </div>
        )}
      </Card>

      <Card title="Multiple Images Upload">
        <MultipleImageUpload
          folder="test/multiple"
          label="Upload Multiple Images"
          maxFiles={5}
          onUploadComplete={(urls) => {
            console.log("Multiple images uploaded:", urls);
            setMultipleImageUrls(urls);
          }}
          currentImages={multipleImageUrls}
          onDelete={(url) => {
            console.log("Image deleted:", url);
          }}
        />
        {multipleImageUrls.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <strong>Uploaded URLs:</strong>
            <ul>
              {multipleImageUrls.map((url, index) => (
                <li key={index}>
                  <code>{url}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TestUploadPage;
