"use client";

import dynamic from "next/dynamic";

const SidebarClient = dynamic(() => import("./SidebarClient"), {
  ssr: false,
});

const Sidebar = () => {
  return <SidebarClient />;
};

export default Sidebar;
