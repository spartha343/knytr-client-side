/**
 * ProductActionButtons Component
 * Add to cart and wishlist buttons
 */

import { Space, Button } from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  CheckOutlined,
} from "@ant-design/icons";

interface ProductActionButtonsProps {
  availableStock: number;
  isAddingToCart: boolean;
  isAddedToCart: boolean;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
  hasSelectedVariant: boolean;
}

export const ProductActionButtons = ({
  availableStock,
  isAddingToCart,
  isAddedToCart,
  onAddToCart,
  onAddToWishlist,
  hasSelectedVariant,
}: ProductActionButtonsProps) => {
  return (
    <Space size="middle" style={{ width: "100%", marginBottom: "24px" }}>
      <Button
        type={isAddedToCart ? "primary" : "primary"}
        size="large"
        icon={isAddedToCart ? <CheckOutlined /> : <ShoppingCartOutlined />}
        block
        loading={isAddingToCart}
        onClick={onAddToCart}
        disabled={!hasSelectedVariant || !availableStock}
        style={{
          backgroundColor: isAddedToCart ? "#52c41a" : undefined,
          borderColor: isAddedToCart ? "#52c41a" : undefined,
        }}
      >
        {isAddedToCart
          ? "Go to Cart"
          : availableStock
            ? "Add to Cart"
            : "Out of Stock"}
      </Button>
      <Button size="large" icon={<HeartOutlined />} onClick={onAddToWishlist}>
        Wishlist
      </Button>
    </Space>
  );
};
