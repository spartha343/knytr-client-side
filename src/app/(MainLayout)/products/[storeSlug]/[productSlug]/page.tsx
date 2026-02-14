"use client";

/**
 * Product Detail Page - Modular Architecture
 * Main orchestrator that uses smaller, focused components
 */
import { useGuestCart } from "@/hooks/useGuestCart";
import { useGetCartQuery } from "@/redux/api/cartApi";
import type { ICart } from "@/types/cart";
import { useParams, useRouter } from "next/navigation";
import { Row, Col, Spin, Button, Typography, Divider, message } from "antd";
import Link from "next/link";
import { useState, useMemo } from "react";
import Container from "@/components/shared/Container";
import {
  useGetPublicProductByStoreAndSlugQuery,
  useGetSimilarProductsQuery,
} from "@/redux/api/publicProductApi";
import { useAddToCartMutation } from "@/redux/api/cartApi";
import { GuestCartManager } from "@/utils/guestCart";
import { useAuth } from "@/hooks/useAuth";

// Import all modular components
import { ProductBreadcrumb } from "./components/ProductBreadcrumb";
import { ProductImageGallery } from "./components/ProductImageGallery";
import { ProductInfo } from "./components/ProductInfo";
import { ProductPricing } from "./components/ProductPricing";
import { ProductStockStatus } from "./components/ProductStockStatus";
import { ProductVariantSelector } from "./components/ProductVariantSelector";
import { ProductQuantitySelector } from "./components/ProductQuantitySelector";
import { ProductActionButtons } from "./components/ProductActionButtons";
import { ProductDescription } from "./components/ProductDescription";
import { ProductSpecifications } from "./components/ProductSpecifications";
import { SimilarProducts } from "./components/SimilarProducts";

const { Title, Paragraph } = Typography;

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items: guestCartItems } = useGuestCart();
  const { data: dbCartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dbCart = dbCartResponse as ICart | undefined;
  const storeSlug = params.storeSlug as string;
  const productSlug = params.productSlug as string;

  // State management
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [quantity, setQuantity] = useState<number>(1);

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
  } = useGetPublicProductByStoreAndSlugQuery({
    storeSlug,
    productSlug,
  });

  // Fetch similar products
  const { data: similarProducts } = useGetSimilarProductsQuery(
    product?.id || "",
    {
      skip: !product?.id,
    },
  );

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  // Get selected variant or use first variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    if (selectedVariantId) {
      return (
        product.variants.find((v) => v.id === selectedVariantId) ||
        product.variants[0]
      );
    }
    return product.variants[0];
  }, [product, selectedVariantId]);

  // Check if current variant is in cart
  const isAddedToCart = useMemo(() => {
    if (!product || !selectedVariant) return false;

    if (isAuthenticated) {
      // Check DB cart
      return (
        dbCart?.items?.some(
          (item) =>
            item.productId === product.id &&
            item.variantId === selectedVariant.id,
        ) || false
      );
    } else {
      // Check guest cart
      return guestCartItems.some(
        (item) =>
          item.productId === product.id &&
          item.variantId === selectedVariant.id,
      );
    }
  }, [isAuthenticated, dbCart, guestCartItems, product, selectedVariant]);

  // Calculate available stock
  const availableStock = useMemo(() => {
    if (
      !selectedVariant?.inventories ||
      selectedVariant.inventories.length === 0
    ) {
      return 0;
    }
    return selectedVariant.inventories.reduce(
      (total, inv) => total + (inv.quantity - inv.reservedQty),
      0,
    );
  }, [selectedVariant]);

  // Calculate total stock
  const totalStock = useMemo(() => {
    if (!selectedVariant?.inventories) return 0;
    return selectedVariant.inventories.reduce(
      (sum, inv) => sum + (inv.quantity - inv.reservedQty),
      0,
    );
  }, [selectedVariant]);

  // Handlers
  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;

    // If already in cart, navigate to cart page
    if (isAddedToCart) {
      router.push("/cart");
      return;
    }

    try {
      if (isAuthenticated) {
        // Add to DB cart
        await addToCart({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity,
        }).unwrap();
        message.success("Added to cart!");
      } else {
        // Add to guest cart
        GuestCartManager.add({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity,
          priceSnapshot: Number(selectedVariant.price),
          productName: product.name,
          productSlug: product.slug,
          storeId: product.store?.id || product.storeId,
          storeName: product.store?.name || "Unknown Store",
          storeSlug: storeSlug,
          imageUrl: selectedVariant.imageUrl || product.media?.[0]?.mediaUrl,
          comparePrice: selectedVariant.comparePrice,
        });
        message.success("Added to cart!");
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      message.error(err?.data?.message || "Failed to add to cart");
    }
  };
  const handleAddToWishlist = () => {
    message.info("Wishlist feature coming soon!");
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Title level={3}>Product Not Found</Title>
          <Paragraph>
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </Paragraph>
          <Link href="/products">
            <Button type="primary">Browse Products</Button>
          </Link>
        </div>
      </Container>
    );
  }

  // Calculate current price
  const currentPrice = selectedVariant?.price || product.basePrice;
  const currentComparePrice =
    selectedVariant?.comparePrice || product.comparePrice;

  return (
    <Container>
      {/* Breadcrumb Navigation */}
      <ProductBreadcrumb
        categoryName={product.category?.name}
        productName={product.name}
      />

      {/* Main Product Section */}
      <Row gutter={[32, 32]} style={{ marginBottom: "40px" }}>
        {/* Left Column: Product Images */}
        <Col xs={24} md={12}>
          <ProductImageGallery
            productName={product.name}
            media={product.media || []}
          />
        </Col>

        {/* Right Column: Product Information */}
        <Col xs={24} md={12}>
          {/* Store, Title, Brand, Category */}
          <ProductInfo
            productName={product.name}
            store={product.store}
            brand={product.brand}
            category={product.category}
          />

          {/* Price Section */}
          <ProductPricing
            currentPrice={currentPrice}
            comparePrice={currentComparePrice}
            freeShipping={product.freeShipping}
          />

          {/* Stock Status */}
          <ProductStockStatus totalStock={totalStock} />

          {/* Variant Selection */}
          <ProductVariantSelector
            variants={product.variants || []}
            selectedVariantId={selectedVariantId}
            onVariantSelect={setSelectedVariantId}
          />

          {/* Quantity Selector */}
          <ProductQuantitySelector
            quantity={quantity}
            maxStock={totalStock}
            onQuantityChange={setQuantity}
          />

          {/* Action Buttons */}
          <ProductActionButtons
            availableStock={availableStock}
            isAddingToCart={isAddingToCart}
            isAddedToCart={isAddedToCart}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            hasSelectedVariant={!!selectedVariant}
          />

          <Divider />

          {/* Product Description */}
          <ProductDescription description={product.description || ""} />

          {/* Product Specifications */}
          <ProductSpecifications sections={product.sections || []} />
        </Col>
      </Row>

      {/* Similar Products */}
      <SimilarProducts products={similarProducts || []} />
    </Container>
  );
};

export default ProductDetailPage;
