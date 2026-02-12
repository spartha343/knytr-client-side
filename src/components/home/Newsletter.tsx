"use client";

import { Input, Button, Typography, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Title, Text } = Typography;

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      message.warning("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error("Please enter a valid email");
      return;
    }

    setLoading(true);

    // TODO: Implement newsletter subscription API
    setTimeout(() => {
      message.success("Successfully subscribed to newsletter!");
      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        padding: "64px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <MailOutlined
          style={{ fontSize: "64px", color: "#1890ff", marginBottom: "24px" }}
        />
        <Title level={2}>Subscribe to Our Newsletter</Title>
        <Text
          style={{ fontSize: "16px", display: "block", marginBottom: "32px" }}
        >
          Get the latest updates on new products, special offers, and exclusive
          deals delivered to your inbox!
        </Text>

        <div
          style={{
            display: "flex",
            gap: "8px",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <Input
            size="large"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onPressEnter={handleSubscribe}
            prefix={<MailOutlined />}
          />
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubscribe}
          >
            Subscribe
          </Button>
        </div>

        <Text
          type="secondary"
          style={{ fontSize: "12px", display: "block", marginTop: "16px" }}
        >
          We respect your privacy. Unsubscribe at any time.
        </Text>
      </div>
    </div>
  );
};

export default Newsletter;
