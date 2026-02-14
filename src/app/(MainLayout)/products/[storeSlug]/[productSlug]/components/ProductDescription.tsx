/**
 * ProductDescription Component
 * Displays product description
 */

import { Typography } from "antd";

const { Title, Paragraph } = Typography;

interface ProductDescriptionProps {
  description: string;
}

export const ProductDescription = ({
  description,
}: ProductDescriptionProps) => {
  if (!description) return null;

  return (
    <div style={{ marginBottom: "24px" }}>
      <Title level={4}>Description</Title>
      <Paragraph style={{ whiteSpace: "pre-wrap" }}>
        {description}
      </Paragraph>
    </div>
  );
};
