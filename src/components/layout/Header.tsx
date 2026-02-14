"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layout,
  Input,
  Badge,
  Dropdown,
  Avatar,
  Button,
  Drawer,
  Menu,
  Space,
  message,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  UserOutlined,
  BellOutlined,
  MenuOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useGetCartQuery } from "@/redux/api/cartApi";
import { useGuestCart } from "@/hooks/useGuestCart";
import SignIn from "@/components/SignIn/SignIn";
import SignUp from "@/components/SignUp/SignUp";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase.config";
import type { ICart } from "@/types/cart";

const { Header: AntHeader } = Layout;
const { Search } = Input;

const Header = () => {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const { dbUser, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Intentional: Prevent hydration mismatch with auth state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Guest cart count using hook
  const { itemCount: guestCartCount } = useGuestCart();

  // Get DB cart count for authenticated users
  const { data: dbCartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const dbCart = dbCartResponse as ICart | undefined;

  // Calculate cart count
  const cartCount = isAuthenticated
    ? dbCart?.items?.reduce((total, item) => total + item.quantity, 0) || 0
    : guestCartCount;

  // Wishlist count (TODO: Implement wishlist)
  const wishlistCount = 0;

  // Notifications count (TODO: Implement notifications)
  const notificationsCount = 0;

  const handleSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setAuthDrawerOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode("signup");
    setAuthDrawerOpen(true);
  };

  // User menu items
  const userMenuItems = dbUser
    ? [
        {
          key: "profile",
          label: <Link href="/dashboard">My Dashboard</Link>,
        },
        {
          key: "orders",
          label: <Link href="/my-orders">My Orders</Link>,
        },
        {
          key: "wishlist",
          label: <Link href="/wishlist">Wishlist</Link>,
        },
        {
          type: "divider" as const,
        },
        {
          key: "signout",
          label: "Sign Out",
          danger: true,
          onClick: async () => {
            try {
              await signOut(auth);
              message.success("Signed out successfully");
              router.push("/");
            } catch (error) {
              message.error("Failed to sign out");
              console.log(error);
            }
          },
        },
      ]
    : [
        {
          key: "signin",
          label: "Sign In",
          onClick: handleSignIn,
        },
        {
          key: "signup",
          label: "Sign Up",
          onClick: handleSignUp,
        },
      ];

  // Mobile menu items
  const mobileMenuItems = [
    { key: "home", label: <Link href="/">Home</Link> },
    { key: "products", label: <Link href="/products">Products</Link> },
    { key: "stores", label: <Link href="/stores">Stores</Link> },
  ];

  return (
    <>
      <AntHeader
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "0 24px",
          height: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* Left: Mobile menu + Language + Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Mobile menu icon */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-only"
              style={{ display: "none" }}
            />

            {/* Language Toggle */}
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={toggleLanguage}
              style={{ fontSize: "16px" }}
            >
              {language.toUpperCase()}
            </Button>

            {/* Logo */}
            <Link
              href="/"
              style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}
            >
              KNYTR
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="desktop-only"
              style={{ marginLeft: "32px", display: "flex", gap: "24px" }}
            >
              <Link href="/" style={{ color: "#333", fontWeight: 500 }}>
                Home
              </Link>
              <Link href="/products" style={{ color: "#333", fontWeight: 500 }}>
                Products
              </Link>
              <Link href="/stores" style={{ color: "#333", fontWeight: 500 }}>
                Stores
              </Link>
            </nav>
          </div>

          {/* Center: Search (Desktop only) */}
          <div
            className="desktop-only"
            style={{ flex: 1, maxWidth: "500px", margin: "0 24px" }}
          >
            <Search
              placeholder="Search products..."
              size="large"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </div>

          {/* Right Side */}
          <Space size="middle">
            <Link href="/products">
              <Button type="text">Products</Button>
            </Link>

            {/* Only render client-side content after mounting to prevent hydration mismatch */}
            {isMounted ? (
              <>
                <Link href="/cart">
                  <Badge count={cartCount} showZero={false}>
                    <ShoppingCartOutlined
                      style={{
                        fontSize: "24px",
                        color: "#333",
                        cursor: "pointer",
                      }}
                    />
                  </Badge>
                </Link>
                <Link href="/wishlist">
                  <Badge count={wishlistCount} showZero={false}>
                    <HeartOutlined
                      style={{
                        fontSize: "24px",
                        color: "#333",
                        cursor: "pointer",
                      }}
                    />
                  </Badge>
                </Link>
                <Badge count={notificationsCount} showZero={false}>
                  <BellOutlined
                    style={{
                      fontSize: "24px",
                      color: "#333",
                      cursor: "pointer",
                    }}
                  />
                </Badge>

                {isAuthenticated && dbUser ? (
                  // ... dropdown menu code (keep as is)
                  <Dropdown
                    menu={{
                      items: userMenuItems,
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Avatar
                      style={{
                        cursor: "pointer",
                        backgroundColor: "#1890ff",
                      }}
                      icon={<UserOutlined />}
                    />
                  </Dropdown>
                ) : (
                  <Link href="/sign-in">
                    <Button type="primary">Sign In</Button>
                  </Link>
                )}
              </>
            ) : (
              // Placeholder during SSR - just show loading state
              <div style={{ width: "200px", height: "32px" }} />
            )}
          </Space>
        </div>
      </AntHeader>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
      >
        <Menu items={mobileMenuItems} mode="vertical" />
      </Drawer>

      {/* Auth Drawer */}
      <Drawer
        title={authMode === "signin" ? "Sign In" : "Sign Up"}
        placement="right"
        onClose={() => setAuthDrawerOpen(false)}
        open={authDrawerOpen}
        size={400}
      >
        {authMode === "signin" ? (
          <SignIn onSuccess={() => setAuthDrawerOpen(false)} />
        ) : (
          <SignUp onSuccess={() => setAuthDrawerOpen(false)} />
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
        </div>
      </Drawer>
    </>
  );
};

export default Header;
