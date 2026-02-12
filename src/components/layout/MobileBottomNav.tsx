"use client";

import { usePathname, useRouter } from "next/navigation";
import { Badge } from "antd";
import {
  HomeOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";

const MobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { dbUser } = useAuth();

  // Don't show on dashboard or auth pages
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/sign-")) {
    return null;
  }

  const cartCount = 0; // TODO: Get from cart context

  const navItems = [
    { key: "home", label: "Home", icon: <HomeOutlined />, path: "/" },
    {
      key: "shop",
      label: "Shop",
      icon: <ShoppingOutlined />,
      path: "/products",
    },
    {
      key: "cart",
      label: "Cart",
      icon: <ShoppingCartOutlined />,
      path: "/cart",
      badge: cartCount,
    },
    {
      key: "me",
      label: "Me",
      icon: <UserOutlined />,
      path: dbUser ? "/dashboard" : "/sign-in",
    },
  ];

  return (
    <>
      <div
        className="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTop: "1px solid #f0f0f0",
          display: "none",
          justifyContent: "space-around",
          padding: "8px 0",
          zIndex: 1000,
          boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <div
              key={item.key}
              onClick={() => router.push(item.path)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                color: isActive ? "#1890ff" : "#666",
                flex: 1,
              }}
            >
              {item.badge !== undefined && item.badge > 0 ? (
                <Badge count={item.badge} size="small">
                  <div style={{ fontSize: "24px" }}>{item.icon}</div>
                </Badge>
              ) : (
                <div style={{ fontSize: "24px" }}>{item.icon}</div>
              )}
              <span style={{ fontSize: "12px", marginTop: "4px" }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MobileBottomNav;
