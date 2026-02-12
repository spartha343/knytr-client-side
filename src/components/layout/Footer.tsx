"use client";

import Link from "next/link";
import { Layout, Row, Col, Space, Typography } from "antd";
import {
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  WhatsAppOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        backgroundColor: "#001529",
        color: "#fff",
        padding: "48px 24px 24px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Main Footer Content */}
        <Row gutter={[32, 32]}>
          {/* Column 1: About Us */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: "#fff" }}>
              About KNYTR
            </Title>
            <Space orientation="vertical" size="small">
              <Link href="/about" style={{ color: "rgba(255,255,255,0.7)" }}>
                Our Story
              </Link>
              <Link
                href="/how-it-works"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                How It Works
              </Link>
              <Link href="/careers" style={{ color: "rgba(255,255,255,0.7)" }}>
                Careers
              </Link>
              <Link href="/blog" style={{ color: "rgba(255,255,255,0.7)" }}>
                Blog
              </Link>
            </Space>
          </Col>

          {/* Column 2: Customer Service */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: "#fff" }}>
              Customer Service
            </Title>
            <Space orientation="vertical" size="small">
              <Link href="/help" style={{ color: "rgba(255,255,255,0.7)" }}>
                Help Center
              </Link>
              <Link href="/faq" style={{ color: "rgba(255,255,255,0.7)" }}>
                FAQ
              </Link>
              <Link href="/shipping" style={{ color: "rgba(255,255,255,0.7)" }}>
                Shipping Info
              </Link>
              <Link href="/returns" style={{ color: "rgba(255,255,255,0.7)" }}>
                Returns & Refunds
              </Link>
              <Link
                href="/track-order"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Track Order
              </Link>
            </Space>
          </Col>

          {/* Column 3: Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: "#fff" }}>
              Quick Links
            </Title>
            <Space orientation="vertical" size="small">
              <Link
                href="/dashboard"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                My Account
              </Link>
              <Link href="/wishlist" style={{ color: "rgba(255,255,255,0.7)" }}>
                Wishlist
              </Link>
              <Link
                href="/dashboard/request-role"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Become a Vendor
              </Link>
              <Link
                href="/privacy-policy"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ color: "rgba(255,255,255,0.7)" }}>
                Terms & Conditions
              </Link>
            </Space>
          </Col>

          {/* Column 4: Contact & Social */}
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: "#fff" }}>
              Contact Us
            </Title>
            <Space orientation="vertical" size="middle">
              {/* WhatsApp */}
              <a
                href="https://wa.me/8801XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <WhatsAppOutlined style={{ fontSize: "18px" }} />
                +880 1XXX-XXXXXX
              </a>

              {/* Phone */}
              <a
                href="tel:+8801XXXXXXXXX"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <PhoneOutlined style={{ fontSize: "18px" }} />
                +880 1XXX-XXXXXX
              </a>

              {/* Email */}
              <a
                href="mailto:support@knytr.com"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <MailOutlined style={{ fontSize: "18px" }} />
                support@knytr.com
              </a>

              {/* Language Note */}
              <div style={{ marginTop: "16px" }}>
                <Text
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}
                >
                  🇧🇩 Bengali | English available in header
                </Text>
              </div>
            </Space>
          </Col>
        </Row>

        {/* Social Media Row - Centered */}
        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <Title level={4} style={{ color: "#fff", marginBottom: "16px" }}>
            Follow Us
          </Title>
          <Space size="large">
            <a
              href="https://facebook.com/knytr"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff", fontSize: "32px" }}
            >
              <FacebookOutlined />
            </a>
            <a
              href="https://instagram.com/knytr"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff", fontSize: "32px" }}
            >
              <InstagramOutlined />
            </a>
            <a
              href="https://twitter.com/knytr"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff", fontSize: "32px" }}
            >
              <TwitterOutlined />
            </a>
            <a
              href="https://youtube.com/knytr"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff", fontSize: "32px" }}
            >
              <YoutubeOutlined />
            </a>
            <a
              href="https://m.me/knytr"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fff", fontSize: "32px" }}
              title="Messenger"
            >
              💬
            </a>
          </Space>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.5)" }}>
            © {currentYear} KNYTR. All rights reserved. Made with ❤️ in
            Bangladesh 🇧🇩
          </Text>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
