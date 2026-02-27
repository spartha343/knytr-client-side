"use client";

import { usePathname, useRouter } from "next/navigation";
import { Badge, Drawer, Button, Space, message } from "antd";
import {
  HomeOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DashboardOutlined,
  OrderedListOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useState } from "react";
import Link from "next/link";
import SignIn from "@/components/SignIn/SignIn";
import SignUp from "@/components/SignUp/SignUp";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase.config";
import type { ICart } from "@/types/cart";
import dynamic from "next/dynamic";

// Render cart badge only on client to avoid hydration mismatch
const CartBadge = dynamic(
  () =>
    Promise.resolve(
      ({
        count,
        icon,
        color,
      }: {
        count: number;
        icon: React.ReactNode;
        color: string;
      }) =>
        count > 0 ? (
          <Badge count={count} size="small">
            <div style={{ fontSize: "24px", color }}>{icon}</div>
          </Badge>
        ) : (
          <div style={{ fontSize: "24px", color }}>{icon}</div>
        ),
    ),
  { ssr: false },
);

const MobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { dbUser, isAuthenticated } = useAuth();
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Guest cart count
  const { itemCount: guestCartCount } = useGuestCart();

  // DB cart count
  const { data: dbCartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dbCart = dbCartResponse as ICart | undefined;

  const cartCount = isAuthenticated
    ? dbCart?.items?.reduce((total, item) => total + item.quantity, 0) || 0
    : guestCartCount;

  // Don't show on dashboard or auth pages
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/sign-")) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      message.success("Signed out successfully");
      setAccountDrawerOpen(false);
      router.push("/");
    } catch {
      message.error("Failed to sign out");
    }
  };

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
      badge: true,
    },
    {
      key: "me",
      label: "Me",
      icon: <UserOutlined />,
      path: null,
      badge: false,
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
          const isActive = item.path
            ? pathname === item.path
            : accountDrawerOpen;
          const iconColor = isActive ? "#1890ff" : "#666";

          return (
            <div
              key={item.key}
              onClick={() => {
                if (item.key === "me") {
                  setAccountDrawerOpen(true);
                  setAuthMode("signin");
                } else if (item.path) {
                  router.push(item.path);
                }
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                color: iconColor,
                flex: 1,
              }}
            >
              {item.key === "cart" ? (
                <CartBadge
                  count={cartCount}
                  icon={item.icon}
                  color={iconColor}
                />
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

      {/* Account Drawer */}
      <Drawer
        title={
          isAuthenticated && dbUser
            ? `Hi, ${dbUser.email?.split("@")[0] || "there"} 👋`
            : authMode === "signin"
              ? "Sign In"
              : "Sign Up"
        }
        placement="bottom"
        size={isAuthenticated && dbUser ? "default" : "large"}
        onClose={() => setAccountDrawerOpen(false)}
        open={accountDrawerOpen}
      >
        {isAuthenticated && dbUser ? (
          <Space orientation="vertical" style={{ width: "100%" }} size="middle">
            <Link href="/orders" onClick={() => setAccountDrawerOpen(false)}>
              <Button
                icon={<OrderedListOutlined />}
                style={{ width: "100%", textAlign: "left" }}
                size="large"
              >
                My Orders
              </Button>
            </Link>
            <Link href="/dashboard" onClick={() => setAccountDrawerOpen(false)}>
              <Button
                icon={<DashboardOutlined />}
                style={{ width: "100%", textAlign: "left" }}
                size="large"
              >
                Dashboard
              </Button>
            </Link>
            <Button
              icon={<LogoutOutlined />}
              danger
              style={{ width: "100%", textAlign: "left" }}
              size="large"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </Space>
        ) : (
          <>
            {authMode === "signin" ? (
              <SignIn onSuccess={() => setAccountDrawerOpen(false)} />
            ) : (
              <SignUp onSuccess={() => setAccountDrawerOpen(false)} />
            )}
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              {authMode === "signin" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <Button type="link" onClick={() => setAuthMode("signup")}>
                    Sign Up
                  </Button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <Button type="link" onClick={() => setAuthMode("signin")}>
                    Sign In
                  </Button>
                </p>
              )}
              <Button
                type="default"
                block
                onClick={() => setAccountDrawerOpen(false)}
                style={{ marginTop: "8px", color: "#999" }}
              >
                Continue as Guest
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
};

export default MobileBottomNav;
