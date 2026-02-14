"use client";

import { Form, Input } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";

interface CustomerInfoStepProps {
  customerPhone: string;
  customerName: string;
  customerEmail: string;
  onPhoneChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

const CustomerInfoStep = ({
  customerPhone,
  customerName,
  customerEmail,
  onPhoneChange,
  onNameChange,
  onEmailChange,
}: CustomerInfoStepProps) => {
  // Email validation
  const isValidEmail = (email: string) => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Form layout="vertical">
        {/* Phone Number - Required */}
        <Form.Item
          label={
            <span>
              <PhoneOutlined /> Customer Phone Number
            </span>
          }
          required
          validateStatus={
            customerPhone && customerPhone.length < 11 ? "error" : ""
          }
          help={
            customerPhone && customerPhone.length < 11
              ? "Phone number must be at least 11 digits"
              : "Required field - used as primary identifier"
          }
        >
          <Input
            placeholder="Enter customer phone number"
            value={customerPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            size="large"
            maxLength={15}
          />
        </Form.Item>

        {/* Customer Name - Optional */}
        <Form.Item
          label={
            <span>
              <UserOutlined /> Customer Name
            </span>
          }
          help="Optional - helps identify the customer"
        >
          <Input
            placeholder="Enter customer name (optional)"
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            size="large"
          />
        </Form.Item>

        {/* Customer Email - Optional */}
        <Form.Item
          label={
            <span>
              <MailOutlined /> Customer Email
            </span>
          }
          validateStatus={!isValidEmail(customerEmail) ? "error" : ""}
          help={
            !isValidEmail(customerEmail)
              ? "Please enter a valid email address"
              : "Optional - for order confirmation emails"
          }
        >
          <Input
            placeholder="Enter customer email (optional)"
            value={customerEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            size="large"
            type="email"
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default CustomerInfoStep;
