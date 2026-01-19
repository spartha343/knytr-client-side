import ProtectedRoutes from "@/components/routes/ProtectedRoutes/ProtectedRoutes";
import { ROLE } from "@/types/authTypes";
import { ReactNode } from "react";

export default function SuperAdminPagesProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoutes allowedRoles={[ROLE.SUPER_ADMIN]}>
      {children}
    </ProtectedRoutes>
  );
}
