"use client";

import { useEnsureDbUser } from "@/hooks/useEnsureDbUser";
import { RoleType } from "@/types/authTypes";
import { notification, Spin } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo } from "react";

interface ProtectedRoutesProps {
  children: ReactNode;
  allowedRoles?: RoleType[];
}

const FullscreenLoader = ({ tip }: { tip: string }) => (
  <Spin size="large" tip={tip} fullscreen />
);

const ProtectedRoutes = ({ children, allowedRoles }: ProtectedRoutesProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const safePathname = pathname && pathname.startsWith("/") ? pathname : "/";

  const { firebaseUser, firebaseLoading, dbUser, syncing } = useEnsureDbUser();

  const hasRequiredRole = useMemo(() => {
    if (!allowedRoles) return true;
    if (!dbUser) return false;
    return allowedRoles.some((role) => dbUser.roles.includes(role));
  }, [allowedRoles, dbUser]);

  // 🔐 Redirect logic (side effects)
  useEffect(() => {
    if (firebaseLoading || syncing) return;
    if (!firebaseUser) {
      router.replace(`/sign-in?redirect=${safePathname}`);
      return;
    }
    if (dbUser && !hasRequiredRole) {
      notification.error({
        title: "Unauthorized !",
        description: "You don't have permission to access that page !",
        placement: "topRight",
        duration: 5,
        showProgress: true,
      });
      router.replace("/");
      return;
    }
  }, [
    dbUser,
    firebaseLoading,
    firebaseUser,
    hasRequiredRole,
    safePathname,
    router,
    syncing,
  ]);

  // 🌀 Loading states
  if (firebaseLoading || syncing) {
    return <FullscreenLoader tip="Checking your access..." />;
  }

  // ⏳ Waiting for redirect
  if (!firebaseUser || !dbUser || !hasRequiredRole) {
    return <FullscreenLoader tip="Redirecting..." />;
  }

  return <>{children}</>;
};

export default ProtectedRoutes;
