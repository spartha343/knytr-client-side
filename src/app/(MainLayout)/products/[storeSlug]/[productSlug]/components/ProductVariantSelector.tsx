/**
 * ProductVariantSelector Component
 * Allows users to select product variants
 */

import { Typography, Space, Button } from "antd";

const { Text } = Typography;

interface AttributeValue {
  value: string;
}

interface VariantAttribute {
  attributeValue?: AttributeValue;
}

interface Variant {
  id: string;
  sku: string;
  variantAttributes?: VariantAttribute[];
}

interface ProductVariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onVariantSelect: (variantId: string) => void;
}

export const ProductVariantSelector = ({
  variants,
  selectedVariantId,
  onVariantSelect,
}: ProductVariantSelectorProps) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <Text strong style={{ display: "block", marginBottom: "12px" }}>
        Select Variant:
      </Text>
      <Space wrap>
        {variants.map((variant) => {
          const variantLabel =
            variant.variantAttributes
              ?.map((va) => va.attributeValue?.value)
              .join(" / ") || variant.sku;
          const isSelected = selectedVariantId === variant.id;

          return (
            <Button
              key={variant.id}
              type={isSelected ? "primary" : "default"}
              onClick={() => onVariantSelect(variant.id)}
            >
              {variantLabel}
            </Button>
          );
        })}
      </Space>
    </div>
  );
};
