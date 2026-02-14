/**
 * ProductSpecifications Component
 * Displays product specifications in sections
 */

import { Typography, Card, Row, Col } from "antd";

const { Title, Text } = Typography;

interface SectionItem {
  id: string;
  label?: string;
  value: string;
}

interface ProductSection {
  id: string;
  title: string;
  items?: SectionItem[];
}

interface ProductSpecificationsProps {
  sections: ProductSection[];
}

export const ProductSpecifications = ({
  sections,
}: ProductSpecificationsProps) => {
  if (!sections || sections.length === 0) return null;

  return (
    <div style={{ marginTop: "24px" }}>
      <Title level={4}>Specifications</Title>
      {sections.map((section) => (
        <Card
          key={section.id}
          title={section.title}
          style={{ marginBottom: "16px" }}
          size="small"
        >
          {section.items?.map((item) => (
            <Row
              key={item.id}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Col span={12}>
                <Text strong>{item.label || "Property"}:</Text>
              </Col>
              <Col span={12}>
                <Text>{item.value}</Text>
              </Col>
            </Row>
          ))}
        </Card>
      ))}
    </div>
  );
};
