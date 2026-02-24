"use client";

import { sidebarItems } from "@/constants/SidebarItems";
import { useAppSelector } from "@/redux/hooks";
import { RoleType } from "@/types/authTypes";
import { Layout, Menu } from "antd";
import { useState } from "react";
import Link from "next/link";

const { Sider } = Layout;

const SidebarClient = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { dbUser } = useAppSelector((state) => state.auth);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={280}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Logo / Brand */}
      <Link href="/" style={{ display: "block", textDecoration: "none" }}>
        <div
          style={{
            color: "white",
            fontSize: collapsed ? "1.2rem" : "1.6rem",
            textAlign: "center",
            fontWeight: "bold",
            padding: "16px 8px 10px",
            lineHeight: 1.2,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {collapsed ? "K" : "Knytr"}
          {!collapsed && (
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 400,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.05em",
                marginTop: 2,
              }}
            >
              ← Back to Store
            </div>
          )}
        </div>
      </Link>

      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={sidebarItems(dbUser?.roles as RoleType[])}
      />
    </Sider>
  );
};

export default SidebarClient;
