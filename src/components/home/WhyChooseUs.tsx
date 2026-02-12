"use client";

import { Row, Col, Card, Typography } from "antd";
import {
  SafetyOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const WhyChooseUs = () => {
  const features = [
    {
      icon: <SafetyOutlined style={{ fontSize: "48px", color: "#1890ff" }} />,
      title: "Secure Payment",
      description:
        "100% secure payment methods including bKash, Nagad, and cards",
    },
    {
      icon: (
        <ThunderboltOutlined style={{ fontSize: "48px", color: "#52c41a" }} />
      ),
      title: "Fast Delivery",
      description: "Quick delivery across Bangladesh within 2-5 business days",
    },
    {
      icon: (
        <CustomerServiceOutlined
          style={{ fontSize: "48px", color: "#fa8c16" }}
        />
      ),
      title: "24/7 Support",
      description:
        "Round-the-clock customer support via WhatsApp and Messenger",
    },
    {
      icon: <DollarOutlined style={{ fontSize: "48px", color: "#722ed1" }} />,
      title: "Best Prices",
      description:
        "Competitive prices and regular discounts on thousands of products",
    },
  ];

  return (
    <div style={{ padding: "48px 24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "48px" }}>
        Why Choose KNYTR?
      </Title>

      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card
              style={{ textAlign: "center", height: "100%" }}
              variant="borderless"
              hoverable
            >
              <div style={{ marginBottom: "16px" }}>{feature.icon}</div>
              <Title level={4}>{feature.title}</Title>
              <Text type="secondary">{feature.description}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default WhyChooseUs;
