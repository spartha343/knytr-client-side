"use client";

import { Card, Button, Space, Avatar } from "antd";
import {
  PhoneOutlined,
  WhatsAppOutlined,
  ShopOutlined,
} from "@ant-design/icons";

interface StoreContactCardProps {
  storeName: string;
  storeLogo?: string | null;
  contactPhone?: string | null;
  whatsappNumber?: string | null;
}

const StoreContactCard = ({
  storeName,
  storeLogo,
  contactPhone,
  whatsappNumber,
}: StoreContactCardProps) => {
  const handlePhoneClick = () => {
    if (contactPhone) {
      window.location.href = `tel:${contactPhone}`;
    }
  };

  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      const phoneNumber = whatsappNumber.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${phoneNumber}`, "_blank");
    }
  };

  return (
    <Card
      title={
        <span>
          <ShopOutlined style={{ marginRight: 8 }} />
          Contact Vendor
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Store Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {storeLogo ? (
            <Avatar size={64} src={storeLogo} />
          ) : (
            <Avatar size={64} icon={<ShopOutlined />} />
          )}
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>{storeName}</h3>
            <p style={{ margin: 0, color: "#888", fontSize: 12 }}>
              Need help with your order? Contact the vendor
            </p>
          </div>
        </div>

        {/* Contact Buttons */}
        <Space wrap style={{ width: "100%" }}>
          {contactPhone && (
            <Button
              type="primary"
              icon={<PhoneOutlined />}
              onClick={handlePhoneClick}
              size="large"
              style={{ flex: 1, minWidth: 150 }}
            >
              Call Now
            </Button>
          )}

          {whatsappNumber && (
            <Button
              style={{
                background: "#25D366",
                borderColor: "#25D366",
                color: "white",
                flex: 1,
                minWidth: 150,
              }}
              icon={<WhatsAppOutlined />}
              onClick={handleWhatsAppClick}
              size="large"
            >
              WhatsApp
            </Button>
          )}
        </Space>

        {/* Contact Info Display */}
        {(contactPhone || whatsappNumber) && (
          <div
            style={{
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: 8,
              fontSize: 12,
            }}
          >
            {contactPhone && (
              <div style={{ marginBottom: whatsappNumber ? 4 : 0 }}>
                <PhoneOutlined style={{ marginRight: 8 }} />
                {contactPhone}
              </div>
            )}
            {whatsappNumber && (
              <div>
                <WhatsAppOutlined style={{ marginRight: 8 }} />
                {whatsappNumber}
              </div>
            )}
          </div>
        )}

        {!contactPhone && !whatsappNumber && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              color: "#999",
              fontSize: 12,
            }}
          >
            Contact information not available
          </div>
        )}
      </div>
    </Card>
  );
};

export default StoreContactCard;
