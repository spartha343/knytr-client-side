import ProtectedRoutes from "@/components/routes/ProtectedRoutes/ProtectedRoutes";
import Contents from "@/components/ui/Contents";
import Sidebar from "@/components/ui/Sidebar";
import { Layout } from "antd";
import { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ProtectedRoutes>
      <Layout hasSider>
        <Sidebar />
        <Contents>{children}</Contents>
      </Layout>
    </ProtectedRoutes>
  );
};

export default DashboardLayout;
