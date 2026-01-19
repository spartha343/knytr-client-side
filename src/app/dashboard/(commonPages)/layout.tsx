import ProtectedRoutes from "@/components/routes/ProtectedRoutes/ProtectedRoutes";
import { ReactNode } from "react";

export default function CommonPagesProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProtectedRoutes>{children}</ProtectedRoutes>;
}
