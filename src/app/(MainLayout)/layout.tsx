"use client";

import { Layout } from "antd";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

const { Content } = Layout;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />
      <Content style={{ backgroundColor: "#fff" }}>{children}</Content>
      <Footer />
      <MobileBottomNav />
    </Layout>
  );
}
