import ProtectedRoutes from "@/components/routes/ProtectedRoutes/ProtectedRoutes";
import { ROLE } from "@/types/authTypes";
import { ReactNode } from "react";

export default function CustomerPagesProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoutes requiredRoles={[ROLE.CUSTOMER]}>
      {children}
    </ProtectedRoutes>
  );
}
