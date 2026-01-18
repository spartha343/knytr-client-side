"use client";

import { sidebarItems } from "@/constants/SidebarItems";
import { ROLE } from "@/types/authTypes";
import { Layout, Menu } from "antd";
import { useState } from "react";

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  //TODO: get the roles dynamically
  const role = [ROLE.CUSTOMER];

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
        items={sidebarItems(role)}
      />
    </Sider>
  );
};

export default Sidebar;
