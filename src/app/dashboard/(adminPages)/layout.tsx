import ProtectedRoutes from "@/components/routes/ProtectedRoutes/ProtectedRoutes";
import { ROLE } from "@/types/authTypes";
import { ReactNode } from "react";

export default function AdminPagesProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoutes allowedRoles={[ROLE.ADMIN]}>{children}</ProtectedRoutes>
  );
}
