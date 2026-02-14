import { useState, useMemo } from "react";
import { Card, Row, Col } from "antd";
import Image from "next/image";

interface ProductMedia {
  id: string;
  mediaUrl: string;
  isPrimary?: boolean;
  order?: number | null;
}

interface ProductImageGalleryProps {
  productName: string;
  media: ProductMedia[];
}

export const ProductImageGallery = ({
  productName,
  media,
}: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number>(0);

  const productImages = useMemo(() => {
    if (!media || media.length === 0) return [];

    // Create a copy before sorting (Redux state is read-only)
    return [...media].sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return (a.order || 0) - (b.order || 0);
    });
  }, [media]);

  return (
    <Card>
      {/* Main Image */}
      <div
        style={{
          width: "100%",
          height: "400px",
          position: "relative",
          marginBottom: "16px",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#f5f5f5",
        }}
      >
        {productImages.length > 0 ? (
          <Image
            src={productImages[selectedImage]?.mediaUrl}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              objectFit: "cover", // This will fill the full width and height
            }}
            priority
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            No Image Available
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {productImages.length > 1 && (
        <Row gutter={[8, 8]}>
          {productImages.map((img, index) => (
            <Col key={img.id} span={6}>
              <div
                onClick={() => setSelectedImage(index)}
                style={{
                  width: "100%",
                  height: "80px",
                  position: "relative",
                  borderRadius: "4px",
                  overflow: "hidden",
                  cursor: "pointer",
                  border:
                    selectedImage === index
                      ? "2px solid #1890ff"
                      : "2px solid transparent",
                }}
              >
                <Image
                  src={img.mediaUrl}
                  alt={`${productName} - ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 20vw, 10vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};
