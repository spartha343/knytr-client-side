"use client";

import { sidebarItems } from "@/constants/SidebarItems";
import { useAppSelector } from "@/redux/hooks";
import { RoleType } from "@/types/authTypes";
import { Layout, Menu } from "antd";
import { useState } from "react";

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
      <div
        style={{
          color: "white",
          fontSize: "2rem",
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: ".5rem",
          padding: "10px 0",
        }}
      >
        {collapsed ? "K D" : "Knytr Dashboard"}
      </div>

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
