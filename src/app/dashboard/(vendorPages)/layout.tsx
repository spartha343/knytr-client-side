import ProtectedRoutes from "@/components/routes/ProtectedRoutes/ProtectedRoutes";
import { ROLE } from "@/types/authTypes";
import { ReactNode } from "react";

export default function VendorPagesProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoutes allowedRoles={[ROLE.VENDOR]}>{children}</ProtectedRoutes>
  );
}
