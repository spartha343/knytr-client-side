import ProtectedRoutes from "@/components/routes/ProtectedRoutes/ProtectedRoutes";
import { ROLE } from "@/types/authTypes";
import { ReactNode } from "react";

export default function SuperAdminPagesProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoutes requiredRoles={[ROLE.SUPER_ADMIN]}>
      {children}
    </ProtectedRoutes>
  );
}
