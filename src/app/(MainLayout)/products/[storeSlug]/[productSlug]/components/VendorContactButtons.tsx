"use client";

import { Space, Button, Typography, Divider } from "antd";
import {
  WhatsAppOutlined,
  PhoneOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface VendorContactButtonsProps {
  storeName: string;
  productName: string;
  whatsappNumber?: string;
  messengerLink?: string;
  contactPhone?: string;
}

export const VendorContactButtons = ({
  storeName,
  productName,
  whatsappNumber,
  messengerLink,
  contactPhone,
}: VendorContactButtonsProps) => {
  // Don't render if no contact info available
  if (!whatsappNumber && !messengerLink && !contactPhone) {
    return null;
  }

  /**
   * Format WhatsApp number and create chat link
   * Handles formats: +8801XXXXXXXXX, 8801XXXXXXXXX, 01XXXXXXXXX
   */
  const getWhatsAppLink = (phone: string) => {
    // Remove all non-digit characters
    let cleanPhone = phone.replace(/\D/g, "");

    // If starts with 01, add 880 country code
    if (cleanPhone.startsWith("01")) {
      cleanPhone = "880" + cleanPhone.substring(1);
    }
    // If starts with 8801, it's already correct
    else if (!cleanPhone.startsWith("880")) {
      // Add 880 if not present
      cleanPhone = "880" + cleanPhone;
    }

    const message = encodeURIComponent(
      `Hi ${storeName}, I'm interested in "${productName}". Is this product available?`,
    );

    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  /**
   * Format Messenger link
   * Accepts: https://m.me/username, fb.com/username, or just username
   */
  const getMessengerLink = (link: string) => {
    if (link.startsWith("http")) {
      return link;
    }
    if (link.startsWith("m.me/") || link.startsWith("fb.com/")) {
      return `https://${link}`;
    }
    return `https://m.me/${link}`;
  };

  /**
   * Format phone link for click-to-call
   */
  const getPhoneLink = (phone: string) => {
    return `tel:${phone}`;
  };

  return (
    <>
      <Divider style={{ margin: "16px 0" }} />

      {/* Section Title */}
      <div style={{ marginBottom: "12px" }}>
        <Text strong style={{ fontSize: "16px", color: "#262626" }}>
          📞 Contact Vendor
        </Text>
        <Text
          type="secondary"
          style={{ display: "block", fontSize: "13px", marginTop: "4px" }}
        >
          Have questions? Chat with {storeName} directly
        </Text>
      </div>

      {/* Contact Buttons */}
      <Space
        orientation="horizontal"
        size="small"
        style={{
          width: "100%",
          marginTop: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {/* WhatsApp Button */}
        {whatsappNumber && (
          <Button
            type="default"
            size="small"
            icon={<WhatsAppOutlined />}
            block
            href={getWhatsAppLink(whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#25D366",
              borderColor: "#25D366",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 500,
              height: "40px",
              fontSize: "13px",
              flex: "1",
              minWidth: "140px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1EBE57";
              e.currentTarget.style.borderColor = "#1EBE57";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#25D366";
              e.currentTarget.style.borderColor = "#25D366";
            }}
          >
            <span style={{ marginLeft: "8px" }}>Chat on WhatsApp</span>
          </Button>
        )}

        {/* Messenger Button */}
        {messengerLink && (
          <Button
            type="default"
            size="small"
            icon={<MessageOutlined />}
            block
            href={getMessengerLink(messengerLink)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#0084FF",
              borderColor: "#0084FF",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 500,
              height: "40px",
              fontSize: "13px",
              flex: "1",
              minWidth: "140px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0073E6";
              e.currentTarget.style.borderColor = "#0073E6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#0084FF";
              e.currentTarget.style.borderColor = "#0084FF";
            }}
          >
            <span style={{ marginLeft: "8px" }}>Message on Messenger</span>
          </Button>
        )}

        {/* Phone Button */}
        {contactPhone && (
          <Button
            type="default"
            size="small"
            icon={<PhoneOutlined />}
            block
            href={getPhoneLink(contactPhone)}
            style={{
              backgroundColor: "#ff6b35f2",
              borderColor: "#FF6B35",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 500,
              height: "40px",
              fontSize: "13px",
              flex: "1",
              minWidth: "140px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E65A2E";
              e.currentTarget.style.borderColor = "#E65A2E";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FF6B35";
              e.currentTarget.style.borderColor = "#FF6B35";
            }}
          >
            <span style={{ marginLeft: "8px" }}>Call {storeName}</span>
          </Button>
        )}
      </Space>

      <Divider style={{ margin: "16px 0" }} />
    </>
  );
};
