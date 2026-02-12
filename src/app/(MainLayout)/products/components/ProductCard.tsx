import { Card, Button, Typography, Badge } from "antd";
import { ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { IProduct } from "@/types/product";

const { Text } = Typography;

interface ProductCardProps {
  product: IProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Get product image
  const getProductImage = () => {
    if (!product.media || product.media.length === 0) return null;
    const primaryImage = product.media.find((m) => m.isPrimary);
    return primaryImage?.mediaUrl || product.media[0]?.mediaUrl;
  };

  // Calculate discount
  const calculateDiscount = () => {
    if (!product.comparePrice || product.comparePrice <= product.basePrice) {
      return 0;
    }
    return Math.round(
      ((product.comparePrice - product.basePrice) / product.comparePrice) * 100,
    );
  };

  const imageUrl = getProductImage();
  const discount = calculateDiscount();

  return (
    <Card
      hoverable
      styles={{
        body: { padding: "12px" },
        actions: { margin: 0, padding: 0 }, // Remove default margin/padding
      }}
      cover={
        <Link href={`/products/${product.slug}`}>
          <div
            style={{
              height: "180px",
              position: "relative",
              overflow: "hidden",
              borderRadius: "8px 8px 0 0",
            }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                style={{ objectFit: "cover", borderRadius: "8px 8px 0 0" }}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                No Image
              </div>
            )}
            {discount > 0 && (
              <Badge.Ribbon text={`-${discount}%`} color="red" />
            )}
          </div>
        </Link>
      }
      actions={[
        <Button
          key="cart"
          type="text"
          block
          size="large"
          icon={<ShoppingCartOutlined style={{ fontSize: "20px" }} />}
          onClick={() => console.log("Add to cart:", product.id)}
          style={{
            height: "44px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: 0,
          }}
        />,
        <Button
          key="wishlist"
          type="text"
          block
          size="large"
          icon={<HeartOutlined style={{ fontSize: "20px" }} />}
          onClick={() => console.log("Add to wishlist:", product.id)}
          style={{
            height: "44px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: 0,
          }}
        />,
      ]}
    >
      <Link href={`/products/${product.slug}`}>
        <Card.Meta
          title={
            <div
              style={{
                height: "36px",
                overflow: "hidden",
                fontSize: "13px",
                lineHeight: "18px",
              }}
            >
              {product.name}
            </div>
          }
          description={
            <div>
              <Text strong style={{ fontSize: "15px", color: "#1890ff" }}>
                ৳{product.basePrice.toLocaleString()}
              </Text>
              {product.comparePrice &&
                product.comparePrice > product.basePrice && (
                  <>
                    {" "}
                    <Text delete style={{ color: "#999", fontSize: "12px" }}>
                      ৳{product.comparePrice.toLocaleString()}
                    </Text>
                  </>
                )}
            </div>
          }
        />
      </Link>
    </Card>
  );
};

export default ProductCard;
